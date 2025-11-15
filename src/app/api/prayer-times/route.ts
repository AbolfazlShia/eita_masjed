import { NextResponse } from 'next/server';
import { getTodayShamsiEvents, formatShamsiDate } from '@/lib/shamsi-events';

// تبدیل میلادی به شمسی
function gregorianToShamsi(date: Date) {
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

export async function GET(req: Request) {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // دریافت تاریخ شمسی
    const shamsiDate = gregorianToShamsi(today);
    const shamsiDateStr = formatShamsiDate(shamsiDate.year, shamsiDate.month, shamsiDate.day, true);

    // اگر فایل ذخیره‌شده وجود دارد آن را سرو کنیم
    const fs = require('fs');
    const path = require('path');
    const dataFile = path.join(process.cwd(), 'data', 'prayer-times.json');
    if (fs.existsSync(dataFile)) {
      try {
        const raw = fs.readFileSync(dataFile, 'utf8');
        const obj = JSON.parse(raw);
        if (obj && obj.date === `${year}-${month}-${day}`) {
          const events = getTodayShamsiEvents();
          return NextResponse.json({
            ok: true,
            date: obj.date,
            shamsiDate: shamsiDateStr,
            city: obj.city || 'مشهد',
            prayerTimes: obj.prayerTimes,
            events,
            timestamp: obj.timestamp,
          });
        }
      } catch (e) {
        // fall through to default
      }
    }

    // اوقات شرعی نمونه برای مشهد (fallback)
    const prayerTimes = {
      fajr: '04:40',
      sunrise: '06:08',
      zuhr: '11:16',
      asr: '14:45',
      sunset: '16:24',
      maghrib: '16:43',
      isha: '18:10',
      midnight: '22:32',
    };

    const events = getTodayShamsiEvents();

    return NextResponse.json({
      ok: true,
      date: `${year}-${month}-${day}`,
      shamsiDate: shamsiDateStr,
      city: 'مشهد',
      prayerTimes,
      events,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch prayer times' },
      { status: 500 }
    );
  }
}
