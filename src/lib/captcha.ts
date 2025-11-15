export async function verifyHCaptcha(token?: string) {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) return { ok: true, message: 'no-captcha-config' };
  if (!token) return { ok: false, error: 'missing_token' };

  try {
    const res = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `response=${encodeURIComponent(token)}&secret=${encodeURIComponent(secret)}`,
    });
    const data = await res.json();
    return { ok: !!data.success, data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
