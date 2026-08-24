import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

import { JWT_SECRET } from '@/lib/jwt';
import crypto from 'crypto';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await prisma.session.findUnique({ where: { refreshTokenHash: hash } });
    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session revoked' }, { status: 401 });
    }

    // Verify Refresh Token
    const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
    const userId = payload.id as string;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Issue new Short-lived Access Token
    const newAccessToken = await new SignJWT({ 
      id: user.id, 
      username: user.username, 
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET);

    // Update Cookies
    cookieStore.set('auth_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    if (user.role === 'ADMIN') {
      cookieStore.set('admin_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60,
        path: '/',
      });
    }

    return NextResponse.json({ message: 'Token refreshed' });
  } catch (error) {
    logger.error('Refresh Error:', error);
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
