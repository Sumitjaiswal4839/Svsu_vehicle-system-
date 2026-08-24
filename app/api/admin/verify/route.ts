import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

import { JWT_SECRET } from '@/lib/jwt';
import { verifySecureQR } from '@/lib/qr';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) {

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    const rollNo = searchParams.get('rollNo');
    const qr = searchParams.get('qr');

    if (qr) {
      try {
        const payload = verifySecureQR(decodeURIComponent(qr));
        id = payload.p; // from { p: profile.id, v: profile.vehicleNo }
      } catch (e) {
        return NextResponse.json({ error: 'Invalid or Forged QR Code' }, { status: 400 });
      }
    }

    if (!id && !rollNo) {
      return NextResponse.json({ error: 'Profile ID, Roll Number, or QR is required' }, { status: 400 });
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
    logger.error('Verify API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
