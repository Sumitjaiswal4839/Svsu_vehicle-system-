import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadPhoto } from '@/lib/supabase';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { JWT_SECRET } from '@/lib/jwt';
import { sanitizeString } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name: rawName, purpose: rawPurpose, contact: rawContact, photo, buildingId, vehicleNo, isHackathon } = body;

    const name = rawName ? sanitizeString(rawName) : rawName;
    const purpose = rawPurpose ? sanitizeString(rawPurpose) : rawPurpose;
    const contact = rawContact ? sanitizeString(rawContact) : rawContact;

    if (!name || !purpose || !buildingId) {
      return NextResponse.json({ error: 'Missing mandatory fields' }, { status: 400 });
    }

    let photoUrl = photo;
    if (photo?.startsWith('data:image')) {
      photoUrl = await uploadPhoto(photo, `visitor-${Date.now()}`);
    }

    // Create a VisitorEntry record
    const visitor = await (prisma as any).visitorEntry.create({
      data: {
        name,
        purpose,
        contact,
        photo: photoUrl,
        buildingId,
        isHackathon: !!isHackathon
      }
    });

    // Also create an EntryRecord for the live dashboard feed
    await (prisma as any).entryRecord.create({
      data: {
        visitorId: visitor.id,
        visitorName: name,
        visitorPurpose: purpose,
        visitorContact: contact,
        visitorPhoto: photoUrl,
        vehicleNo: vehicleNo || null,
        buildingId,
        isTemporary: true,
        entryTime: new Date()
      }
    });



    return NextResponse.json(visitor);
  } catch (error) {
    console.error('Visitor Entry Error:', error);
    return NextResponse.json({ error: 'Failed to register visitor' }, { status: 500 });
  }
}
