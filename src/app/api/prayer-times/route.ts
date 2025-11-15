import { NextResponse } from 'next/server';
import { getTodayShamsiEvents, formatShamsiDate } from '@/lib/shamsi-events';
import { toJalaali } from 'jalaali-js';

export async function GET(req: Request) {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // دریافت تاریخ شمسی با استفاده از jalaali-js
    const { jy, jm, jd } = toJalaali(year, parseInt(month), parseInt(day));
    const shamsiDateStr = formatShamsiDate(jy, jm, jd, true);

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
