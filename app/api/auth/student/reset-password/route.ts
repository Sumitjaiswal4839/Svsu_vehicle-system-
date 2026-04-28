import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { rollNo, vehicleNo, newPassword } = await request.json();

    if (!rollNo || !vehicleNo || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Verify student exists with matching rollNo AND vehicleNo
    const student = await prisma.userVehicleProfile.findFirst({
      where: {
        rollNo: rollNo.trim(),
        vehicleNo: { 
          equals: vehicleNo.trim().toUpperCase(), 
          mode: 'insensitive' 
        }
      }
    });

    if (!student) {
      return NextResponse.json({ 
        error: 'No profile found with this Roll No and Vehicle Number combination.' 
      }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.userVehicleProfile.update({
      where: { id: student.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ 
      message: 'Password reset successfully!',
      name: student.name
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
