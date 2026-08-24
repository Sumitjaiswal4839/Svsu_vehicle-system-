import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { JWT_SECRET } from '@/lib/jwt';

import { verifyActiveSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { isValid, userId, role } = await verifyActiveSession();
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let guardBuildingId = null;
    let guardBuildingName = null;
    let guardName = null;
    let is_admin = role === 'ADMIN';

    if (userId) {
      try {
        const user = await (prisma as any).user.findUnique({ 
          where: { id: userId },
          include: { building: true }
        });
        guardBuildingId = user?.buildingId;
        guardBuildingName = user?.building?.name;
        guardName = user?.username;
      } catch (e) {}
    }




    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filterDate = searchParams.get('date'); // YYYY-MM-DD
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let historyStart = today;
    let historyEnd = tomorrow;

    if (filterDate) {
      historyStart = new Date(filterDate);
      historyStart.setHours(0, 0, 0, 0);
      historyEnd = new Date(historyStart);
      historyEnd.setDate(historyEnd.getDate() + 1);
    }


    const searchFilter = search ? {
      OR: [
        { vehicleNo: { contains: search, mode: 'insensitive' as const } },
        { visitorName: { contains: search, mode: 'insensitive' as const } },
        { profile: { name: { contains: search, mode: 'insensitive' as const } } },
        { profile: { rollNo: { contains: search, mode: 'insensitive' as const } } },
      ]
    } : {};

    // Filter by building for guards
    const buildingFilter = (!is_admin && guardBuildingId) ? { buildingId: guardBuildingId } : {};


    // Auto-history logic: entries older than 8 hours are treated as exited
    const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);

    const historyWhereClause = {
      OR: [
        { exitTime: { not: null, gte: historyStart, lt: historyEnd } },
        { 
          exitTime: null, 
          entryTime: { lt: eightHoursAgo, gte: historyStart } 
        }
      ],
      isTemporary: false,
      ...searchFilter,
      ...buildingFilter
    };

    const [activeVehicles, exitedVehicles, temporaryVisitors, totalExited] = await Promise.all([
      // Currently inside (Entries < 8h old and no exit time)
      prisma.entryRecord.findMany({
        where: {
          exitTime: null,
          entryTime: { gte: eightHoursAgo },
          ...searchFilter,
          ...buildingFilter
        },
        include: { profile: true },
        orderBy: { entryTime: 'desc' },
      }),
      // History (Manual exits OR entries > 8h old)
      prisma.entryRecord.findMany({
        where: historyWhereClause,
        include: { profile: true },
        orderBy: { entryTime: 'desc' },
        take: limit,
        skip: offset,
      }),
      // Temporary Visitors (Recent only)
      prisma.entryRecord.findMany({
        where: {
          exitTime: null,
          isTemporary: true,
          entryTime: { gte: eightHoursAgo },
          ...searchFilter,
          ...buildingFilter
        },
        orderBy: { entryTime: 'desc' },
      }),
      // Total count for pagination
      prisma.entryRecord.count({ where: historyWhereClause }),
    ]);


    // Overstayed logic: entryTime < 8 hours ago
    const eightHoursAgoLimit = new Date(Date.now() - 8 * 60 * 60 * 1000);
    const totalPages = Math.ceil(totalExited / limit);

    return NextResponse.json({
      activeVehicles,
      exitedVehicles,
      temporaryVisitors,
      guardBuildingId,
      guardBuildingName,
      guardName,
      is_admin,
      pagination: {
        page,
        limit,
        totalPages,
        totalExited,
      },
      stats: {
        totalToday: await prisma.entryRecord.count({ where: { entryTime: { gte: today } } }),
        insideCount: activeVehicles.length,
        overstayedCount: activeVehicles.filter(v => new Date(v.entryTime) < eightHoursAgoLimit).length,
      }
    });

  } catch (error) {
    logger.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

