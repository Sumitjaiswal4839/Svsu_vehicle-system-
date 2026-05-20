import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    let guardBuildingId = null;
    let guardBuildingName = null;
    let guardName = null;
    let is_admin = false;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const user = await (prisma as any).user.findUnique({ 
          where: { id: payload.id as string },
          include: { building: true }
        });
        guardBuildingId = user?.buildingId;
        guardBuildingName = user?.building?.name;
        guardName = user?.username;
        is_admin = user?.role === 'ADMIN';
      } catch (e) {}
    }




    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filterDate = searchParams.get('date'); // YYYY-MM-DD

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

    const [activeVehicles, exitedVehicles, temporaryVisitors] = await Promise.all([
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
        where: {
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
        },
        include: { profile: true },
        orderBy: { entryTime: 'desc' },
        take: 50,
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
    ]);


    // Overstayed logic: entryTime < 8 hours ago
    const eightHoursAgoLimit = new Date(Date.now() - 8 * 60 * 60 * 1000);

    return NextResponse.json({
      activeVehicles,
      exitedVehicles,
      temporaryVisitors,
      guardBuildingId,
      guardBuildingName,
      guardName,
      is_admin,
      stats: {


        totalToday: await prisma.entryRecord.count({ where: { entryTime: { gte: today } } }),
        insideCount: activeVehicles.length,
        overstayedCount: activeVehicles.filter(v => new Date(v.entryTime) < eightHoursAgoLimit).length,
      }
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

