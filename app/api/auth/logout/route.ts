import { NextResponse } from 'next/server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (refreshToken) {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.session.deleteMany({ where: { refreshTokenHash: hash } });
  }

  const response = NextResponse.json({ message: 'Logged out' });
  
  // Clear all auth cookies
  response.cookies.set('student_token', '', { expires: new Date(0), path: '/' });
  response.cookies.set('auth_token', '', { expires: new Date(0), path: '/' });
  response.cookies.set('admin_token', '', { expires: new Date(0), path: '/' });
  response.cookies.set('refresh_token', '', { expires: new Date(0), path: '/' });
  
  return response;
}
