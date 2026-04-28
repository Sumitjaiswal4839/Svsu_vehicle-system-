import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');

export async function GET(request: Request) {
  try {
    const token = (request as any).cookies?.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const guards = await prisma.user.findMany({
      where: { role: 'GUARD' },
      select: {
        id: true,
        username: true,
        role: true,
        isAuthorized: true
      }
    });

    return NextResponse.json(guards);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const token = (request as any).cookies?.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { guardId, isAuthorized } = await request.json();
    
    const updated = await prisma.user.update({
      where: { id: guardId },
      data: { isAuthorized }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
