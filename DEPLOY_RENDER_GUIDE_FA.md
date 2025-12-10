# راهنمای استقرار روی Render

## خلاصه
این راهنما شما را در استقرار نسخهٔ تولیدی برنامهٔ مسجد روی Render (یک سرویس hostingِ رایگان و قابلِ اعتماد) آموزش می‌دهد.

## پیش‌نیازها
- حساب فعال روی [Render.com](https://render.com)
- Repository GitHub متصل (https://github.com/AbolfazlShia/eita_masjed)

## مراحل استقرار

### 1. ساخت Render Web Service

1. وارد https://dashboard.render.com شوید
2. بر روی **"New +" > "Web Service"** کلیک کنید
3. روی Repository فعلی شما (**masjed**) کلیک کنید
4. تنظیمات زیر را انجام دهید:

| تنظیم | مقدار |
|-------|--------|
| **Name** | `masjed-app` |
| **Environment** | Node |
| **Region** | `frankfurt` (یا نزدیک‌تر به شما) |
| **Plan** | Free (یا Starter اگر نیاز به عملکرد بیشتر) |
| **Branch** | `main` |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm run start` |

### 2. تنظیم متغیرهای محیطی

بعد از ساخت Web Service، روی **"Environment"** کلیک کنید و متغیرهای زیر را اضافه کنید:

#### الزامی (حداقل):
- `NODE_ENV` = `production`
- `NODE_VERSION` = `20`
- `NEXT_PUBLIC_API_URL` = آدرس دامنه (مثلاً `https://masjed-app.onrender.com`)

#### اختیاری
- `NEXT_PUBLIC_APP_VERSION` = مثلا `2.0.0`
- `HCAPTCHA_SECRET` / `HCAPTCHA_SITEKEY` (برای فعال‌کردن hCaptcha)

### 3. استقرار و مانیتورینگ

1. Render به‌طور خودکار deploy کند یا روی **"Deploy"** کلیک کنید
2. در تب **"Logs"** عملیات ساخت را دنبال کنید
3. بعد از پایان ساخت (معمولاً ۲-۵ دقیقه)، URL service (مثلاً `https://masjed-app.onrender.com`) نمایش داده می‌شود

## اطلاعات مهم

### پایگاه‌داده
- این برنامه از JSON fallback استفاده می‌کند (بدون نیاز به دیتابیس خارجی)
- داده‌ها در فایل `data/store.json` (ذخیره محلی) یا SQLite (اگر نصب باشد) ذخیره می‌شوند
- برای دیتابیس دائمی در Render، می‌توانید PostgreSQL را اضافه کنید (درخواست منفصل)

### Session و احراز هویت
- کاربران بعد از login با استفاده از HttpOnly Cookie ثابت نگه داشته می‌شوند
- PIN‌های کاربران با bcryptjs هش می‌شوند
- Admin با نام `مدیر` و PIN `modir5` به‌طور پیش‌فرض ساخته می‌شود

### درخواست‌های مهم API
- `GET /` → صفحهٔ معرفی و لینک اپ اندروید
- `GET /dashboard` → داشبورد (نیاز به login)
- `POST /api/auth/register` → ثبت‌نام کاربر جدید
- `POST /api/auth/login` → ورود
- `POST /api/auth/logout` → خروج
- `GET /api/auth/me` → اطلاعات کاربر فعلی
- `GET /api/prayer-times` → اوقات شرعی (ورودی میلادی)
- `GET /api/prayer-by-date` → اوقات شرعی (ورودی میلادی/شمسی)

## مسائل شایع و حل‌ها

### خطای "Build failed"
- اطمینان حاصل کنید که `npm run build` به‌صورت محلی موفق است
- چک کنید که `package.json` و `package-lock.json` موجود هستند

### صفحهٔ سفید / 503
- منتظر بمانید تا deployment مکمل شود
- چک کنید که لاگ‌های build هیچ خطای فاحش دارند
- Render free plan ممکن است بعد از non-activity از کار افتد (spin-up delay)

### خطای database / file system
- برای free plan، فایل‌های موقت پاک می‌شوند؛ JSON store `data/store.json` ممکن است تنها session active را نگه دارد
- برای persistence دائمی، PostgreSQL را اضافه کنید

## مراحل بعدی و بهتری

1. **Enable HTTPS**: Render به‌طور خودکار HTTPS فراهم می‌کند
2. **Custom Domain**: اگر domain شخصی دارید، آن را به Render متصل کنید
3. **Database**: برای persistence بیشتر، یک PostgreSQL Render Postgres اضافه کنید
4. **Monitoring**: Render Alerts را برای downtime فعال کنید
5. **Monitoring**: لاگ‌ها را دوره‌ای بررسی کنید؛ الگوریتم داخلی نیاز به Cron ندارد

## پیوندهای مفید
- [Render Documentation](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables in Render](https://render.com/docs/environment-variables)

## پشتیبانی
اگر مشکلی داشتید:
1. لاگ‌های Render را بررسی کنید (`Logs` tab)
2. تأیید کنید که تمام متغیرهای محیطی تنظیم شده‌اند
3. بررسی کنید که repository شما up-to-date است
