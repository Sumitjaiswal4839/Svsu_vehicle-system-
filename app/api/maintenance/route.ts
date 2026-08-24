import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyActiveSession } from '@/lib/auth';

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'MAINTENANCE_MODE' }
    });

    return NextResponse.json({
      maintenanceMode: setting?.value === 'true'
    });
  } catch (error) {
    console.error('Error fetching maintenance mode:', error);
    // Default to false if DB fails to prevent locking everyone out accidentally
    return NextResponse.json({ maintenanceMode: false });
  }
}

export async function POST(request: Request) {
  try {
    const { isValid, role } = await verifyActiveSession();
    if (!isValid || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { maintenanceMode } = await request.json();

    const setting = await prisma.systemSetting.upsert({
      where: { key: 'MAINTENANCE_MODE' },
      update: { value: maintenanceMode ? 'true' : 'false' },
      create: { key: 'MAINTENANCE_MODE', value: maintenanceMode ? 'true' : 'false' }
    });

    return NextResponse.json({ maintenanceMode: setting.value === 'true' });
  } catch (error) {
    console.error('Error updating maintenance mode:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
