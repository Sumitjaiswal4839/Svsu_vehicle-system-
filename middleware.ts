import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPaths = ['/admin', '/entry', '/exit', '/api/entry', '/api/exit', '/api/dashboard'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected) {
    if (!authToken) {
      // Try silent refresh if access token is missing but refresh token exists
      if (refreshToken) {
        try {
          const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
          // Token is valid, but we are in middleware. 
          // We can't call our own API easily, so we manually issue a new one here or redirect to a refresh handler.
          // In Next.js middleware, we can modify the response headers to set the new cookie.
          
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
        } catch (e) {
          // Refresh token also invalid
        }
      }

      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
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
