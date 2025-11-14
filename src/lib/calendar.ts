// تبدیل تاریخ میلادی به شمسی
export function gregorianToShamsi(date: Date): { year: number; month: number; day: number } {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();

  let g_d_n = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400) + gd;

  let j_d_n = g_d_n - 79;

  let j_np = Math.floor(j_d_n / 12053);
  j_d_n %= 12053;

  let jy = 979 + 33 * j_np + 4 * Math.floor(j_d_n / 1461);

  j_d_n %= 1461;

  if (j_d_n >= 366) {
    jy += Math.floor((j_d_n - 1) / 365);
    j_d_n = (j_d_n - 1) % 365;
  }

  let jm = 1;
  for (let i = 0; i < 12; i++) {
    let v = i < 6 ? 31 : 30;
    if (i === 11) v = 29;
    if (j_d_n < v) break;
    j_d_n -= v;
    jm++;
  }

  return { year: jy, month: jm, day: j_d_n + 1 };
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
  const weekDay = weekDays[date.getDay()];
  const month = shamsiMonths[shamsi.month - 1];
  return `${weekDay} ${shamsi.day} ${month} ${shamsi.year}`;
}

// دریافت نام روز هفته
export function getWeekDayName(date: Date): string {
  return weekDays[date.getDay()];
}

// دریافت شماره روز هفته (0 = شنبه، 6 = جمعه)
export function getWeekDayNumber(date: Date): number {
  return date.getDay();
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

// تبدیل شماره از فارسی به انگلیسی
export function fromPersianNumber(str: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  let result = str;
  persianDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, "g"), String(index));
  });
  return result;
}
