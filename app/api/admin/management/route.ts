import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/jwt';

// Security Check: Ensure only ADMIN can access management APIs
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'ADMIN';
  } catch (e) {
    return false;
  }
}

export async function GET(request: Request) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'students' or 'sessions'

  try {
    if (type === 'students') {
      const students = await prisma.userVehicleProfile.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          entries: {
            take: 1,
            orderBy: { entryTime: 'desc' }
          }
        }
      });
      return NextResponse.json(students);
    }

    if (type === 'sessions') {
      const sessions = await prisma.session.findMany({
        where: {
          expiresAt: { gt: new Date() }
        },
        include: {
          user: {
            select: {
              username: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(sessions);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sessionId } = await request.json();
    if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 });

    await prisma.session.delete({
      where: { id: sessionId }
    });

    return NextResponse.json({ message: 'Session terminated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to terminate session' }, { status: 500 });
  }
}
