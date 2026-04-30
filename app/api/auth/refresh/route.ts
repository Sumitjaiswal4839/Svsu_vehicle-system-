import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
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
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    if (user.role === 'ADMIN') {
      cookieStore.set('admin_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
        path: '/',
      });
    }

    return NextResponse.json({ message: 'Token refreshed' });
  } catch (error) {
    console.error('Refresh Error:', error);
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
