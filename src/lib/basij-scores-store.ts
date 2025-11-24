import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type BasijScoreEntry = {
  id: string;
  memberId: string;
  amount: number;
  note: string;
  createdAt: string;
};

const DATA_DIR = path.resolve(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "basij-scores.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify({ entries: [] }, null, 2), "utf8");
  }
}

function readStore(): { entries: BasijScoreEntry[] } {
  ensureFile();
  try {
    const raw = fs.readFileSync(FILE_PATH, "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.entries)) return { entries: [] };
    return { entries: data.entries };
  } catch (error) {
    console.error("Failed to parse basij-scores store", error);
    return { entries: [] };
  }
}

function writeStore(store: { entries: BasijScoreEntry[] }) {
  ensureFile();
  fs.writeFileSync(FILE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function listScoreEntries() {
  return readStore().entries;
}

export function addScoreEntry(memberId: string, amount: number, note: string) {
  const normalizedMemberId = memberId?.trim();
  if (!normalizedMemberId) {
    throw new Error("member_required");
  }
  if (!Number.isFinite(amount)) {
    throw new Error("invalid_amount");
  }
  const store = readStore();
  const entry: BasijScoreEntry = {
    id: randomUUID(),
    memberId: normalizedMemberId,
    amount,
    note: (note ?? "").trim(),
    createdAt: new Date().toISOString(),
  };
  store.entries.unshift(entry);
  writeStore(store);
  return entry;
}

export function listScoresByMember() {
  const entries = listScoreEntries();
  return entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.memberId] = (acc[entry.memberId] ?? 0) + entry.amount;
    return acc;
  }, {});
}
