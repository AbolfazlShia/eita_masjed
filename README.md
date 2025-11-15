# مسجد - Masjed | Mosque Management App

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-brightgreen)

برنامهٔ مدیریتِ مسجد برای Telegram WebApp (Eitaa) و استفادهٔ وب عمومی. سایت تقویم شمسی، اوقات شرعی، نماز روزانه، احراز هویت، و داشبورد داخلی را ارائه می‌دهد.

**English:** A mosque management application for Telegram WebApp (Eitaa) and public web access. Provides Persian calendar, prayer times, daily prayers, authentication, and an admin dashboard.

---

## 🚀 ویژگی‌ها | Features

✅ **تقویم شمسی** - Persian calendar with Gregorian conversion  
✅ **اوقات شرعی مشهد** - Mashhad prayer times (mock + scraper-ready)  
✅ **نماز روزانه** - Daily prayer content per weekday  
✅ **احراز هویت** - User registration (PIN-based), login, logout with persistent sessions  
✅ **کاربران مهمان** - Guest access without authentication  
✅ **رابط تاریک/روشن** - Dark/Light mode toggle with localStorage persistence  
✅ **داشبورد داخلی** - Authenticated dashboard showing prayer times and daily prayer  
✅ **Telegram WebApp Support** - Fragment handling, SDK initialization for Eitaa integration  
✅ **CORS & Iframe Headers** - Configured for embedding in web-based apps  
✅ **Optional hCaptcha** - CAPTCHA verification on register/login (if `HCAPTCHA_SECRET` set)  
✅ **Prayer Time Scraper API** - POST endpoint to fetch and cache prayer times  
✅ **Admin Panel Ready** - Scaffolding for admin routes and management  

---

## 📁 ساختار پروژه | Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts      # User registration endpoint
│   │   │   ├── login/route.ts         # User login & session creation
│   │   │   ├── logout/route.ts        # Session deletion
│   │   │   └── me/route.ts            # Current user info
│   │   ├── prayer-times/route.ts      # Prayer times (reads cache or mock)
│   │   ├── scrape/prayer-times/route.ts # Scraper: fetch & save prayer times
│   │   ├── eita/webhook/route.ts      # Telegram Eitaa webhook (optional)
│   │   └── health/route.ts            # Health check endpoint
│   ├── auth/
│   │   ├── register/page.tsx          # Register form page
│   │   ├── login/page.tsx             # Login form page
│   │   └── logout/page.tsx            # Logout redirect page
│   ├── dashboard/
│   │   ├── page.tsx                   # Protected dashboard (server-side check)
│   │   └── DashboardClient.tsx        # Dashboard UI (client component)
│   ├── start/page.tsx                 # Guest welcome page
│   ├── page.tsx                       # Homepage with 3 entry options
│   ├── layout.tsx                     # App layout (RTL, Telegram SDK, metadata)
│   └── globals.css                    # Global styles
│
├── lib/
│   ├── db.ts                          # DB layer (SQLite with JSON fallback)
│   ├── session.ts                     # Session helper (read user from cookie)
│   ├── auth.ts                        # Auth utilities (requireAdmin, etc.)
│   ├── captcha.ts                     # hCaptcha verification helper
│   ├── calendar.ts                    # Persian calendar utilities
│   ├── prayers.ts                     # Daily prayers & events dataset
│   └── telegram.ts                    # Telegram WebApp SDK helper
│
├── types/
│   ├── bcryptjs.d.ts                  # bcryptjs type declaration
│   └── uuid.d.ts                      # uuid type declaration
│
data/
├── store.json                         # User/session JSON store (if SQLite unavailable)
└── prayer-times.json                  # Cached prayer times (updated by scraper)

public/
├── favicon.ico

Deployment & Config:
├── render.yaml                        # Render Web Service manifest
├── next.config.ts                     # Next.js config (headers, routing)
├── tsconfig.json                      # TypeScript config
├── package.json                       # Dependencies
├── postcss.config.mjs                 # PostCSS (Tailwind support)
├── netlify.toml                       # Netlify config (legacy, now using Render)
├── .env.example                       # Environment variables template
└── DEPLOY_RENDER_GUIDE_FA.md          # Render deployment guide (Persian)
```

---

## ⚙️ نصب و راه‌اندازی محلی | Installation & Local Setup

### پیش‌نیازها | Prerequisites
- Node.js 20+ و npm
- Git

### مراحل | Steps

```bash
# Clone repository
git clone https://github.com/AbolfazlShia/eita_masjed.git
cd eita_masjed

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

### Mock Data | داده‌های نمونه
Default prayer times for Mashhad:
- Fajr: 04:40
- Sunrise: 06:08
- Zuhr: 11:16
- Asr: 14:45
- Sunset: 16:24
- Maghrib: 16:43
- Isha: 18:10
- Midnight: 22:32

### Scraper API | API اسکرِیپِر

**POST** `/api/scrape/prayer-times`
- Fetches HTML from `PRAYER_SOURCE_URL` (default: `https://www.bahesab.ir/`)
- Extracts times using heuristic regex
- Saves to `data/prayer-times.json`
- Can be called manually or via scheduled cron job

**GET** `/api/scrape/prayer-times`
- Returns currently cached prayer times

### Daily Prayers | نماز روزانه

- **API**: `GET /api/prayer-times` — returns cached times or mock fallback
- **Data**: `src/lib/prayers.ts` — Persian prayer texts per weekday
- **Events**: Daily events also stored in prayers dataset

---

## 🌐 Telegram WebApp (Eitaa) Integration

### Headers & CORS | هدرها و CORS

Configured in `next.config.ts`:
- `Access-Control-Allow-Origin: *`
- `X-Frame-Options: ALLOWALL` (allows iframe embedding)
- `X-Content-Type-Options: nosniff`

### Fragment Handling | هندلینگ فرگمنت

- `src/app/start/page.tsx` — detects Telegram fragment (`#tgWebAppData=...`)
- Initializes Telegram WebApp SDK
- Expands web app and enables back button

### Client Integration | انتگریشن کلاینت

`src/lib/telegram.ts` — helper hook:
```typescript
useTelegramWebApp() // Expands, enables closing confirmation
```

---

## 📚 API Reference

| Method | Endpoint | Auth Required | Description |
|--------|----------|----------------|-------------|
| GET | `/` | No | Welcome page (3 entry options) |
| GET | `/start` | No | Guest welcome page |
| GET | `/dashboard` | Yes | Protected user dashboard |
| POST | `/api/auth/register` | No | Create new user |
| POST | `/api/auth/login` | No | Login & create session |
| POST | `/api/auth/logout` | Yes | Logout & delete session |
| GET | `/api/auth/me` | No | Current user info (or null) |
| GET | `/api/prayer-times` | No | Get prayer times |
| POST | `/api/scrape/prayer-times` | No | Scrape & cache prayer times |
| GET | `/api/health` | No | Health check |
| POST | `/api/eita/webhook` | Optional token | Telegram Eitaa webhook |

---

## 🎨 رابط کاربری | UI

### صفحات | Pages

1. **Home** (`/`) — 3 buttons:
   - Guest mode (blue)
   - Register/Login (green)
   - Admin login (red)

2. **Start** (`/start`) — Guest welcome with prayer times & daily prayer

3. **Dashboard** (`/dashboard`) — Authenticated user view with:
   - Greeting with user's name
   - Persian date & daily events
   - Prayer times grid
   - Daily prayer text
   - Dark/Light mode toggle
   - Logout button

4. **Register** (`/auth/register`) — Form:
   - firstName (required)
   - lastName, gender, birth (optional)
   - PIN 4-digit (required)
   - (Optional hCaptcha if configured)

5. **Login** (`/auth/login`) — Form:
   - firstName
   - PIN
   - Remember me checkbox

---

## 🚀 استقرار روی Render | Deployment on Render

### خلاصه سریع | Quick Start

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Connect your GitHub repository
3. Select this repository (`eita_masjed`)
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
EITA_TOKEN=...
NEXT_PUBLIC_EITA_TOKEN=...
EITA_ADMIN_TOKEN=...
HCAPTCHA_SECRET=...
HCAPTCHA_SITEKEY=...
PRAYER_SOURCE_URL=https://www.bahesab.ir/
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
- Manually call `POST /api/scrape/prayer-times` or set up cron job
- Check `data/prayer-times.json` file
- Verify `PRAYER_SOURCE_URL` is accessible

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

- GitHub: [AbolfazlShia/eita_masjed](https://github.com/AbolfazlShia/eita_masjed)
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
