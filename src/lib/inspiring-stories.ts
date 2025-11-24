import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type InspiringStoryItem = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
};

export type InspiringStoryPayload = Omit<InspiringStoryItem, "id" | "createdAt" | "updatedAt">;

type InspiringStoryStore = {
  stories: InspiringStoryItem[];
};

const DATA_DIR = path.resolve(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "inspiring-stories.json");
const MAX_STORIES = 200;

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({ stories: [] }, null, 2), "utf8");
  }
}

function readStore(): InspiringStoryStore {
  ensureFile();
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.stories)) {
      return { stories: [] };
    }
    return {
      stories: (parsed.stories as InspiringStoryItem[]).map((story) => ({
        ...story,
        id: story.id || randomUUID(),
        title: `${story.title ?? ""}`.trim(),
        excerpt: `${story.excerpt ?? ""}`.trim(),
        createdAt: story.createdAt || new Date().toISOString(),
        updatedAt: story.updatedAt || new Date().toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to parse inspiring-stories store", error);
    return { stories: [] };
  }
}

function writeStore(store: InspiringStoryStore) {
  ensureFile();
  const normalized = store.stories
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.title.localeCompare(b.title));
  fs.writeFileSync(STORE_FILE, JSON.stringify({ stories: normalized }, null, 2), "utf8");
}

function assertFields(payload: Partial<InspiringStoryPayload>) {
  if (!payload.title || !payload.title.trim()) throw new Error("empty_title");
  if (!payload.excerpt || !payload.excerpt.trim()) throw new Error("empty_excerpt");
}

export function getInspiringStories(): InspiringStoryItem[] {
  return readStore().stories;
}

export function createInspiringStory(payload: InspiringStoryPayload): InspiringStoryItem {
  assertFields(payload);
  const store = readStore();
  if (store.stories.length >= MAX_STORIES) {
    throw new Error("limit_reached");
  }
  const now = new Date().toISOString();
  const record: InspiringStoryItem = {
    id: randomUUID(),
    title: payload.title.trim(),
    excerpt: payload.excerpt.trim(),
    createdAt: now,
    updatedAt: now,
  };
  store.stories.unshift(record);
  writeStore(store);
  return record;
}

export function updateInspiringStory(id: string, payload: InspiringStoryPayload): InspiringStoryItem {
  assertFields(payload);
  const store = readStore();
  const index = store.stories.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error("not_found");
  }
  const now = new Date().toISOString();
  const updated: InspiringStoryItem = {
    ...store.stories[index],
    title: payload.title.trim(),
    excerpt: payload.excerpt.trim(),
    updatedAt: now,
  };
  store.stories[index] = updated;
  writeStore(store);
  return updated;
}

export function deleteInspiringStory(id: string) {
  const store = readStore();
  const index = store.stories.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }
  store.stories.splice(index, 1);
  writeStore(store);
  return true;
}

export function getInspiringStoryLimit() {
  return MAX_STORIES;
}
