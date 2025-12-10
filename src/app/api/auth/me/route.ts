import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/session';
import { getErrorMessage } from '@/lib/errors';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    if (!user) return NextResponse.json({ ok: false, user: null }, { status: 200 });
    const { pin, ...safeUser } = user;
    void pin;
    return NextResponse.json({ ok: true, user: safeUser });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
