import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadPhoto } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      course, 
      semester, 
      rollNo, 
      password,
      vehicleNo, 
      license, 
      rcPhoto,
      idCardFront,
      idCardBack
    } = body;

    if (!name || !rollNo || !vehicleNo || !rcPhoto || !idCardFront || !idCardBack || !password) {
      return NextResponse.json({ error: 'Missing required fields (Name, Roll No, Vehicle No, RC, ID Cards, Password)' }, { status: 400 });
    }

    let rcPhotoUrl = rcPhoto;
    let idFrontUrl = idCardFront;
    let idBackUrl = idCardBack;

    // Handle photo uploads
    if (rcPhoto && rcPhoto.startsWith('data:image')) {
      rcPhotoUrl = await uploadPhoto(rcPhoto, `rc-${rollNo}-${Date.now()}`);
    }
    if (idCardFront && idCardFront.startsWith('data:image')) {
      idFrontUrl = await uploadPhoto(idCardFront, `id-front-${rollNo}-${Date.now()}`);
    }
    if (idCardBack && idCardBack.startsWith('data:image')) {
      idBackUrl = await uploadPhoto(idCardBack, `id-back-${rollNo}-${Date.now()}`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user is already registered
    const existing = await prisma.userVehicleProfile.findUnique({
      where: { rollNo }
    });

    // Get current session if any
    const token = (request as any).cookies?.get('student_token')?.value;
    let currentStudentId = null;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        currentStudentId = payload.id as string;
      } catch (e) {}
    }

    if (existing && existing.id !== currentStudentId) {
      return NextResponse.json({ 
        error: 'This Roll Number is already registered. Please login to your account or use Forgot Password.' 
      }, { status: 409 });
    }

    const profile = await prisma.userVehicleProfile.upsert({

      where: { rollNo },
      update: {
        name,
        course,
        semester,
        password: hashedPassword,
        vehicleNo,
        license,
        rcPhoto: rcPhotoUrl,
        idCardFront: idFrontUrl,
        idCardBack: idBackUrl,
      },
      create: {
        name,
        course,
        semester,
        rollNo,
        password: hashedPassword,
        vehicleNo,
        license,
        rcPhoto: rcPhotoUrl,
        idCardFront: idFrontUrl,
        idCardBack: idBackUrl,
      },
    });


    return NextResponse.json({ message: 'Profile registered successfully', profile }, { status: 201 });
  } catch (error) {
    console.error('Profile API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const token = (request as any).cookies?.get('student_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { payload } = await jwtVerify(token, JWT_SECRET);
    const studentId = payload.id as string;

    const profile = await prisma.userVehicleProfile.findUnique({
      where: { id: studentId },
      include: {
        entries: {
          orderBy: { entryTime: 'desc' },
          take: 5,
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile Fetch Error:', error);
    return NextResponse.json({ error: 'Session expired. Please login again.' }, { status: 401 });
  }
}
