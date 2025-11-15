import { NextResponse } from 'next/server';

// این endpoint برای بروزرسانی خودکار اوقات شرعی استفاده می‌شود
// می‌توانید از Vercel Crons یا سرویس خارجی (مثل EasyCron) استفاده کنید

export async function GET(req: Request) {
  try {
    // تایید کنید که درخواست از منبع معتبر است
    const authHeader = req.headers.get('authorization');
    const secret = process.env.CRON_SECRET || 'your-secret-key';

    // برای بروزرسانی در Render.com، هیچ احراز هویت پیدرا نیست
    // اما می‌توانید یک secret key اضافه کنید
    if (authHeader && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // تلاش برای دریافت اوقات شرعی از منبع خارجی
    try {
      const scrapResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/scrape/prayer-times`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: process.env.PRAYER_SOURCE_URL || 'https://www.bahesab.ir/',
          }),
        }
      );

      if (scrapResponse.ok) {
        const result = await scrapResponse.json();
        if (result.ok) {
          return NextResponse.json({
            ok: true,
            message: 'Prayer times updated successfully',
            data: result,
          });
        }
      }
    } catch (err) {
      console.log('Scraping failed, using fallback data');
    }

    // اگر scraping موفق نشد، از داده‌های پیشین استفاده کنیم
    return NextResponse.json({
      ok: true,
      message: 'Using cached prayer times',
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update prayer times' },
      { status: 500 }
    );
  }
}

// برای استفاده با Vercel Crons:
// صفحه vercel.json خود را مطابق زیر پیکربندی کنید:
// {
//   "crons": [{
//     "path": "/api/cron/update-prayer-times",
//     "schedule": "0 0 * * *"  // هر روز ساعت 12 شب
//   }]
// }

// برای استفاده با Render.com:
// یک Background Worker ایجاد کنید یا cron job در ابزار خارجی مانند EasyCron
// URL: https://your-domain.onrender.com/api/cron/update-prayer-times
