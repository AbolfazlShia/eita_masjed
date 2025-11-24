import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  highlight?: string;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = path.resolve(process.cwd(), "data");
const ANNOUNCEMENT_FILE = path.join(DATA_DIR, "announcements.json");
const MAX_ANNOUNCEMENTS = 50;

const defaultAnnouncements: Omit<AnnouncementItem, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "ویژه‌برنامه قرآنی سه‌شنبه‌ها",
    body: "قرائت جزء‌خوانی و تفسیر کوتاه بعد از نماز مغرب در صحن اصلی مسجد.",
    highlight: "آغاز از این هفته"
  },
  {
    title: "پویش کمک مومنانه",
    body: "جمع‌آوری کمک‌های نقدی و غیرنقدی برای خانواده‌های نیازمند محله تا پایان ماه جاری.",
    highlight: "مسئول پیگیری: پایگاه بسیج"
  },
  {
    title: "ثبت‌نام اردوی جهادی",
    body: "برنامه اعزام گروه جهادی به روستاهای خراسان. زمان اعزام ۲۵ آذر. ثبت‌نام در واحد فرهنگی.",
  }
];

type AnnouncementStore = {
  items: AnnouncementItem[];
};

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ANNOUNCEMENT_FILE)) {
    const now = new Date().toISOString();
    const seeded: AnnouncementItem[] = defaultAnnouncements.map((item) => ({
      id: randomUUID(),
      title: item.title,
      body: item.body,
      highlight: item.highlight,
      createdAt: now,
      updatedAt: now,
    }));
    fs.writeFileSync(ANNOUNCEMENT_FILE, JSON.stringify({ items: seeded }, null, 2), "utf8");
  }
}

function readStore(): AnnouncementStore {
  ensureFile();
  const raw = fs.readFileSync(ANNOUNCEMENT_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.items)) {
      return { items: [] };
    }
    return {
      items: (parsed.items as AnnouncementItem[]).map((item) => ({
        ...item,
        id: item.id || randomUUID(),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to parse announcement store", error);
    return { items: [] };
  }
}

function writeStore(store: AnnouncementStore) {
  ensureFile();
  const normalized = store.items
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  fs.writeFileSync(ANNOUNCEMENT_FILE, JSON.stringify({ items: normalized }, null, 2), "utf8");
}

function assertFields(title?: string, body?: string) {
  if (!title || !title.trim()) throw new Error("empty_title");
  if (!body || !body.trim()) throw new Error("empty_body");
}

export function getAnnouncements() {
  const { items } = readStore();
  return items.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createAnnouncement({
  title,
  body,
  highlight,
}: {
  title: string;
  body: string;
  highlight?: string;
}): AnnouncementItem {
  assertFields(title, body);
  const store = readStore();
  if (store.items.length >= MAX_ANNOUNCEMENTS) {
    store.items.pop();
  }
  const now = new Date().toISOString();
  const entry: AnnouncementItem = {
    id: randomUUID(),
    title: title.trim(),
    body: body.trim(),
    highlight: highlight?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
  store.items.unshift(entry);
  writeStore(store);
  return entry;
}

export function updateAnnouncement(
  id: string,
  { title, body, highlight }: { title: string; body: string; highlight?: string }
): AnnouncementItem {
  assertFields(title, body);
  const store = readStore();
  const index = store.items.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("not_found");
  const now = new Date().toISOString();
  store.items[index] = {
    ...store.items[index],
    title: title.trim(),
    body: body.trim(),
    highlight: highlight?.trim() || undefined,
    updatedAt: now,
  };
  writeStore(store);
  return store.items[index];
}

export function deleteAnnouncement(id: string) {
  const store = readStore();
  if (process.env.NODE_ENV !== "production") {
    console.log("[announcements] delete", {
      id,
      file: ANNOUNCEMENT_FILE,
      count: store.items.length,
      ids: store.items.map((item) => item.id),
    });
  }
  const index = store.items.findIndex((item) => item.id === id);
  if (index === -1) return false;
  store.items.splice(index, 1);
  writeStore(store);
  return true;
}

export { MAX_ANNOUNCEMENTS };
