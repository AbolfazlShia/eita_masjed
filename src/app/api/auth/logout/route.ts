import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const m = cookie.match(/session=([^;]+)/);
    if (m) {
      const sessionId = m[1];
      db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    }
    const res = NextResponse.json({ ok: true });
    // expire cookie
    res.headers.set('Set-Cookie', 'session=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Secure');
    return res;
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
