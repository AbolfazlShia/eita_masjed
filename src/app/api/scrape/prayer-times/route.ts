import { NextResponse } from 'next/server';

async function fetchHtml(url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': 'masjed-scraper/1.0' } });
  if (!res.ok) throw new Error('Failed to fetch source');
  return await res.text();
}

function findTimesFromHtml(html: string) {
  // Very simple heuristic parser: find all HH:MM occurrences
  const times = Array.from(html.matchAll(/(\d{1,2}:\d{2})/g)).map(m => m[1]);
  // If we have at least 7 times, take first 7
  if (times.length >= 7) {
    return {
      fajr: times[0],
      sunrise: times[1],
      zuhr: times[2],
      asr: times[3],
      sunset: times[4],
      maghrib: times[5],
      isha: times[6],
      midnight: times[7] || '',
    };
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const source = body.url || process.env.PRAYER_SOURCE_URL || 'https://www.bahesab.ir/';
    const html = await fetchHtml(source);
    const times = findTimesFromHtml(html);
    if (!times) return NextResponse.json({ ok: false, error: 'no_times_found' }, { status: 422 });

    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const payload = { ok: true, date, city: 'mashhad', prayerTimes: times, timestamp: new Date().toISOString() };

    const fs = require('fs');
    const path = require('path');
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const dataFile = path.join(dataDir, 'prayer-times.json');
    fs.writeFileSync(dataFile, JSON.stringify(payload, null, 2));

    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const fs = require('fs');
    const path = require('path');
    const dataFile = path.join(process.cwd(), 'data', 'prayer-times.json');
    if (!fs.existsSync(dataFile)) return NextResponse.json({ ok: false, error: 'no_data' }, { status: 404 });
    const raw = fs.readFileSync(dataFile, 'utf8');
    const obj = JSON.parse(raw);
    return NextResponse.json({ ok: true, ...obj });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
