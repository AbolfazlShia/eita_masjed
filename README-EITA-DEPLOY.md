راهنمای دریافت وب‌هوک از ایتا و مستقرسازی در GitHub / Netlify / Render (فارسی)

هدف
-----
این سند قدم‌به‌قدم توضیح می‌دهد چگونه این برنامه Next.js را آماده کنید، آن را به گیت‌هاب بفرستید و سپس روی Netlify یا Render مستقر کنید تا یک URL عمومی برای وب‌هوکِ ایتا داشته باشید.

چیزی که همین‌جا اضافه شده
------------------------
- مسیر وب‌هوک: `GET` و `POST` در `/api/eita/webhook` — فایل: `src/app/api/eita/webhook/route.ts`.
  - POST: دریافت payload از ایتا، بررسی توکن، و ذخیره پیام‌ها در `data/eita_messages.json` (برای توسعه محلی).
  - GET: بازگرداندن پیام‌های اخیر (تنها با توکن).

امنیت — توکن
---------------
وب‌هوک به یک توکن نیاز دارد. هنگام استقرار، متغیر محیطی زیر را تنظیم کنید:
- `EITA_TOKEN` (سرور-ساید، در محیط مانند Render/Netlify تنظیم شود)

برای توسعه محلی، می‌توانید از query param `?token=...` هم استفاده کنید ولی در تولید از متغیر محیطی استفاده کنید.

آماده‌سازی محلی و تست سریع
-------------------------
1) بسته‌ها را نصب کنید (یک بار):

```bash
npm install
```

2) اگر هنگام اجرای `npm run dev` خطای مربوط به Turbopack / فونت دیدید، با این دستور وب‌سرور dev را اجرا کنید:

```bash
# در zsh
NEXT_TURBOPACK=false npm run dev
```

3) یک درخواست نمونه POST برای تست وب‌هوک (در ترمینال جداگانه):

```bash
curl -X POST "http://localhost:3000/api/eita/webhook?token=TEST_TOKEN" -H "Content-Type: application/json" -d '{"from":"user123","text":"سلام"}'
```

اگر درست باشد پاسخ `{"ok":true}` دریافت می‌کنید و پیام در `data/eita_messages.json` ذخیره می‌شود.

استقرار در GitHub + Netlify
---------------------------
پیش‌نیاز: حساب GitHub و حساب Netlify ساخته باشید.

1) ایجاد مخزن و push کد به GitHub (مراحل محلی)

```bash
# داخل ریشه پروژه
git init
git add .
git commit -m "initial masjed app"
# سپس مخزن جدید در GitHub بساز و رشته remote را اضافه کن، مثلا:
git remote add origin git@github.com:YOUR_USERNAME/masjed.git
git branch -M main
git push -u origin main
```

2) آماده‌سازی برای Netlify

- Netlify نیاز به تنظیمات مخصوص Next.js دارد. ساده‌ترین راه استفاده از پلاگین رسمی Netlify برای Next.js است.
- در `package.json` نیازی به تغییر خاص نیست، اما باید یک `netlify.toml` اضافه کنید و پلاگین `@netlify/plugin-nextjs` را هنگام ساخت فعال کنید (Netlify این پلاگین را خودش نصب می‌کند وقتی پروژه Next.js تشخیص داده شود).

یک نمونه `netlify.toml` (در ریشه):

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

3) در پنل Netlify:
- سایت جدید بساز (Import from GitHub) و مخزن را انتخاب کن.
- در قسمت Build & deploy > Environment، اضافه کن:
  - `NODE_VERSION` (اختیاری) یا از `package.json` engines استفاده کن.
  - `EITA_TOKEN` = your-secret-token
- Deploy را اجرا کن. پس از پایان، URL سایت را دریافت می‌کنی.

4) آدرس وب‌هوک برای ایتا:

```
https://<your-netlify-site>.netlify.app/api/eita/webhook
```

توجه: اگر Netlify serverless lambda‌ها را هنگام build اجرا می‌کند، فایل سیستم محلی (data/) غیر دائم است؛ برای ذخیره‌سازی پایدار از یک دیتابیس استفاده کن (SQLite/Postgres/Supabase).

استقرار در Render
-----------------
Render از اپ‌های Node.js پشتیبانی می‌کند و برای Next.js با SSR یا static مناسب است.

1) در GitHub کد را push کن (همان مخزن).
2) در Render حساب بساز و یک New Web Service بساز.
  - Connect to GitHub repo
  - Branch: `main`
  - Build Command: `npm run build`
  - Start Command: `npm run start`
  - Environment: در بخش Environment متغیر زیر را تعریف کن:
    - `EITA_TOKEN` = your-secret-token
  - Instance Type: بر اساس نیاز انتخاب کن (Free starter کافی برای تست).

3) Deploy را بزن؛ پس از اتمام، یک URL عمومی دریافت می‌کنی مثل `https://your-app.onrender.com`.

4) وب‌هوک ایتا:

```
https://your-app.onrender.com/api/eita/webhook
```

نکات مهم درباره فایل‌سیستم و ذخیره‌سازی
---------------------------------------
- در Render اگر از یک Web Service استفاده می‌کنی، فایل‌سیستم روی instance معمولاً پایدارتر از سرورless است، اما برای اطمینان پیشنهاد می‌کنم پیام‌ها را در یک دیتابیس ذخیره کنید (SQLite یا PostgreSQL یا Supabase).
- برای مرحله اول توسعه، `data/eita_messages.json` کافی است اما در تولید توصیه نمی‌شود.

تست با ngrok (اگر می‌خواهی سریع URL عمومی بسازی بدون deploy)
--------------------------------------------------------
1) نصب ngrok از https://ngrok.com و ورود.
2) اجرا:

```bash
ngrok http 3000
```

3) ngrok یک URL عمومی (https) می‌دهد؛ آن را در تنظیمات وب‌هوک ایتا قرار بده، و هنگام اجرای محلی `NEXT_TURBOPACK=false npm run dev` را اجرا کن.

فعال‌سازی ارسال پاسخ (در صورتی که توکن را بدهم)
-------------------------------------------------
اگر بخواهی قابلیت پاسخ‌دهی از داخل سایت (مثلاً admin page که پیام را انتخاب و جواب دهد) را اضافه کنم، باید توکن ارسال پیام ایتا را در `EITA_TOKEN` قرار دهی. من کد ارسال را آماده می‌کنم که از `process.env.EITA_TOKEN` استفاده کند و فقط وقتی توکن موجود باشد فعال خواهد شد.

جمع‌بندی و پیشنهاد من
---------------------
- برای راه‌اندازی سریع و قابل اعتماد، من توصیه می‌کنم ابتدا روی Render مستقر کنی (ساده برای Node.js) یا Netlify با `@netlify/plugin-nextjs` اگر می‌خواهی یک راه‌حل serverless داشته باشی.
- اگر دوست داری من مرحله بعدی را برایت پیاده‌سازی کنم (A): اضافه کردن صفحه‌ی admin برای مشاهده/پاسخ پیام‌ها و ذخیره در SQLite/Postgres، بگو تا انجام دهم؛ در این حالت برای فعال‌سازی ارسال پیام به توکن ایتا نیاز دارم و تو آن را در محیط Vercel/Netlify/Render قرار می‌دهی.

فایل‌های اضافه‌شده در این پروژه
-------------------------------
- `src/app/api/eita/webhook/route.ts` — webhook POST/GET handler (توسعه محلی ذخیره در `data/eita_messages.json`).
- این فایل راهنما (`README-EITA-DEPLOY.md`) — همین فایل (فارسی).

گام بعدی
--------
1) بگو می‌خواهی روی کدام سرویس deploy کنی: GitHub+Netlify یا GitHub+Render؟
2) اگر می‌خواهی مرحله‌ی بعدی (صفحه admin + reply) را خواستی، گزینه A را تایید کن تا من کد را اضافه کنم. برای فعال‌سازی reply بعد از deploy تو فقط `EITA_TOKEN` را در پنل سرویس قرار می‌دهی.

اگر آماده‌ای، بگو کدام مسیر deploy را می‌خواهی و من گام‌های دقیق‌تری (با تصاویر/دستورها) می‌فرستم و کد‌های کمکی (مثلاً `netlify.toml`) را در repo می‌گذارم.