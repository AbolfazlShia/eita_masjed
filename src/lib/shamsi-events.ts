// مناسبت های شمسی سال (ماه/روز)
export const shamsiEvents: Record<string, string[]> = {
  '1/1': ['عید نوروز', 'سال نو شمسی'],
  '1/6': ['دیدار خانوادگی'],
  '1/11': ['شهادت امام علی (ع)'],
  '1/19': ['عید نوروز'],
  
  '2/11': ['پیروزی انقلاب اسلامی'],
  '2/29': ['تولد امام خمینی (ره) / درگذشت امام خمینی'],
  
  '3/8': ['روز زن / تولد فاطمه (س)'],
  '3/17': ['شهادت امام علی (ع)'],
  
  '4/1': ['روز جمهوری اسلامی'],
  '4/14': ['شهادت امام زین‌العابدین (ع)'],
  
  '5/23': ['ولادت امام مهدی (عج)'],
  
  '6/3': ['شهادت امام جعفر صادق (ع)'],
  '6/5': ['قیام 15 خرداد'],
  
  '7/4': ['تاسوعا'],
  '7/5': ['عاشورا - شهادت امام حسین (ع)'],
  '7/6': ['غدیر خم - روز بزرگداشت / تولد پیامبر (ص)'],
  
  '8/15': ['تاسوعا'],
  '8/16': ['عاشورا - شهادت امام حسین (ع)'],
  '8/17': ['چهلم امام حسین (ع)'],
  
  '9/8': ['روز اول ماه رمضان'],
  '9/16': ['شب قدر (19 رمضان)'],
  '9/17': ['روز قدر'],
  '9/18': ['شب عید فطر (آخرین شب رمضان)'],
  '9/19': ['عید فطر'],
  
  '10/25': ['عید قربان'],
  '10/26': ['تشریق اول'],
  '10/27': ['تشریق دوم'],
  '10/28': ['تشریق سوم / روز استراحت'],
  
  '11/15': ['نیمه شعبان - تولد امام مهدی (عج)'],
  
  '12/29': ['شب عید / روز بزرگداشت حضرت فاطمه (س)'],
  '12/30': ['شامگاه سال / پایان سال'],
};

// مناسبت های میلادی شمسی (برای تماشای تقویم)
export const islamicMonthNames = [
  'محرم',
  'صفر',
  'ربیع‌الاول',
  'ربیع‌الثانی',
  'جمادی‌الاول',
  'جمادی‌الثانی',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذی‌القعده',
  'ذی‌الحجه',
];

// اهم مناسبت های هلالی (قمری)
export const islamicEvents: Record<string, string[]> = {
  '1/9': ['تاسوعا'],
  '1/10': ['عاشورا - شهادت امام حسین (ع)'],
  '1/11': ['چهلم امام حسین (ع)'],
  '1/15': ['نیمه شعبان کمتر شدن', '۱۵ محرم'],
  
  '7/15': ['نیمه شعبان - تولد امام مهدی (عج)'],
  '7/27': ['شب قدر'],
  
  '8/1': ['اول رمضان'],
  '8/19': ['شب قدر'],
  '8/21': ['شب قدر'],
  '8/23': ['شب قدر'],
  '8/29': ['آخرین روز رمضان'],
  
  '9/1': ['عید فطر'],
  
  '10/10': ['عید قربان'],
  '11/10': ['عید غدیر - عید بزرگ'],
};

// دریافت مناسبت‌های امروز (شمسی)
export function getTodayShamsiEvents(): string[] {
  const today = new Date();
  const gy = today.getFullYear();
  const gm = today.getMonth() + 1;
  const gd = today.getDate();

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

  const jd = j_d_n + 1;
  const key = `${jm}/${jd}`;
  
  return shamsiEvents[key] || [];
}

// دریافت مناسبت‌های یک روز مشخص (شمسی)
export function getShamsiEventsByDate(
  year: number,
  month: number,
  day: number
): string[] {
  const key = `${month}/${day}`;
  return shamsiEvents[key] || [];
}

// دریافت مناسبت‌های یک ماه (شمسی)
export function getShamsiEventsByMonth(month: number): Record<number, string[]> {
  const events: Record<number, string[]> = {};
  
  for (const [dateKey, eventList] of Object.entries(shamsiEvents)) {
    const [m, d] = dateKey.split('/').map(Number);
    if (m === month) {
      events[d] = eventList;
    }
  }
  
  return events;
}

// فرمت‌کردن روز شمسی
export function formatShamsiDate(
  year: number,
  month: number,
  day: number,
  withDayName: boolean = false
): string {
  const shamsiMonths = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ];

  const dayNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

  const monthName = shamsiMonths[month - 1];
  let result = `${day} ${monthName} ${year}`;

  if (withDayName) {
    // محاسبه روز هفته برای تاریخ شمسی
    const fullDate = shamsiToGregorian(year, month, day);
    const dayIndex = fullDate.getDay();
    result = `${dayNames[dayIndex]} ${day} ${monthName} ${year}`;
  }

  return result;
}

// تبدیل شمسی به میلادی
export function shamsiToGregorian(
  jy: number,
  jm: number,
  jd: number
): Date {
  let j_d_n = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4) + 78 + jd;

  for (let i = 1; i < jm; i++) {
    j_d_n += i <= 6 ? 31 : 30;
  }

  let gy = 400 * Math.floor(j_d_n / 146097);
  j_d_n %= 146097;

  let flag = true;
  if (j_d_n >= 36525) {
    j_d_n--;
    gy += 100 * Math.floor(j_d_n / 36524);
    j_d_n %= 36524;
    if (j_d_n >= 365) j_d_n++;
    flag = false;
  }

  gy += 4 * Math.floor(j_d_n / 1461);
  j_d_n %= 1461;

  if (flag && j_d_n >= 366) {
    j_d_n--;
    gy += Math.floor(j_d_n / 365);
    j_d_n = (j_d_n % 365) + 1;
  }

  let isLeap =
    (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0);
  let sal_a = [0, 31, isLeap ? 60 : 59, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];

  let gm = 0;
  for (let v = 0; v < 13; v++) {
    v2 = sal_a[v];
    if (j_d_n <= v2) {
      gm = v;
      break;
    }
  }

  let gd = j_d_n - sal_a[gm - 1];

  return new Date(gy, gm - 1, gd);
}

// متغیر کمکی
let v2: number;
