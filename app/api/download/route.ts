import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform')?.toUpperCase();

  if (!platform || (platform !== 'ANDROID' && platform !== 'IOS')) {
    return new NextResponse('Invalid platform', { status: 400 });
  }

  try {
    const release = await prisma.appRelease.findFirst({
      where: {
        platform,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!release) {
      return new NextResponse(`No active release found for ${platform}`, { status: 404 });
    }

    return NextResponse.redirect(release.url);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
