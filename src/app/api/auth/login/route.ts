import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { verifyHCaptcha } from '@/lib/captcha';
import { getErrorMessage } from '@/lib/errors';

function cookieHeader(name: string, value: string, days = 1) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  return `${name}=${value}; Path=/; Expires=${expires}; HttpOnly; SameSite=Lax; Secure`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, pin, remember, hcaptchaToken } = body;
    if (process.env.HCAPTCHA_SECRET) {
      const v = await verifyHCaptcha(hcaptchaToken);
      if (!v.ok) return NextResponse.json({ ok: false, error: 'captcha_failed' }, { status: 400 });
    }
    if (!firstName || !pin) return NextResponse.json({ ok: false, error: 'missing' }, { status: 400 });

    const user = db.prepare('SELECT * FROM users WHERE firstName = ?').get(firstName);
    if (!user) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

    const match = bcrypt.compareSync(pin, user.pin);
    if (!match) return NextResponse.json({ ok: false, error: 'invalid_pin' }, { status: 401 });

    const sessionId = uuidv4();
    const now = new Date();
    const expires = new Date(now.getTime() + (remember ? 7 : 1) * 24 * 60 * 60 * 1000);
    db.prepare('INSERT INTO sessions (id,userId,createdAt,expiresAt) VALUES (?,?,?,?)')
      .run(sessionId, user.id, now.toISOString(), expires.toISOString());

    // remember-by-ip
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown');
    if (remember && ip) {
      try {
        db.prepare('INSERT OR REPLACE INTO ip_remember (ip,userId) VALUES (?,?)').run(ip, user.id);
      } catch {
        // ignore
      }
    }

    const res = NextResponse.json({ ok: true, sessionId });
    res.headers.set('Set-Cookie', cookieHeader('session', sessionId, remember ? 7 : 1));
    return res;
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
