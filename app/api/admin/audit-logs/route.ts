import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { username: true, role: true }
        }
      },
      take: 1000 // Limit for export performance
    });

    // Format logs for CSV
    const formattedLogs = logs.map(log => ({
      ID: log.id,
      Timestamp: log.createdAt,
      Action: log.action,
      User: log.user?.username || 'System',
      Role: log.user?.role || 'N/A',
      Resource: log.resource || 'N/A',
      IP_Address: log.ipAddress || 'N/A',
    }));

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error('Audit Log Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
