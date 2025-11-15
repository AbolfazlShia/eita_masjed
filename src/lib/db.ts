import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_FILE = path.join(DATA_DIR, 'app.db');
const JSON_FILE = path.join(DATA_DIR, 'store.json');

// Try to load better-sqlite3; if unavailable (build issues on some macs), fall back to a simple JSON store.
let db: any = null;
try {
  // dynamic require to avoid top-level crash when module missing
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Database = require('better-sqlite3');
  const sqlDb = new Database(DB_FILE);
  sqlDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      lastName TEXT,
      gender TEXT,
      birth TEXT,
      pin TEXT,
      role TEXT DEFAULT 'user'
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId INTEGER,
      createdAt TEXT,
      expiresAt TEXT
    );
    CREATE TABLE IF NOT EXISTS ip_remember (
      ip TEXT PRIMARY KEY,
      userId INTEGER
    );
  `);

  // seed admin if missing
  const admin = sqlDb.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!admin) {
    const hashed = bcrypt.hashSync('modir5', 8);
    sqlDb.prepare('INSERT INTO users (firstName,lastName,gender,birth,pin,role) VALUES (?,?,?,?,?,?)')
      .run('مدیر', 'سایت', 'مرد', '', hashed, 'admin');
  }

  db = sqlDb;
} catch (e) {
  // fallback JSON store
  if (!fs.existsSync(JSON_FILE)) {
    fs.writeFileSync(JSON_FILE, JSON.stringify({ users: [], sessions: [], ip_remember: [] }, null, 2));
  }

  function read() {
    return JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  }
  function write(data: any) {
    fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2));
  }

  // Simple prepare runner that understands a few used patterns
  db = {
    prepare(sql: string) {
      const s = sql.trim();
      return {
        get: (...args: any[]) => {
          const data = read();
          // SELECT id FROM users WHERE role = ?
          if (/SELECT id FROM users WHERE role = \?/i.test(s)) {
            const role = args[0];
            return data.users.find((u: any) => u.role === role) || null;
          }
          if (/SELECT \* FROM users WHERE firstName = \?/i.test(s)) {
            const firstName = args[0];
            return data.users.find((u: any) => u.firstName === firstName) || null;
          }
          return null;
        },
        run: (...args: any[]) => {
          const data = read();
          // INSERT INTO users ... VALUES (?,?,?,?,?)
          if (/INSERT INTO users/i.test(s)) {
            const [firstName, lastName, gender, birth, pin, role] = args;
            const id = (data.users.reduce((m: number, u: any) => Math.max(m, u.id || 0), 0) || 0) + 1;
            const user = { id, firstName, lastName, gender, birth, pin, role: role || 'user' };
            data.users.push(user);
            write(data);
            return { lastInsertRowid: id };
          }
          // INSERT INTO sessions
          if (/INSERT INTO sessions/i.test(s)) {
            const [id, userId, createdAt, expiresAt] = args;
            data.sessions.push({ id, userId, createdAt, expiresAt });
            write(data);
            return { changes: 1 };
          }
          if (/DELETE FROM sessions WHERE id = \?/i.test(s)) {
            const id = args[0];
            const before = data.sessions.length;
            data.sessions = data.sessions.filter((s: any) => s.id !== id);
            write(data);
            return { changes: before - data.sessions.length };
          }
          if (/INSERT OR REPLACE INTO ip_remember/i.test(s)) {
            const [ip, userId] = args;
            const idx = data.ip_remember.findIndex((r: any) => r.ip === ip);
            if (idx >= 0) data.ip_remember[idx] = { ip, userId };
            else data.ip_remember.push({ ip, userId });
            write(data);
            return { changes: 1 };
          }
          return { changes: 0 };
        }
      };
    }
  };

  // Seed admin if missing in JSON
  const store = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  if (!store.users.find((u: any) => u.role === 'admin')) {
    const hashed = bcrypt.hashSync('modir5', 8);
    const id = (store.users.reduce((m: number, u: any) => Math.max(m, u.id || 0), 0) || 0) + 1;
    store.users.push({ id, firstName: 'مدیر', lastName: 'سایت', gender: 'مرد', birth: '', pin: hashed, role: 'admin' });
    fs.writeFileSync(JSON_FILE, JSON.stringify(store, null, 2));
  }
}

export default db;
