import { toGregorian, toJalaali } from 'jalaali-js';

const TEHRAN_TIMEZONE = 'Asia/Tehran';

export function getTehranDate(date: Date): Date {
  return new Date(
    date.toLocaleString('en-US', {
      timeZone: TEHRAN_TIMEZONE,
    })
  );
}

export function getTehranDateParts(date: Date): { year: number; month: number; day: number; weekday: number } {
  const tehranDate = getTehranDate(date);
  return {
    year: tehranDate.getFullYear(),
    month: tehranDate.getMonth() + 1,
    day: tehranDate.getDate(),
    weekday: tehranDate.getDay(),
  };
}

// تبدیل تاریخ میلادی به شمسی
export function gregorianToShamsi(date: Date): { year: number; month: number; day: number } {
  const { year: gy, month: gm, day: gd } = getTehranDateParts(date);
  const { jy, jm, jd } = toJalaali(gy, gm, gd);
  return { year: jy, month: jm, day: jd };
}

// نام ماه‌های شمسی
export const shamsiMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

// نام روزهای هفته
export const weekDays = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];

// فرمت تاریخ شمسی
export function formatShamsiDate(date: Date): string {
  const shamsi = gregorianToShamsi(date);
  const { weekday } = getTehranDateParts(date);
  const weekDay = weekDays[(weekday + 1) % 7];
  const month = shamsiMonths[shamsi.month - 1];
  return `${weekDay} ${shamsi.day} ${month} ${shamsi.year}`;
}

// دریافت نام روز هفته
export function getWeekDayName(date: Date): string {
  return weekDays[getWeekDayNumber(date)];
}

// دریافت شماره روز هفته (0 = شنبه، 6 = جمعه)
export function getWeekDayNumber(date: Date): number {
  const tehran = getTehranDate(date);
  const jsDay = tehran.getDay();
  return (jsDay + 1) % 7;
}

// فرمت ساعت
export function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// تبدیل رشته‌ی ساعت (مثل "۰۴:۴۰") به شماره
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(":").map((x) => parseInt(x));
  return { hours: h, minutes: m };
}

// تبدیل شماره به فارسی
export function toPersianNumber(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

// تبدیل تاریخ شمسی به میلادی (خروجی Date در زمان محلی سیستم)
export function shamsiToGregorian(year: number, month: number, day: number): Date {
  const { gy, gm, gd } = toGregorian(year, month, day);
  return new Date(gy, gm - 1, gd);
}

// تبدیل شماره از فارسی به انگلیسی
export function fromPersianNumber(str: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  let result = str;
  persianDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, "g"), String(index));
  });
  return result;
}
