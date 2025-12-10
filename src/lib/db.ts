import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

type JsonUser = {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  birth: string;
  pin: string;
  role: string;
};

type JsonSession = {
  id: string;
  userId: number;
  createdAt?: string;
  expiresAt?: string;
};

type JsonIpRemember = {
  ip: string;
  userId: number;
};

type JsonStore = {
  users: JsonUser[];
  sessions: JsonSession[];
  ip_remember: JsonIpRemember[];
};

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const JSON_FILE = path.join(DATA_DIR, 'store.json');

function ensureJsonStore(): JsonStore {
  if (!fs.existsSync(JSON_FILE)) {
    const initial: JsonStore = { users: [], sessions: [], ip_remember: [] };
    fs.writeFileSync(JSON_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(JSON_FILE, 'utf8')) as JsonStore;
}

function writeJsonStore(payload: JsonStore) {
  fs.writeFileSync(JSON_FILE, JSON.stringify(payload, null, 2));
}

const readStore = (): JsonStore => ensureJsonStore();

const runSelectUserByRole = (role: string) => readStore().users.find((user) => user.role === role) ?? null;
const runSelectUserByFirstName = (firstName: string) => readStore().users.find((user) => user.firstName === firstName) ?? null;

const insertUser = (firstName: string, lastName: string, gender: string, birth: string, pin: string, role?: string) => {
  const data = readStore();
  const id = (data.users.reduce((maxId, user) => Math.max(maxId, user.id || 0), 0) || 0) + 1;
  const user: JsonUser = { id, firstName, lastName, gender, birth, pin, role: role || 'user' };
  data.users.push(user);
  writeJsonStore(data);
  return { lastInsertRowid: id };
};

const insertSession = (id: string, userId: number, createdAt?: string, expiresAt?: string) => {
  const data = readStore();
  data.sessions.push({ id, userId, createdAt, expiresAt });
  writeJsonStore(data);
  return { changes: 1 };
};

const deleteSessionById = (id: string) => {
  const data = readStore();
  const before = data.sessions.length;
  data.sessions = data.sessions.filter((session) => session.id !== id);
  writeJsonStore(data);
  return { changes: before - data.sessions.length };
};

const upsertRememberedIp = (ip: string, userId: number) => {
  const data = readStore();
  const idx = data.ip_remember.findIndex((entry) => entry.ip === ip);
  if (idx >= 0) {
    data.ip_remember[idx] = { ip, userId };
  } else {
    data.ip_remember.push({ ip, userId });
  }
  writeJsonStore(data);
  return { changes: 1 };
};

const db = {
  prepare(sql: string) {
    const normalized = sql.trim();
    return {
      get: (...args: unknown[]) => {
        if (/SELECT id FROM users WHERE role = \?/i.test(normalized)) {
          return runSelectUserByRole(String(args[0]));
        }
        if (/SELECT \* FROM users WHERE firstName = \?/i.test(normalized)) {
          return runSelectUserByFirstName(String(args[0]));
        }
        return null;
      },
      run: (...args: unknown[]) => {
        if (/INSERT INTO users/i.test(normalized)) {
          const [firstName, lastName, gender, birth, pin, role] = args as [string, string, string, string, string, string?];
          return insertUser(firstName, lastName, gender, birth, pin, role);
        }
        if (/INSERT INTO sessions/i.test(normalized)) {
          const [id, userId, createdAt, expiresAt] = args as [string, number, string?, string?];
          return insertSession(id, userId, createdAt, expiresAt);
        }
        if (/DELETE FROM sessions WHERE id = \?/i.test(normalized)) {
          const [id] = args as [string];
          return deleteSessionById(id);
        }
        if (/INSERT OR REPLACE INTO ip_remember/i.test(normalized)) {
          const [ip, userId] = args as [string, number];
          return upsertRememberedIp(ip, userId);
        }
        return { changes: 0 };
      },
    };
  },
};

const store = ensureJsonStore();
const hasAdmin = store.users.some((user) => user.role === 'admin');
if (!hasAdmin) {
  const hashed = bcrypt.hashSync('modir5', 8);
  const id = (store.users.reduce((maxId, user) => Math.max(maxId, user.id || 0), 0) || 0) + 1;
  store.users.push({ id, firstName: 'مدیر', lastName: 'سایت', gender: 'مرد', birth: '', pin: hashed, role: 'admin' });
  writeJsonStore(store);
}

export default db;
