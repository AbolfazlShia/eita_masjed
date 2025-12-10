# مسجد - Masjed | Mosque Management App

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-brightgreen)

پلتفرم یکپارچهٔ «مسجد» برای وب و اپ اندروید است که تقویم شمسی، اوقات شرعی محاسبه‌شده برای مشهد، نمازهای روزانه، احراز هویت، و داشبورد داخلی را ارائه می‌دهد.

**English:** Masjed is a unified web + Android platform with an internal Mashhad prayer-time calculator, Jalali calendar, daily prayers, authentication, and an admin dashboard.

---

## 🚀 ویژگی‌ها | Features

✅ **تقویم شمسی و گرگوری** - Persian calendar with Gregorian conversion  
✅ **محاسبهٔ داخلی اوقات شرعی** - Astronomical calculator for Mashhad (Iranian Institute of Geophysics, فقه جعفری)  
✅ **APIهای مستقل** - `/api/prayer-times` و `/api/prayer-by-date` با ورودی میلادی/شمسی و کش داخلی  
✅ **نماز و مناسبت روزانه** - Daily prayer content + events per weekday  
✅ **احراز هویت و سشن پایدار** - PIN-based registration/login with guest fallback  
✅ **رابط تاریک/روشن** - Dark/Light mode toggle with persistence  
✅ **داشبورد داخلی و اپ اندروید** - Shared data model consumed by web UI and Android app (smart caching)  
✅ **Security headers & PWA** - Hardened Next.js config for standalone install  
✅ **Optional hCaptcha** - CAPTCHA verification on register/login (if `HCAPTCHA_SECRET` set)  
✅ **آماده برای پنل مدیریت** - Admin scaffolding and modular data stores  

---

## 📁 ساختار پروژه | Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/                      # Register/Login/Logout/Me endpoints
│   │   ├── prayer-times/route.ts      # GET prayer times (Gregorian input)
│   │   ├── prayer-by-date/route.ts    # GET prayer times (Gregorian/Jalali)
│   │   └── health/route.ts            # Health check endpoint
│   ├── dashboard/                     # Authenticated dashboard UI
│   ├── page.tsx                       # Public landing page
│   ├── layout.tsx                     # Root layout (RTL, PWA metadata)
│   └── globals.css                    # Global styles
│
├── lib/
│   ├── db.ts                          # DB layer (SQLite with JSON fallback)
│   ├── session.ts                     # Session helper (read user from cookie)
│   ├── auth.ts                        # Auth utilities (requireAdmin, etc.)
│   ├── captcha.ts                     # hCaptcha verification helper
│   ├── calendar.ts                    # Persian calendar utilities
│   ├── prayer-times-calculator.ts     # Internal Mashhad calculator (astronomy)
│   ├── prayer-service.ts              # Cache helpers, Jalali hydration, API payloads
│   └── prayers.ts                     # Daily prayers & events dataset
│
├── types/                             # Type declarations (bcryptjs, uuid, ...)

data/
└── store.json                         # JSON fallback for users/sessions

public/
├── icons/                             # PWA icons
├── masjed-app.apk                     # Latest Android build
└── manifest.webmanifest               # PWA manifest

Deployment & Config:
├── render.yaml                        # Render Web Service manifest
├── next.config.ts                     # Next.js config (headers, routing)
├── tsconfig.json                      # TypeScript config
├── package.json                       # Dependencies
├── postcss.config.mjs                 # PostCSS (Tailwind support)
├── .env.example                       # Environment variables template
└── DEPLOY_RENDER_GUIDE_FA.md          # Render deployment guide (Persian)

Android:
└── android-masjed-app/                # Native app consuming the same APIs
```

---

## ⚙️ نصب و راه‌اندازی محلی | Installation & Local Setup

### پیش‌نیازها | Prerequisites
- Node.js 20+ و npm
- Git

### مراحل | Steps

```bash
# Clone repository
git clone https://github.com/AbolfazlShia/masjed.git
cd masjed

# Install dependencies
npm install

# Create .env.local (optional, copy from .env.example)
cp .env.example .env.local

# Run development server
npm run dev
# Open http://localhost:3000

# Or build & run production
npm run build
npm run start
# Open http://localhost:3000
```

---

## 🔐 احراز هویت | Authentication

### کاربران و جلسات | Users & Sessions

- **Registration**: `POST /api/auth/register`
  - Body: `{ firstName, lastName, gender, birth, pin, hcaptchaToken? }`
  - Response: `{ ok, userId }`
  
- **Login**: `POST /api/auth/login`
  - Body: `{ firstName, pin, remember?, hcaptchaToken? }`
  - Response: `{ ok, sessionId }`
  - Sets HttpOnly cookie: `session=<UUID>`
  
- **Logout**: `POST /api/auth/logout`
  - Deletes session and clears cookie
  
- **Me**: `GET /api/auth/me`
  - Returns current logged-in user (or null if guest)

### Admin Account | حساب مدیر

- **Default Admin**:
  - Name: `مدیر`
  - PIN: `modir5`
  - Role: `admin`
  
- Auto-seeded on first run in both SQLite and JSON store (`data/store.json`)

### Session Storage | ذخیره‌سازی سشن

- **Primary**: SQLite (`data/app.db`) — if `better-sqlite3` is available
- **Fallback**: JSON store (`data/store.json`) — portable, no build issues
  - Tables: `users`, `sessions`, `ip_remember`

---

## 🙏 اوقات شرعی | Prayer Times

### Internal Calculator | الگوریتم داخلی
- مبنا: مختصات مشهد (36.2605, 59.6168) و ارتفاع متوسط 999m
- روش: موسسه ژئوفیزیک دانشگاه تهران + فقه جعفری (18° فجر، 4.5° عصر، 4° مغرب)
- ورودی: تاریخ میلادی یا شمسی → تبدیل به UTC → محاسبه زاویه خورشید و زمان شرعی
- خروجی: ساختار `PrayerTimesResult` با کلیدهای `fajr`, `sunrise`, `zuhr`, `asr`, `sunset`, `maghrib`, `midnight`

### Prayer Service & Cache | سرویس کش داخلی
- `src/lib/prayer-service.ts` تاریخ ورودی را نرمال و به UTC تبدیل می‌کند.
- کش درون‌حافظه‌ای ۳۶۶ روز جلو + ۷ روز عقب را گرم می‌کند (با تابع `ensurePrayerCachePrewarmed`).
- APIها از این سرویس استفاده می‌کنند تا پاسخ ثابت و سریع ارائه شود.

### Daily Prayers | نماز روزانه

- **API**: `GET /api/prayer-times` و `GET /api/prayer-by-date`
- **Data**: `src/lib/prayers.ts` — متن نمازها و رویدادهای مناسبتی هر روز هفته
- **Events**: همان دیتا برای نمایش مناسبت‌های روز استفاده می‌شود

---

## 📚 API Reference

| Method | Endpoint | Auth Required | Description |
|--------|----------|----------------|-------------|
| GET | `/` | No | Public landing page with app overview |
| GET | `/dashboard` | Yes | Authenticated dashboard |
| POST | `/api/auth/register` | No | Create new user |
| POST | `/api/auth/login` | No | Login & create session |
| POST | `/api/auth/logout` | Yes | Logout & delete session |
| GET | `/api/auth/me` | No | Current user info (or null) |
| GET | `/api/prayer-times` | No | Prayer times (optional `date=YYYY-MM-DD`) |
| GET | `/api/prayer-by-date` | No | Prayer times via Gregorian or Jalali (`shamsiDate=YYYY-MM-DD`) |
| GET | `/api/health` | No | Health check |

---

## 🎨 رابط کاربری | UI

### صفحات | Pages

1. **Home** (`/`) — نشان‌دادن توضیح پروژه، CTA‌های عضویت/ورود، لینک اپ اندروید

2. **Dashboard** (`/dashboard`) — Authenticated user view with:
   - Greeting with user's name
   - Persian date & daily events
   - Prayer times grid
   - Daily prayer text
   - Dark/Light mode toggle
   - Logout button

3. **Register** (`/auth/register`) — Form:
   - firstName (required)
   - lastName, gender, birth (optional)
   - PIN 4-digit (required)
   - (Optional hCaptcha if configured)

4. **Login** (`/auth/login`) — Form:
   - firstName
   - PIN
   - Remember me checkbox

5. **Android App** — Native client consuming `/api/prayer-times` with smart caching

---

## 🚀 استقرار روی Render | Deployment on Render

### خلاصه سریع | Quick Start

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Connect your GitHub repository
3. Select this repository (`masjed`)
4. Render automatically detects `render.yaml` and deploys
5. Set environment variables (see below)

### متغیرهای محیطی | Environment Variables

**Required:**
```
NODE_ENV=production
NODE_VERSION=20
```

**Optional but recommended:**
```
HCAPTCHA_SECRET=...
HCAPTCHA_SITEKEY=...
NEXT_PUBLIC_API_URL=https://your-domain
NEXT_PUBLIC_APP_VERSION=2.0.0
```

### نمایش | Result
Site will be live at: `https://masjed-app.onrender.com` (or your custom domain)

See full guide: [`DEPLOY_RENDER_GUIDE_FA.md`](./DEPLOY_RENDER_GUIDE_FA.md)

---

## 📦 Dependencies

**Core:**
- `next`: 16.0.2 — React framework
- `react`: 19.2.0 — UI library
- `react-dom`: 19.2.0 — React rendering

**Authentication & Security:**
- `bcryptjs`: ^2.4.3 — PIN hashing
- `uuid`: ^9.0.0 — Session ID generation

**Optional:**
- `better-sqlite3`: ^8.4.0 — SQLite database (native, optional)
- `jalaali-js`: ^1.2.8 — Persian calendar conversion

**Dev:**
- TypeScript, ESLint, Tailwind CSS, PostCSS

---

## 🧪 Testing

### Local Build & Test

```bash
npm run build
npm run start
# Browse http://localhost:3000
```

### API Testing

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"علی","pin":"1234"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"firstName":"علی","pin":"1234"}'

# Get Me
curl http://localhost:3000/api/auth/me

# Prayer Times
curl http://localhost:3000/api/prayer-times
```

---

## 🐛 Troubleshooting

### "Build failed" on Render
- Check `npm run build` locally
- Verify `package.json` and `package-lock.json` exist
- Review Render logs for details

### "White page" / 503
- Wait for deployment to complete
- Check Render logs
- Free tier may have spin-up delay

### Session/Auth not working
- Ensure cookies are enabled in browser
- Check that HTTPS is used (Render auto-provides)
- Verify user was created via register endpoint

### Prayer times not updating
- Check server logs (calculator errors will be logged)
- Ensure system clock/timezone on server is correct
- Restart service to rebuild in-memory cache if necessary

---

## 📝 لایسنس | License

MIT License — See LICENSE file for details

---

## 👨‍💻 مشارکه | Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push and submit a PR

---

## 📞 تماس و پشتیبانی | Contact & Support

- GitHub: [AbolfazlShia/masjed](https://github.com/AbolfazlShia/masjed)
- Issues: Use GitHub Issues for bug reports and feature requests

---

## 🎯 نقشهٔ راه | Roadmap

- [ ] PostgreSQL integration for production database
- [ ] Improved prayer time scraper (site-specific selectors)
- [ ] Admin dashboard UI for user management
- [ ] Event management system (holidays, special prayers)
- [ ] Notification system (prayer time alerts)
- [ ] Multi-language support (English, Arabic)
- [ ] Mobile app (React Native)

---

**Version 1.0.0** — Built with ❤️ for the community
