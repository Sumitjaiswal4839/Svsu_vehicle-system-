import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies, headers } from 'next/headers';
import { logAudit } from '@/lib/audit';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { JWT_SECRET } from '@/lib/jwt';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Rate limiting — 5 attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(`guard:${ip}`);
    if (!rateLimit.allowed) {
      const minutes = Math.ceil(rateLimit.resetIn / 60000);
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.` },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isAuthorized && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access Denied. Account pending authorization.' }, { status: 403 });
    }

    // 1. Create Short-lived Access Token (15 mins)
    const accessToken = await new SignJWT({ 
      id: user.id, 
      username: user.username, 
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET);

    // 2. Create Long-lived Refresh Token (7 days)
    const refreshToken = await new SignJWT({ id: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    
    // Reset rate limit on successful login
    resetRateLimit(`guard:${ip}`);
    
    // Set Cookies
    cookieStore.set('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    if (user.role === 'ADMIN') {
      cookieStore.set('admin_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60,
        path: '/',
      });
    }

    // Save Session to Database for tracking and remote logout
    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        ipAddress: ip,
        userAgent: userAgent,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      }
    });

    // Audit Log
    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      resource: `User: ${user.username} | Device: ${userAgent}`,
      metadata: { role: user.role, ip }
    });

    return NextResponse.json({ message: 'Login successful', role: user.role });
  } catch (error) {
    logger.error('Login failed', { error: String(error) });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
