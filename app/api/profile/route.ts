import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadPhoto } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { JWT_SECRET } from '@/lib/jwt';
import { logger } from '@/lib/logger';
import { sanitizeString } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name: rawName, 
      course: rawCourse, 
      semester, 
      rollNo, 
      password,
      vehicleNo, 
      license, 
      faculty: rawFaculty,
      rcPhoto,
      idCardFront,
      idCardBack,
      profilePhoto,
      buildingId
    } = body;

    const name = rawName ? sanitizeString(rawName) : rawName;
    const course = rawCourse ? sanitizeString(rawCourse) : rawCourse;
    const faculty = rawFaculty ? sanitizeString(rawFaculty) : rawFaculty;


    // Validation
    if (!name || !rollNo || !vehicleNo || !rcPhoto || !idCardFront || !idCardBack || !password || !faculty || !profilePhoto || !buildingId) {
      return NextResponse.json({ error: 'Missing mandatory fields. Ensure all photos are captured and building is selected.' }, { status: 400 });
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
    } catch (uploadError: unknown) {
      logger.error('Supabase upload failed', { error: String(uploadError) });
      const msg = uploadError instanceof Error ? uploadError.message : 'Check if "vehicle-photos" bucket exists in Supabase';
      return NextResponse.json({ 
        error: `Photo Upload Failed: ${msg}` 
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
  } catch (error: unknown) {
    logger.error('Profile API critical error', { error: String(error) });
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
          take: 10,
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    logger.error('Profile fetch failed', { error: String(error) });
    return NextResponse.json({ error: 'Session expired. Please login again.' }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('student_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const studentId = payload.id as string;

    // Delete all entry records for this student
    await prisma.entryRecord.deleteMany({
      where: { profileId: studentId },
    });

    // Delete the student profile
    await prisma.userVehicleProfile.delete({
      where: { id: studentId },
    });

    // Clear the student_token cookie
    const response = NextResponse.json({ message: 'Account deleted successfully' });
    response.cookies.set('student_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('Account deletion failed', { error: String(error) });
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
