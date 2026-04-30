import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logToCSV } from '@/lib/csv';
import { uploadPhoto } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';
import { verifyActiveSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Verify Session (Force Logout Check)
    const { isValid } = await verifyActiveSession();
    if (!isValid) {
      return NextResponse.json({ error: 'Session expired or terminated. Please login again.' }, { status: 401 });
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

    const entry = await prisma.entryRecord.create({
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


