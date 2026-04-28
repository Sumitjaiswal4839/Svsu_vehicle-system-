import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logToCSV } from '@/lib/csv';

export async function POST(request: Request) {
  try {
    const { vehicleNo, profileId, entryId } = await request.json();

    if (!vehicleNo && !profileId && !entryId) {
      return NextResponse.json({ error: 'Identification is required' }, { status: 400 });
    }

    // Find the latest active entry
    const record = await prisma.entryRecord.findFirst({
      where: {
        OR: [
          { id: entryId },
          { vehicleNo: vehicleNo || undefined },
          { profileId: profileId || undefined }
        ],
        exitTime: null,
      },
      orderBy: {
        entryTime: 'desc',
      },
      include: {
        profile: true
      }
    });

    if (!record) {
      return NextResponse.json({ error: 'No active entry found' }, { status: 404 });
    }

    if (record.isTemporary) {
      // PERMANENTLY DELETE temporary visitor data on exit
      await prisma.entryRecord.delete({
        where: { id: record.id }
      });

      return NextResponse.json({
        message: 'Visitor exit registered and data cleared',
        isTemporary: true
      });
    }

    // Mark permanent user as exited
    const updatedRecord = await prisma.entryRecord.update({
      where: { id: record.id },
      data: { exitTime: new Date() },
    });

    // Log to CSV for permanent users
    if (record.profile) {
      await logToCSV({
        type: 'EXIT',
        fullName: record.profile.name,
        rollNo: record.profile.rollNo,
        faculty: record.profile.course,
        course: record.profile.course,
        semester: record.profile.semester,
        vehicleNo: record.profile.vehicleNo,
        timestamp: updatedRecord.exitTime!.toISOString(),
      });
    }

    return NextResponse.json({
      message: 'Exit registered successfully',
      fullName: record.profile?.name || record.visitorName,
      vehicleNo: record.vehicleNo,
      exitTime: updatedRecord.exitTime,
    });
  } catch (error) {
    console.error('Exit API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

