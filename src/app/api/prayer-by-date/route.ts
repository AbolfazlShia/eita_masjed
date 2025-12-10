import { NextResponse } from 'next/server';

import { getPrayerDay, hydrateShamsiDate } from '@/lib/prayer-service';
import { getErrorMessage } from '@/lib/errors';

// دریافت اوقات شرعی برای تاریخ مشخص
export async function GET(req: Request) {
  try {
    // درخواست می‌تواند شامل date parameter باشد
    // مثال: /api/prayer-by-date?date=2025-11-15 یا ?shamsiDate=1403-08-24
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const shamsiDateParam = searchParams.get('shamsiDate');

    const targetDate = shamsiDateParam ? hydrateShamsiDate(shamsiDateParam) : dateParam ? new Date(dateParam) : new Date();
    if (Number.isNaN(targetDate.getTime())) {
      return NextResponse.json({ ok: false, error: 'invalid_date' }, { status: 400 });
    }

    const payload = getPrayerDay(targetDate);

    return NextResponse.json({
      ok: true,
      date: payload.date,
      shamsiDate: payload.shamsiDate,
      gregorianDate: payload.date,
      shamsiDate_parts: payload.shamsiParts,
      city: payload.city,
      prayerTimes: payload.prayerTimes,
      events: [],
      source: { prayer: 'calculated' },
      timestamp: payload.timestamp,
      cache: 'calculated',
    });
  } catch (error: unknown) {
    console.error('Error in prayer-by-date:', error);
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error, 'Failed to fetch prayer times') },
      { status: 500 }
    );
  }
}
