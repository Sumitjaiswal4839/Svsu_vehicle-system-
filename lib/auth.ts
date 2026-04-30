import { prisma } from './prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');

export async function verifyActiveSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return { isValid: false };

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Check if session exists in DB
    const activeSession = await prisma.session.findUnique({
      where: { token }
    });

    if (!activeSession) return { isValid: false };

    return { 
      isValid: true, 
      userId: payload.id as string, 
      role: payload.role as string 
    };
  } catch (error) {
    return { isValid: false };
  }
}
