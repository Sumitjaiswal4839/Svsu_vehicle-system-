import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyActiveSession } from '@/lib/auth';

export async function GET() {
  try {
    const notifications = await prisma.systemNotification.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { isValid, role } = await verifyActiveSession();
    if (!isValid || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, message, type } = await request.json();

    const notification = await prisma.systemNotification.create({
      data: {
        title,
        message,
        type: type || 'INFO'
      }
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
