import { calculateMashhadPrayerTimes, PrayerTimesResult } from './prayer-times-calculator';
import { getTehranDateParts, gregorianToShamsi, shamsiToGregorian } from './calendar';
import { formatShamsiDate } from './shamsi-events';

export type ShamsiDateParts = {
  year: number;
  month: number;
  day: number;
};

export type PrayerDayPayload = {
  date: string;
  shamsiDate: string;
  shamsiParts: ShamsiDateParts;
  city: string;
  prayerTimes: PrayerTimesResult;
  timestamp: string;
};

const CITY_NAME = 'مشهد';
const DEFAULT_CACHE_WINDOW = 366;
const DEFAULT_BACKFILL_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const CACHE = new Map<string, PrayerDayPayload>();
let cachePrewarmed = false;

function normalizeDateInput(input?: string | Date): Date {
  const value = input instanceof Date ? input : input ? new Date(input) : new Date();
  if (Number.isNaN(value.getTime())) {
    throw new Error('invalid_date');
  }
  const { year, month, day } = getTehranDateParts(value);
  return new Date(Date.UTC(year, month - 1, day));
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function computePayload(date: Date): PrayerDayPayload {
  const shamsiParts = gregorianToShamsi(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const shamsiDate = formatShamsiDate(shamsiParts.year, shamsiParts.month, shamsiParts.day, true);
  const prayerTimes = calculateMashhadPrayerTimes(date);
  return {
    date: isoDate(date),
    shamsiDate,
    shamsiParts,
    city: CITY_NAME,
    prayerTimes,
    timestamp: new Date().toISOString(),
  };
}

function ensureCached(date: Date) {
  const key = isoDate(date);
  if (!CACHE.has(key)) {
    CACHE.set(key, computePayload(date));
  }
}

export function getPrayerDay(dateInput?: string | Date): PrayerDayPayload {
  const normalized = normalizeDateInput(dateInput);
  ensureCached(normalized);
  const key = isoDate(normalized);
  const payload = CACHE.get(key);
  if (!payload) {
    throw new Error('prayer_cache_error');
  }
  return payload;
}

export function warmPrayerCache(days: number = DEFAULT_CACHE_WINDOW, startDate?: string | Date) {
  const start = normalizeDateInput(startDate);
  const cursor = new Date(start.getTime());
  for (let i = 0; i < days; i += 1) {
    ensureCached(cursor);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
}

export function clearPrayerCache() {
  CACHE.clear();
  cachePrewarmed = false;
}

export function hydrateShamsiDate(shamsiDate: string): Date {
  const [year, month, day] = shamsiDate.split('-').map(Number);
  if ([year, month, day].some((n) => Number.isNaN(n))) {
    throw new Error('invalid_shamsi_date');
  }
  return shamsiToGregorian(year, month, day);
}

type PrewarmOptions = {
  daysForward?: number;
  daysBackward?: number;
  startDate?: string | Date;
  force?: boolean;
};

export function ensurePrayerCachePrewarmed(options: PrewarmOptions = {}) {
  if (cachePrewarmed && !options.force) {
    return;
  }

  const daysForward = options.daysForward ?? DEFAULT_CACHE_WINDOW;
  const daysBackward = options.daysBackward ?? DEFAULT_BACKFILL_DAYS;
  const totalDays = daysForward + daysBackward;

  const startReference = options.startDate
    ? normalizeDateInput(options.startDate)
    : normalizeDateInput(new Date(Date.now() - daysBackward * DAY_MS));

  warmPrayerCache(totalDays, startReference);
  cachePrewarmed = true;
}

ensurePrayerCachePrewarmed();
