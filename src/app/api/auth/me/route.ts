import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/session';

export async function GET() {
  try {
    const user = getUserFromCookies();
    if (!user) return NextResponse.json({ ok: false, user: null }, { status: 200 });
    // remove sensitive fields
    const { pin, ...safe } = user;
    return NextResponse.json({ ok: true, user: safe });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
