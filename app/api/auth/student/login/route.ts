import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { headers } from 'next/headers';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { JWT_SECRET } from '@/lib/jwt';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Rate limiting — 5 attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(`student:${ip}`);
    if (!rateLimit.allowed) {
      const minutes = Math.ceil(rateLimit.resetIn / 60000);
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.` },
        { status: 429 }
      );
    }

    const { rollNo, password } = await request.json();

    if (!rollNo || !password) {
      return NextResponse.json({ error: 'Roll number and password required' }, { status: 400 });
    }

    // Find student by rollNo (case insensitive if possible, but prisma findUnique is strict)
    const student = await prisma.userVehicleProfile.findUnique({
      where: { rollNo: rollNo.trim() }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, student.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid password. Please try again.' }, { status: 401 });
    }

    // Reset rate limit on successful login
    resetRateLimit(`student:${ip}`);

    // Update last login timestamp
    await prisma.userVehicleProfile.update({
      where: { id: student.id },
      data: { lastLogin: new Date() }
    });

    // Create 5-day JWT token
    const token = await new SignJWT({ 
      id: student.id, 
      rollNo: student.rollNo, 
      role: 'student' 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('5d')
      .sign(JWT_SECRET);

    const response = NextResponse.json({ 
      message: 'Logged in successfully',
      student: { name: student.name, rollNo: student.rollNo },
      redirectTo: '/student/dashboard'
    });

    // Enhanced cookie settings for better compatibility
    response.cookies.set('student_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Changed to strict for better security
      maxAge: 5 * 24 * 60 * 60, // 5 days
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('Student login failed', { error: String(error) });
    return NextResponse.json({ error: 'Login failed due to server error' }, { status: 500 });
  }
}
