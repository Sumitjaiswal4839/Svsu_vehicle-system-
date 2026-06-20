import { prisma } from './prisma';
import { headers, cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from './jwt';

export async function logAudit({ 
  userId,
  action, 
  resource, 
  metadata = {} 
}: { 
  userId?: string;
  action: 'LOGIN' | 'ENTRY_AUTH' | 'EXIT_AUTH' | 'VISITOR_ADD' | 'ADMIN_UNLOCK' | 'LOGOUT'; 
  resource?: string; 
  metadata?: any;
}) {
  try {
    const headersList = await headers();
    const cookieStore = await cookies();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    
    // Try to find the performer from tokens if userId is not provided
    let performerId = userId || null;
    let performerRole = 'ANONYMOUS';

    const authToken = cookieStore.get('auth_token')?.value;
    const studentToken = cookieStore.get('student_token')?.value;

    if (authToken) {
      try {
        const { payload } = await jwtVerify(authToken, JWT_SECRET);
        performerId = payload.userId as string;
        performerRole = payload.role as string;
      } catch (e) {}
    } else if (studentToken) {
      try {
        const { payload } = await jwtVerify(studentToken, JWT_SECRET);
        performerId = payload.id as string;
        performerRole = 'STUDENT';
      } catch (e) {}
    }

    await prisma.auditLog.create({
      data: {
        userId: performerRole !== 'STUDENT' ? performerId : null, // Only link to User model if not student
        action,
        resource,
        metadata: { 
          ...metadata, 
          performerId, 
          performerRole,
          timestamp: new Date().toISOString() 
        },
        ipAddress: ip,
      }
    });
  } catch (error) {
    console.error('Audit Logging Failed:', error);
  }
}
