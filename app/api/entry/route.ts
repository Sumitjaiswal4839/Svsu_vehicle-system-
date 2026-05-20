import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logToCSV } from '@/lib/csv';
import { uploadPhoto } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';
import { verifyActiveSession } from '@/lib/auth';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');


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
      visitorName, 
      visitorPurpose, 
      visitorContact, 
      visitorPhoto,
      vehicleNo,
      // Legacy fields from old form
      fullName,
      rollNo,
      faculty,
      course,
      semester,
      photoUrl
    } = body;

    let finalPhotoUrl = visitorPhoto || photoUrl;

    // Handle photo upload if provided as base64
    if (finalPhotoUrl && finalPhotoUrl.startsWith('data:image')) {
      const nameForFile = visitorName || fullName || 'anon';
      const fileName = `${isTemporary ? 'visitor' : 'entry'}-${Date.now()}-${nameForFile.replace(/\s+/g, '-')}`;
      try {
        finalPhotoUrl = await uploadPhoto(finalPhotoUrl, fileName);
      } catch (uploadError) {
        console.error('Photo upload failed:', uploadError);
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
        fullName: fullName || null,
        rollNo: rollNo || null,
        faculty: faculty || null,
        course: course || null,
        semester: semester || null,
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
    console.error('Entry API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


