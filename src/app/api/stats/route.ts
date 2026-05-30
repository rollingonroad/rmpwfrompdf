import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET() {
  try {
    const count = await redis.get<number>('pdf_decrypted_count');
    return NextResponse.json({ count: count || 0 });
  } catch (e) {
    console.error('Failed to get counter:', e);
    return NextResponse.json({ count: 0 });
  }
}