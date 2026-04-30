import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [totalEntries, activeVehicles, totalStudents, pendingGuards, auditStats] = await Promise.all([
      prisma.entryRecord.count({
        where: { entryTime: { gte: new Date(new Date().setHours(0,0,0,0)) } }
      }),
      prisma.entryRecord.count({ where: { exitTime: null } }),
      prisma.userVehicleProfile.count(),
      prisma.user.count({ where: { role: 'GUARD', isAuthorized: false } }),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: { _all: true }
      })
    ]);

    // Fetch Top Active Guards
    const guardActivity = await prisma.auditLog.findMany({
      where: { action: 'ENTRY_AUTH' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true } } }
    });

    // Simple hourly peak analysis (last 24h)
    const logs = await prisma.entryRecord.findMany({
      where: { entryTime: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      select: { entryTime: true }
    });

    const hourlyStats = new Array(24).fill(0);
    logs.forEach(log => {
      const hour = new Date(log.entryTime).getHours();
      hourlyStats[hour]++;
    });

    return NextResponse.json({
      totalEntries,
      activeVehicles,
      totalStudents,
      pendingGuards,
      hourlyStats,
      auditStats,
      topGuards: guardActivity
    });
  } catch (error) {
    console.error('Stats Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
