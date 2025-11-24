import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_DIR = path.resolve(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "manager-qr.json");

type ManagerQrEntry = {
  userId: string;
  qrToken: string;
};

type ManagerQrStore = {
  entries: ManagerQrEntry[];
};

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    const initial: ManagerQrStore = { entries: [] };
    fs.writeFileSync(FILE_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

function readStore(): ManagerQrStore {
  ensureFile();
  try {
    const raw = fs.readFileSync(FILE_PATH, "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.entries)) {
      return { entries: [] };
    }
    return { entries: data.entries };
  } catch (error) {
    console.error("Failed to read manager QR store", error);
    return { entries: [] };
  }
}

function writeStore(store: ManagerQrStore) {
  ensureFile();
  fs.writeFileSync(FILE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function getManagerQrToken(userId: number | string) {
  const store = readStore();
  const entry = store.entries.find((item) => item.userId === String(userId));
  return entry?.qrToken ?? null;
}

export function getOrCreateManagerQrToken(userId: number | string) {
  const normalizedId = String(userId);
  const store = readStore();
  const existing = store.entries.find((item) => item.userId === normalizedId);
  if (existing) {
    return existing.qrToken;
  }
  const qrToken = randomUUID();
  store.entries.push({ userId: normalizedId, qrToken });
  writeStore(store);
  return qrToken;
}

