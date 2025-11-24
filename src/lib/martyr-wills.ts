import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type MartyrWillItem = {
  id: string;
  name: string;
  context: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
};

export type MartyrWillPayload = Omit<MartyrWillItem, "id" | "createdAt" | "updatedAt">;

type MartyrWillStore = {
  wills: MartyrWillItem[];
};

const DATA_DIR = path.resolve(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "martyrs-wills.json");
const MAX_WILLS = 200;

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({ wills: [] }, null, 2), "utf8");
  }
}

function readStore(): MartyrWillStore {
  ensureFile();
  const raw = fs.readFileSync(STORE_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.wills)) {
      return { wills: [] };
    }
    return {
      wills: (parsed.wills as MartyrWillItem[]).map((item) => ({
        ...item,
        id: item.id || randomUUID(),
        name: `${item.name ?? ""}`.trim(),
        context: `${item.context ?? ""}`.trim(),
        excerpt: `${item.excerpt ?? ""}`.trim(),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to parse martyrs-wills store", error);
    return { wills: [] };
  }
}

function writeStore(store: MartyrWillStore) {
  ensureFile();
  const normalized = store.wills
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.name.localeCompare(b.name));
  fs.writeFileSync(STORE_FILE, JSON.stringify({ wills: normalized }, null, 2), "utf8");
}

function assertFields(payload: Partial<MartyrWillPayload>) {
  if (!payload.name || !payload.name.trim()) throw new Error("empty_name");
  if (!payload.context || !payload.context.trim()) throw new Error("empty_context");
  if (!payload.excerpt || !payload.excerpt.trim()) throw new Error("empty_excerpt");
}

export function getMartyrWills(): MartyrWillItem[] {
  return readStore().wills;
}

export function createMartyrWill({ name, context, excerpt }: MartyrWillPayload): MartyrWillItem {
  assertFields({ name, context, excerpt });
  const store = readStore();
  if (store.wills.length >= MAX_WILLS) {
    throw new Error("limit_reached");
  }
  const now = new Date().toISOString();
  const record: MartyrWillItem = {
    id: randomUUID(),
    name: name.trim(),
    context: context.trim(),
    excerpt: excerpt.trim(),
    createdAt: now,
    updatedAt: now,
  };
  store.wills.unshift(record);
  writeStore(store);
  return record;
}

export function updateMartyrWill(id: string, payload: MartyrWillPayload): MartyrWillItem {
  assertFields(payload);
  const store = readStore();
  const index = store.wills.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error("not_found");
  }
  const now = new Date().toISOString();
  const updated: MartyrWillItem = {
    ...store.wills[index],
    name: payload.name.trim(),
    context: payload.context.trim(),
    excerpt: payload.excerpt.trim(),
    updatedAt: now,
  };
  store.wills[index] = updated;
  writeStore(store);
  return updated;
}

export function deleteMartyrWill(id: string) {
  const store = readStore();
  const index = store.wills.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }
  store.wills.splice(index, 1);
  writeStore(store);
  return true;
}

export function getMartyrWillLimit() {
  return MAX_WILLS;
}
