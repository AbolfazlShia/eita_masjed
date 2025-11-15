import db from './db';
import { cookies } from 'next/headers';

export function getUserFromCookies() {
  try {
  const cookieStore: any = cookies();
  const sessionCookie = cookieStore.get?.('session')?.value;
    if (!sessionCookie) return null;

    // sessions table: id, userId
    const sess = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionCookie as any);
    if (!sess) return null;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(sess.userId);
    return user || null;
  } catch (e) {
    // fallback for JSON store path: db.prepare may not support those selects; try reading file
    try {
      const cookieStore: any = cookies();
      const sessionCookie = cookieStore.get?.('session')?.value;
      if (!sessionCookie) return null;
      const fs = require('fs');
      const path = require('path');
      const storeFile = path.join(process.cwd(), 'data', 'store.json');
      if (!fs.existsSync(storeFile)) return null;
      const store = JSON.parse(fs.readFileSync(storeFile, 'utf8'));
      const s = store.sessions.find((x: any) => x.id === sessionCookie);
      if (!s) return null;
      const u = store.users.find((x: any) => x.id === s.userId) || null;
      return u;
    } catch (_e) {
      return null;
    }
  }
}
