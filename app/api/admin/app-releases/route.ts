import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { verifyActiveSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { isValid, role } = await verifyActiveSession();
    if (!isValid || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const releases = await prisma.appRelease.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(releases);
  } catch (error) {
    logger.error('Failed to fetch app releases', { error: String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { isValid, role } = await verifyActiveSession();
    if (!isValid || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const platform = formData.get('platform') as string;
    const version = formData.get('version') as string;
    
    if (!platform || !version) {
      return NextResponse.json({ error: 'Platform and version are required' }, { status: 400 });
    }

    let downloadUrl = '';

    // If uploading an APK file
    const file = formData.get('file') as File | null;
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `${platform.toLowerCase()}-v${version}-${Date.now()}.apk`;

      const { data, error } = await supabase.storage
        .from('vehicle-photos')
        .upload(`releases/${fileName}`, buffer, {
          contentType: 'application/vnd.android.package-archive',
          upsert: true,
        });

      if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('vehicle-photos')
        .getPublicUrl(`releases/${fileName}`);

      downloadUrl = publicUrlData.publicUrl;
    } else {
      // If passing a direct URL (e.g., App Store link)
      const url = formData.get('url') as string;
      if (!url) {
        return NextResponse.json({ error: 'Either a file or a URL must be provided' }, { status: 400 });
      }
      downloadUrl = url;
    }

    // Set previous releases of this platform to inactive
    await prisma.appRelease.updateMany({
      where: { platform },
      data: { isActive: false },
    });

    // Create new release
    const newRelease = await prisma.appRelease.create({
      data: {
        platform,
        version,
        url: downloadUrl,
        isActive: true,
      },
    });

    return NextResponse.json(newRelease, { status: 201 });
  } catch (error) {
    logger.error('Failed to upload app release', { error: String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
