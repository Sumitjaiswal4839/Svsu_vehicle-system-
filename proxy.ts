import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');

export async function proxy(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const studentToken = request.cookies.get('student_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPaths = ['/admin', '/entry', '/exit', '/api/entry', '/api/exit', '/api/dashboard'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected) {
    // If it's a student accessing entry/exit/dashboard, check student_token
    if (studentToken && (pathname.startsWith('/api/entry') || pathname.startsWith('/api/exit') || pathname.startsWith('/student'))) {
      try {
        await jwtVerify(studentToken, JWT_SECRET);
        return NextResponse.next();
      } catch (e) {
        // Token invalid, fall through to login redirect
      }
    }

    if (!authToken) {
      // ... (existing silent refresh logic)
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(authToken, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // If auth token expired, check refresh token
      if (refreshToken) {
         try {
           const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
           const newAccessToken = await new SignJWT({ id: payload.id })
             .setProtectedHeader({ alg: 'HS256' })
             .setIssuedAt()
             .setExpirationTime('15m')
             .sign(JWT_SECRET);

           const response = NextResponse.next();
           response.cookies.set('auth_token', newAccessToken, {
             httpOnly: true,
             secure: process.env.NODE_ENV === 'production',
             sameSite: 'lax',
             maxAge: 15 * 60,
             path: '/',
           });
           return response;
         } catch (e) {}
      }

      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/entry/:path*', '/exit/:path*', '/api/:path*'],
};
