import { NextRequest, NextResponse } from 'next/server';
import { removePdfPassword } from '@/lib/pdfUtils';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function incrementDecryptCount() {
  try {
    const key = 'pdf_decrypted_count';
    await redis.incr(key);
  } catch (e) {
    console.error('Failed to increment counter:', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'No password provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);

    const result = await removePdfPassword(pdfBytes, password);

    // Increment counter asynchronously (don't block the response)
    incrementDecryptCount();

    return new NextResponse(Buffer.from(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.name.replace(/\.pdf$/i, '')}_unlocked.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error removing PDF password:', error);

    if (error instanceof Error && error.message.includes('password')) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
}