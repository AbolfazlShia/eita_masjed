const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

const IRAN_TIMEZONE = 3.5; // Iran Standard Time (UTC+3:30, no DST)
const MASHHAD_COORDINATES = {
  latitude: 36.2605,
  longitude: 59.6168,
};

const METHOD_PARAMS = {
  fajrAngle: 17.7, // Tehran / IIG based
  sunriseAngle: 0.833,
  sunsetAngle: 0.833,
  maghribAngle: 4.5,
  ishaAngle: 14,
  asrFactor: 1, // Ja'fari shadow factor
};

export type PrayerTimesResult = {
  fajr: string;
  sunrise: string;
  zuhr: string;
  asr: string;
  sunset: string;
  maghrib: string;
  midnight: string;
};

export type PrayerTimesRangeResult = {
  date: string;
  shamsiDate?: string;
  prayerTimes: PrayerTimesResult;
};

function toRad(value: number): number {
  return value * DEG_TO_RAD;
}

function toDeg(value: number): number {
  return value * RAD_TO_DEG;
}

function fixAngle(angle: number): number {
  return angle - 360 * Math.floor(angle / 360);
}

function fixHour(hour: number): number {
  return hour - 24 * Math.floor(hour / 24);
}

function normalizeDate(input: Date | string): Date {
  if (input instanceof Date) {
    return new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()));
  }
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("invalid_date");
  }
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

function julianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
  return JD;
}

function sunPosition(julian: number) {
  const D = julian - 2451545;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * Math.sin(toRad(g)) + 0.020 * Math.sin(toRad(2 * g)));
  const e = 23.439 - 0.00000036 * D;

  const RA = Math.atan2(Math.cos(toRad(e)) * Math.sin(toRad(L)), Math.cos(toRad(L))) / DEG_TO_RAD / 15;
  const declination = Math.asin(Math.sin(toRad(e)) * Math.sin(toRad(L))) / DEG_TO_RAD;
  const equation = q / 15 - fixHour(RA);

  return { declination, equation };
}

function hourAngleAtAltitude(angle: number, latitude: number, declination: number) {
  const numerator = Math.sin(toRad(angle)) - Math.sin(toRad(latitude)) * Math.sin(toRad(declination));
  const denominator = Math.cos(toRad(latitude)) * Math.cos(toRad(declination));
  const x = Math.min(Math.max(numerator / denominator, -1), 1);
  return Math.acos(x) / DEG_TO_RAD / 15;
}

function dayPortion(times: Record<string, number>) {
  const portions: Record<string, number> = {};
  Object.entries(times).forEach(([key, value]) => {
    portions[key] = value / 24;
  });
  return portions;
}

function computeMidDay(portion: number, julian: number) {
  const { equation } = sunPosition(julian + portion);
  return fixHour(12 - equation);
}

function computeTime(angle: number, portion: number, julian: number, latitude: number, beforeNoon: boolean) {
  const { declination } = sunPosition(julian + portion);
  const midDay = computeMidDay(portion, julian);
  const hourAngle = hourAngleAtAltitude(angle, latitude, declination);
  return midDay + (beforeNoon ? -hourAngle : hourAngle);
}

function computeAsr(portion: number, julian: number, latitude: number, factor: number) {
  const { declination } = sunPosition(julian + portion);
  const angle = -toDeg(Math.atan(1 / (factor + Math.tan(Math.abs(toRad(latitude - declination))))));
  return computeTime(angle, portion, julian, latitude, false);
}

function adjustTimes(times: Record<string, number>, timezone: number, longitude: number) {
  const offset = timezone - longitude / 15;
  const adjusted: Record<string, number> = {};
  Object.entries(times).forEach(([key, value]) => {
    adjusted[key] = fixHour(value + offset);
  });
  return adjusted;
}

function formatTime(value: number): string {
  const totalMinutes = Math.round(fixHour(value) * 60);
  const hours = ((Math.floor(totalMinutes / 60) % 24) + 24) % 24;
  const minutes = Math.abs(totalMinutes % 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function calculateRawTimes(date: Date) {
  const jd = julianDay(date);
  const lat = MASHHAD_COORDINATES.latitude;
  let times = {
    fajr: 5,
    sunrise: 6,
    zuhr: 12,
    asr: 13,
    sunset: 18,
    maghrib: 18.2,
    isha: 20,
  };

  for (let i = 0; i < 3; i += 1) {
    const portion = dayPortion(times);
    times = {
      fajr: computeTime(-METHOD_PARAMS.fajrAngle, portion.fajr, jd, lat, true),
      sunrise: computeTime(-METHOD_PARAMS.sunriseAngle, portion.sunrise, jd, lat, true),
      zuhr: computeMidDay(portion.zuhr, jd),
      asr: computeAsr(portion.asr, jd, lat, METHOD_PARAMS.asrFactor),
      sunset: computeTime(-METHOD_PARAMS.sunsetAngle, portion.sunset, jd, lat, false),
      maghrib: computeTime(-METHOD_PARAMS.maghribAngle, portion.maghrib, jd, lat, false),
      isha: computeTime(-METHOD_PARAMS.ishaAngle, portion.isha, jd, lat, false),
    };
  }

  return adjustTimes(times, IRAN_TIMEZONE, MASHHAD_COORDINATES.longitude);
}

function computeMidnightHour(sunsetHour: number, nextFajrHour: number) {
  const nightDuration = (24 - sunsetHour) + nextFajrHour;
  const midnightHour = sunsetHour + nightDuration / 2;
  return fixHour(midnightHour);
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function calculateMashhadPrayerTimes(dateInput: Date | string): PrayerTimesResult {
  const date = normalizeDate(dateInput);
  const rawToday = calculateRawTimes(date);
  const nextDay = startOfDay(date);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const rawTomorrow = calculateRawTimes(nextDay);
  const midnightHour = computeMidnightHour(rawToday.sunset, rawTomorrow.fajr);

  return {
    fajr: formatTime(rawToday.fajr),
    sunrise: formatTime(rawToday.sunrise),
    zuhr: formatTime(rawToday.zuhr),
    asr: formatTime(rawToday.asr),
    sunset: formatTime(rawToday.sunset),
    maghrib: formatTime(rawToday.maghrib),
    midnight: formatTime(midnightHour),
  };
}

export function calculatePrayerTimesRange(start: Date | string, end: Date | string) {
  const startDate = normalizeDate(start);
  const endDate = normalizeDate(end);
  if (endDate.getTime() < startDate.getTime()) {
    throw new Error("invalid_range");
  }
  const results: { date: string; prayerTimes: PrayerTimesResult }[] = [];
  const cursor = new Date(startDate.getTime());
  while (cursor.getTime() <= endDate.getTime()) {
    const isoDate = cursor.toISOString().slice(0, 10);
    results.push({ date: isoDate, prayerTimes: calculateMashhadPrayerTimes(cursor) });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return results;
}
