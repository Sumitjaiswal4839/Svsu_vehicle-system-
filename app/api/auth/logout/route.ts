import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' });
  
  // Clear all auth cookies
  response.cookies.set('student_token', '', { expires: new Date(0), path: '/' });
  response.cookies.set('auth_token', '', { expires: new Date(0), path: '/' });
  response.cookies.set('admin_token', '', { expires: new Date(0), path: '/' });
  
  return response;
}
