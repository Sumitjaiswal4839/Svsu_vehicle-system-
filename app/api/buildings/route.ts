import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const buildings = await (prisma as any).building.findMany({

      orderBy: { code: 'asc' }
    });
    return NextResponse.json(buildings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch buildings' }, { status: 500 });
  }
}
