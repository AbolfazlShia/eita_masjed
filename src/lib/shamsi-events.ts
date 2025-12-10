// مناسبت های شمسی سال (ماه/روز)
import { toGregorian } from 'jalaali-js';
import { gregorianToShamsi } from './calendar';

export const defaultShamsiEvents: Record<string, string[]> = {
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

export const shamsiEvents = defaultShamsiEvents;

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
  const { month, day } = gregorianToShamsi(new Date());
  const key = `${month}/${day}`;
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

  // در JavaScript مقدار getDay به صورت 0=Sunday, 1=Monday, ..., 6=Saturday است
  // این آرایه را طوری می‌چینیم که ایندکس 0 = یکشنبه، 1 = دوشنبه، ...، 6 = شنبه باشد
  const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];

  const monthName = shamsiMonths[month - 1];
  let result = `${day} ${monthName} ${year}`;

  if (withDayName) {
    // محاسبه روز هفته برای تاریخ شمسی با استفاده از jalaali-js
    const { gy, gm, gd } = toGregorian(year, month, day);
    const fullDate = new Date(gy, gm - 1, gd);
    const dayIndex = fullDate.getDay();
    result = `${dayNames[dayIndex]} ${day} ${monthName} ${year}`;
  }

  return result;
}

// تبدیل شمسی به میلادی


// حذف شده - از jalaali-js استفاده می‌کنیم
