import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { HADITH_LIMIT } from "@/constants/hadiths";

export type HadithItem = {
  id: string;
  order: number;
  text: string;
  translation: string;
  source: string;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = path.resolve(process.cwd(), "data");
const HADITH_FILE = path.join(DATA_DIR, "hadiths.json");
const MAX_HADITHS = HADITH_LIMIT;

const defaultHadiths = [
  {
    text: "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ",
    translation: "مؤمنان برادر یکدیگرند؛ میان برادران خود اصلاح برقرار کنید.",
    source: "قرآن کریم، سوره حجرات آیه ۱۰",
  },
  {
    text: "رَحِمَ اللّٰهُ عَبْدًا أَحْيَا حَقًّا وَأَمَاتَ بَاطِلًا",
    translation: "خدا رحمت کند بنده‌ای را که حقی را زنده و باطلی را نابود سازد.",
    source: "امام علی (ع) - نهج‌البلاغه، خطبه ۱۷۴",
  },
  {
    text: "مَنْ ذَكَرَ اللّٰهَ كَثِيرًا أَحَبَّهُ اللّٰهُ كَثِيرًا",
    translation: "هر که بسیار یاد خدا کند، خدا نیز او را بسیار دوست می‌دارد.",
    source: "امام صادق (ع) - کافی، ج ۲، ص ۵۰۳",
  },
  {
    text: "أَحَبُّ النَّاسِ إِلَى اللّٰهِ أَنْفَعُهُمْ لِلنَّاسِ",
    translation: "محبوب‌ترین مردم نزد خدا کسی است که سودش به مردم بیشتر برسد.",
    source: "پیامبر اکرم (ص) - کنزالعمال، ح ۱۷۲۰۳",
  },
  {
    text: "اَلزَّائِرُ لَنَا كَزَائِرِ الرَّسُولِ اللّٰهِ",
    translation: "زیارت‌کننده ما همچون زیارت‌کننده رسول خدا (ص) است.",
    source: "امام رضا (ع) - کامل الزیارات، باب ۶۲",
  },
];

type HadithStore = {
  hadiths: HadithItem[];
};

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(HADITH_FILE)) {
    const now = new Date().toISOString();
    const seeded = defaultHadiths.map((item, index) => ({
      id: randomUUID(),
      order: index,
      text: item.text,
      translation: item.translation,
      source: item.source,
      createdAt: now,
      updatedAt: now,
    }));
    fs.writeFileSync(HADITH_FILE, JSON.stringify({ hadiths: seeded }, null, 2), "utf8");
  }
}

function readStore(): HadithStore {
  ensureFile();
  const raw = fs.readFileSync(HADITH_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.hadiths)) {
      return { hadiths: [] };
    }
    return {
      hadiths: (parsed.hadiths as HadithItem[]).map((item, index) => ({
        ...item,
        id: item.id || randomUUID(),
        order: typeof item.order === "number" ? item.order : index,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to parse hadith store", error);
    return { hadiths: [] };
  }
}

function writeStore(store: HadithStore) {
  ensureFile();
  const normalized = store.hadiths
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index }));
  fs.writeFileSync(HADITH_FILE, JSON.stringify({ hadiths: normalized }, null, 2), "utf8");
}

export function getHadiths(): HadithItem[] {
  const { hadiths } = readStore();
  return hadiths.slice().sort((a, b) => a.order - b.order);
}

function assertFields(text?: string, translation?: string, source?: string) {
  if (!text || !text.trim()) throw new Error("empty_text");
  if (!translation || !translation.trim()) throw new Error("empty_translation");
  if (!source || !source.trim()) throw new Error("empty_source");
}

export function createHadith({
  text,
  translation,
  source,
}: {
  text: string;
  translation: string;
  source: string;
}): HadithItem {
  assertFields(text, translation, source);
  const store = readStore();
  if (store.hadiths.length >= MAX_HADITHS) {
    throw new Error("limit_reached");
  }
  const now = new Date().toISOString();
  const hadith: HadithItem = {
    id: randomUUID(),
    order: store.hadiths.length,
    text: text.trim(),
    translation: translation.trim(),
    source: source.trim(),
    createdAt: now,
    updatedAt: now,
  };
  store.hadiths.push(hadith);
  writeStore(store);
  return hadith;
}

export function updateHadith(
  id: string,
  { text, translation, source }: { text: string; translation: string; source: string }
): HadithItem {
  assertFields(text, translation, source);
  const store = readStore();
  const index = store.hadiths.findIndex((h) => h.id === id);
  if (index === -1) throw new Error("not_found");
  const now = new Date().toISOString();
  store.hadiths[index] = {
    ...store.hadiths[index],
    text: text.trim(),
    translation: translation.trim(),
    source: source.trim(),
    updatedAt: now,
  };
  writeStore(store);
  return store.hadiths[index];
}

export function deleteHadith(id: string) {
  const store = readStore();
  const index = store.hadiths.findIndex((h) => h.id === id);
  if (index === -1) throw new Error("not_found");
  store.hadiths.splice(index, 1);
  writeStore(store);
}

export function reorderHadiths(ids: string[]) {
  const store = readStore();
  if (ids.length !== store.hadiths.length) throw new Error("length_mismatch");
  const idSet = new Set(ids);
  if (idSet.size !== store.hadiths.length) throw new Error("invalid_ids");
  const map = new Map(store.hadiths.map((h) => [h.id, h] as const));
  const reordered: HadithItem[] = ids.map((id, index) => {
    const item = map.get(id);
    if (!item) throw new Error("invalid_ids");
    return { ...item, order: index };
  });
  writeStore({ hadiths: reordered });
}

export function getDefaultHadiths() {
  return defaultHadiths;
}

export { MAX_HADITHS };
