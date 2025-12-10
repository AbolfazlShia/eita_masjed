import { NextResponse } from 'next/server';
import { formatShamsiDate } from '@/lib/shamsi-events';
import { calculateMashhadPrayerTimes } from '@/lib/prayer-times-calculator';
import { getErrorMessage } from '@/lib/errors';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    if (Number.isNaN(targetDate.getTime())) {
      return NextResponse.json({ ok: false, error: 'invalid_date' }, { status: 400 });
    }

    const isoDate = targetDate.toISOString().slice(0, 10);
    const [jy, jm, jd] = formatShamsiDate(targetDate.getFullYear(), targetDate.getMonth() + 1, targetDate.getDate(), false)
      .split('-')
      .map((v) => parseInt(v, 10));
    const shamsiDateStr = formatShamsiDate(jy, jm, jd, true);

    const prayerTimes = calculateMashhadPrayerTimes(targetDate);

    return NextResponse.json({
      ok: true,
      date: isoDate,
      shamsiDate: shamsiDateStr,
      city: 'مشهد',
      prayerTimes,
      events: [],
      source: { prayer: 'calculated' },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error, 'Failed to fetch prayer times') },
      { status: 500 }
    );
  }
}
