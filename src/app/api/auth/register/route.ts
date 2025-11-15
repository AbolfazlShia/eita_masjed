import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { verifyHCaptcha } from '@/lib/captcha';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, gender, birth, pin, hcaptchaToken } = body;
    if (process.env.HCAPTCHA_SECRET) {
      const v = await verifyHCaptcha(hcaptchaToken);
      if (!v.ok) return NextResponse.json({ ok: false, error: 'captcha_failed' }, { status: 400 });
    }

    if (!pin || typeof pin !== 'string' || pin.length < 1) {
      return NextResponse.json({ ok: false, error: 'invalid_pin' }, { status: 400 });
    }

    const hashed = bcrypt.hashSync(pin, 8);
    const stmt = db.prepare('INSERT INTO users (firstName,lastName,gender,birth,pin) VALUES (?,?,?,?,?)');
    const info = stmt.run(firstName || '', lastName || '', gender || '', birth || '', hashed);
    return NextResponse.json({ ok: true, userId: info.lastInsertRowid });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
