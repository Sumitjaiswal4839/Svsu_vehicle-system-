import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyActiveSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { rollNo, name, rating, comment, source } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid rating (1-5) is required' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        rollNo,
        name,
        rating,
        comment,
        source: source || 'WEB'
      }
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { isValid, role } = await verifyActiveSession();
    if (!isValid || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
