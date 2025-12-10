import fs from 'fs';
import path from 'path';
import db from './db';
import { cookies } from 'next/headers';

type SessionRow = {
  id: string;
  userId: string;
};

type UserRow = Record<string, unknown> & { id: string };

type JsonStore = {
  sessions: SessionRow[];
  users: UserRow[];
};

export async function getUserFromCookies(): Promise<UserRow | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get?.('session')?.value;
  if (!sessionCookie) return null;

  try {
    const sess = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionCookie) as SessionRow | undefined;
    if (!sess) return null;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(sess.userId) as UserRow | undefined;
    return user ?? null;
  } catch {
    try {
      const storeFile = path.join(process.cwd(), 'data', 'store.json');
      if (!fs.existsSync(storeFile)) return null;

      const store = JSON.parse(fs.readFileSync(storeFile, 'utf8')) as JsonStore;
      const session = store.sessions.find((entry) => entry.id === sessionCookie);
      if (!session) return null;
      return store.users.find((entry) => entry.id === session.userId) ?? null;
    } catch {
      return null;
    }
  }
}
