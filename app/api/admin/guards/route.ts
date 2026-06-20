import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { JWT_SECRET } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) {

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const guards = await (prisma as any).user.findMany({
      where: { role: 'GUARD' },
      select: {
        id: true,
        username: true,
        role: true,
        isAuthorized: true,
        buildingId: true
      }
    });

    return NextResponse.json(guards);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) {

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { guardId, isAuthorized, buildingId } = await request.json();
    
    const updated = await (prisma as any).user.update({
      where: { id: guardId },
      data: { 
        isAuthorized,
        buildingId: buildingId || undefined
      }
    });



    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { username, password, buildingId } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const existing = await (prisma as any).user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newGuard = await (prisma as any).user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'GUARD',
        isAuthorized: true, // Default to authorized if created by admin
        buildingId: buildingId || null
      }
    });

    return NextResponse.json(newGuard);
  } catch (error) {
    console.error('Guard Creation Error:', error);
    return NextResponse.json({ error: 'Creation failed' }, { status: 500 });
  }
}
