import { prisma } from './prisma';
import { headers } from 'next/headers';

export async function logAudit({ 
  userId, 
  action, 
  resource, 
  metadata 
}: { 
  userId?: string; 
  action: 'LOGIN' | 'ENTRY_AUTH' | 'EXIT_AUTH' | 'VISITOR_ADD' | 'ADMIN_UNLOCK' | 'LOGOUT'; 
  resource?: string; 
  metadata?: any;
}) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        metadata: metadata || {},
        ipAddress: ip,
      }
    });
  } catch (error) {
    console.error('Audit Logging Failed:', error);
    // We don't throw here to avoid breaking the main flow if auditing fails
  }
}
