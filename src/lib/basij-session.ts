import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_DIR = path.resolve(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "basij-sessions.json");
const SESSION_COOKIE = "basij_session";

type BasijSessionRecord = {
  id: string;
  memberId: string;
  createdAt: string;
  expiresAt: string;
};

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify({ sessions: [] }, null, 2), "utf8");
  }
}

function readStore(): { sessions: BasijSessionRecord[] } {
  ensureFile();
  const raw = fs.readFileSync(FILE_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.sessions)) return { sessions: [] };
    const now = Date.now();
    const active = parsed.sessions.filter((s: BasijSessionRecord) => new Date(s.expiresAt).getTime() > now);
    if (active.length !== parsed.sessions.length) {
      writeStore({ sessions: active });
    }
    return { sessions: active };
  } catch (error) {
    console.error("Failed to parse basij-sessions store", error);
    return { sessions: [] };
  }
}

function writeStore(store: { sessions: BasijSessionRecord[] }) {
  ensureFile();
  fs.writeFileSync(FILE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function createBasijSession(memberId: string, remember = false) {
  const store = readStore();
  const now = new Date();
  const expires = new Date(now.getTime() + (remember ? 14 : 2) * 24 * 60 * 60 * 1000);
  const session: BasijSessionRecord = {
    id: randomUUID(),
    memberId,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
  store.sessions = store.sessions.filter((s) => s.memberId !== memberId);
  store.sessions.push(session);
  writeStore(store);
  return session;
}

export function getBasijSession(sessionId: string) {
  if (!sessionId) return null;
  const store = readStore();
  return store.sessions.find((s) => s.id === sessionId) || null;
}

export function deleteBasijSession(sessionId: string) {
  const store = readStore();
  const next = store.sessions.filter((s) => s.id !== sessionId);
  if (next.length !== store.sessions.length) {
    writeStore({ sessions: next });
  }
}

export function getBasijSessionCookieName() {
  return SESSION_COOKIE;
}
