import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const searchFilter = search ? {
      OR: [
        { vehicleNo: { contains: search, mode: 'insensitive' as const } },
        { visitorName: { contains: search, mode: 'insensitive' as const } },
        { profile: { name: { contains: search, mode: 'insensitive' as const } } },
        { profile: { rollNo: { contains: search, mode: 'insensitive' as const } } },
      ]
    } : {};

    const [activeVehicles, exitedVehicles, temporaryVisitors] = await Promise.all([
      // Currently inside (Active Vehicles - both permanent and temporary)
      prisma.entryRecord.findMany({
        where: {
          exitTime: null,
          ...searchFilter
        },
        include: {
          profile: true
        },
        orderBy: { entryTime: 'desc' },
      }),
      // Exited Vehicles (Only permanent users, as temporary ones are deleted on exit)
      prisma.entryRecord.findMany({
        where: {
          exitTime: { not: null },
          isTemporary: false,
          ...searchFilter
        },
        include: {
          profile: true
        },
        orderBy: { exitTime: 'desc' },
        take: 50,
      }),
      // Temporary Visitors (Current ones)
      prisma.entryRecord.findMany({
        where: {
          exitTime: null,
          isTemporary: true,
          ...searchFilter
        },
        orderBy: { entryTime: 'desc' },
      }),
    ]);

    // Overstayed logic: entryTime < 12 hours ago
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    return NextResponse.json({
      activeVehicles,
      exitedVehicles,
      temporaryVisitors,
      stats: {
        totalToday: await prisma.entryRecord.count({ where: { entryTime: { gte: today } } }),
        insideCount: activeVehicles.length,
        overstayedCount: activeVehicles.filter(v => new Date(v.entryTime) < twelveHoursAgo).length,
      }
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

