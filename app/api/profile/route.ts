import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadPhoto } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

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
      faculty,
      rcPhoto,
      idCardFront,
      idCardBack,
      profilePhoto
    } = body;

    // Validation
    if (!name || !rollNo || !vehicleNo || !rcPhoto || !idCardFront || !idCardBack || !password || !faculty || !profilePhoto) {
      return NextResponse.json({ error: 'Missing mandatory fields. Ensure all photos are captured.' }, { status: 400 });
    }

    let rcPhotoUrl = rcPhoto;
    let idFrontUrl = idCardFront;
    let idBackUrl = idCardBack;
    let profilePhotoUrl = profilePhoto;

    // Handle photo uploads with better error reporting
    try {
      if (rcPhoto?.startsWith('data:image')) {
        rcPhotoUrl = await uploadPhoto(rcPhoto, `rc-${rollNo}-${Date.now()}`);
      }
      if (idCardFront?.startsWith('data:image')) {
        idFrontUrl = await uploadPhoto(idCardFront, `id-front-${rollNo}-${Date.now()}`);
      }
      if (idCardBack?.startsWith('data:image')) {
        idBackUrl = await uploadPhoto(idCardBack, `id-back-${rollNo}-${Date.now()}`);
      }
      if (profilePhoto?.startsWith('data:image')) {
        profilePhotoUrl = await uploadPhoto(profilePhoto, `profile-${rollNo}-${Date.now()}`);
      }
    } catch (uploadError: any) {
      console.error('Supabase Upload Error:', uploadError);
      return NextResponse.json({ 
        error: `Photo Upload Failed: ${uploadError.message || 'Check if "vehicle-photos" bucket exists in Supabase'}` 
      }, { status: 500 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Get session securely
    const cookieStore = await cookies();
    const token = cookieStore.get('student_token')?.value;
    let currentStudentId = null;
    
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        currentStudentId = payload.id as string;
      } catch (e) {}
    }

    // Check for collisions
    const existing = await prisma.userVehicleProfile.findUnique({
      where: { rollNo }
    });

    if (existing && (!currentStudentId || existing.id !== currentStudentId)) {
      return NextResponse.json({ 
        error: 'Roll Number already registered. Please login instead.' 
      }, { status: 409 });
    }

    // Upsert Profile
    const profile = await prisma.userVehicleProfile.upsert({
      where: { rollNo },
      update: {
        name,
        course,
        semester,
        password: hashedPassword,
        vehicleNo,
        license,
        faculty,
        rcPhoto: rcPhotoUrl,
        idCardFront: idFrontUrl,
        idCardBack: idBackUrl,
        profilePhoto: profilePhotoUrl,
      },
      create: {
        name,
        course,
        semester,
        rollNo,
        password: hashedPassword,
        vehicleNo,
        license,
        faculty,
        rcPhoto: rcPhotoUrl,
        idCardFront: idFrontUrl,
        idCardBack: idBackUrl,
        profilePhoto: profilePhotoUrl,
      },
    });

    return NextResponse.json({ message: 'Success', profile }, { status: 201 });
  } catch (error: any) {
    console.error('CRITICAL Profile API Error:', error);
    return NextResponse.json({ 
      error: 'Database error. Ensure your connection is stable and try again.' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('student_token')?.value;
    
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
