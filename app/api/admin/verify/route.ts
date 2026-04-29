import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');

export async function GET(request: Request) {
  try {
    // Basic admin auth check
    const token = (request as any).cookies?.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const rollNo = searchParams.get('rollNo');

    if (!id && !rollNo) {
      return NextResponse.json({ error: 'Profile ID or Roll Number is required' }, { status: 400 });
    }

    const profile = await prisma.userVehicleProfile.findUnique({
      where: id ? { id } : { rollNo: rollNo! },
      select: {
        id: true,
        name: true,
        course: true,
        semester: true,
        rollNo: true,
        vehicleNo: true,
        profilePhoto: true,
        faculty: true
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Verify API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
