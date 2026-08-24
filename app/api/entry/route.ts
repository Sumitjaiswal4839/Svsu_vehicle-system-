import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logToCSV } from '@/lib/csv';
import { uploadPhoto } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';
import { verifyActiveSession } from '@/lib/auth';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { JWT_SECRET } from '@/lib/jwt';
import { logger } from '@/lib/logger';
import { sanitizeString } from '@/lib/sanitize';


export async function POST(request: Request) {
  try {
    // Verify Session (Force Logout Check)
    const { isValid } = await verifyActiveSession();
    if (!isValid) {
      return NextResponse.json({ error: 'Session expired or terminated. Please login again.' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let guardBuildingId = null;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const user = await (prisma as any).user.findUnique({ where: { id: payload.id as string } });
        guardBuildingId = user?.buildingId;
      } catch (e) {}
    }



    const body = await request.json();
    const { 
      profileId, 
      isTemporary, 
      visitorName: rawVisitorName, 
      visitorPurpose: rawVisitorPurpose, 
      visitorContact: rawVisitorContact, 
      visitorPhoto,
      vehicleNo,
      // Legacy fields from old form
      fullName: rawFullName,
      rollNo,
      faculty,
      course,
      semester,
      photoUrl
    } = body;

    const visitorName = rawVisitorName ? sanitizeString(rawVisitorName) : rawVisitorName;
    const visitorPurpose = rawVisitorPurpose ? sanitizeString(rawVisitorPurpose) : rawVisitorPurpose;
    const visitorContact = rawVisitorContact ? sanitizeString(rawVisitorContact) : rawVisitorContact;
    const fullName = rawFullName ? sanitizeString(rawFullName) : rawFullName;

    let trustedProfile = null;
    if (profileId) {
      trustedProfile = await prisma.userVehicleProfile.findUnique({ where: { id: profileId } });
      if (!trustedProfile) return NextResponse.json({ error: 'Invalid profile' }, { status: 400 });
    }

    let finalPhotoUrl = visitorPhoto || photoUrl;

    // Handle photo upload if provided as base64
    if (finalPhotoUrl && finalPhotoUrl.startsWith('data:image')) {
      const nameForFile = visitorName || fullName || 'anon';
      const fileName = `${isTemporary ? 'visitor' : 'entry'}-${Date.now()}-${nameForFile.replace(/\s+/g, '-')}`;
      try {
        finalPhotoUrl = await uploadPhoto(finalPhotoUrl, fileName);
      } catch (uploadError) {
        logger.error('Photo upload failed:', uploadError);
        finalPhotoUrl = null;
      }
    }

    const entry: any = await (prisma.entryRecord as any).create({

      data: {
        profileId: profileId || null,
        isTemporary: !!isTemporary,
        visitorName: visitorName || null,
        visitorPurpose: visitorPurpose || null,
        visitorContact: visitorContact || null,
        visitorPhoto: isTemporary ? finalPhotoUrl : null,
        vehicleNo: vehicleNo || null,
        // Legacy fields mapping
        // Legacy fields mapping (Override with trusted profile data if available)
        fullName: trustedProfile?.name || fullName || null,
        rollNo: trustedProfile?.rollNo || rollNo || null,
        faculty: trustedProfile?.faculty || faculty || null,
        course: trustedProfile?.course || course || null,
        semester: trustedProfile?.semester || semester || null,
        photoUrl: !isTemporary ? finalPhotoUrl : null,
        buildingId: guardBuildingId || null,
      },

      include: {
        profile: true
      }
    });

    // Log to CSV for permanent users/entries
    if (!isTemporary) {
      await logToCSV({
        type: 'ENTRY',
        fullName: entry.profile?.name || entry.fullName || 'N/A',
        rollNo: entry.profile?.rollNo || entry.rollNo || 'N/A',
        faculty: entry.profile?.faculty || entry.faculty || 'N/A',
        course: entry.profile?.course || entry.course || 'N/A',
        semester: entry.profile?.semester || entry.semester || 'N/A',
        vehicleNo: entry.profile?.vehicleNo || entry.vehicleNo || 'N/A',
        timestamp: entry.entryTime.toISOString(),
      });
    }

    // Audit Log
    await logAudit({
      action: isTemporary ? 'VISITOR_ADD' : 'ENTRY_AUTH',
      resource: `Vehicle: ${entry.vehicleNo || entry.profile?.vehicleNo}`,
      metadata: { entryId: entry.id, type: isTemporary ? 'visitor' : 'student' }
    });

    return NextResponse.json({ message: 'Entry registered successfully', entry }, { status: 201 });
  } catch (error) {
    logger.error('Entry API failed', { error: String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


