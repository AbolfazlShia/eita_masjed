# راهنمای بروزرسانی خودکار اوقات شرعی

## برای Render.com

### روش 1: استفاده از Render Crons (رایگان)

1. **فایل `render.yaml` بروزرسانی شود:**
   ```yaml
   services:
     - type: web
       name: masjed
       runtime: node
       buildCommand: "npm install && npm run build"
       startCommand: "npm run start"
       envVars:
         - key: NODE_VERSION
           value: "18"

   crons:
     - id: update-prayer-times
       schedule: "0 0 * * *"  # هر روز ساعت 12 شب UTC
       httpPath: /api/cron/update-prayer-times?secret=YOUR_SECRET
   ```

2. **متغیرهای محیط‌ی:**
   ```
   CRON_SECRET=your-random-secret-key
   PRAYER_SOURCE_URL=https://www.bahesab.ir/
   NEXT_PUBLIC_API_URL=https://your-domain.onrender.com
   ```

### روش 2: استفاده از سرویس خارجی (EasyCron)

1. بروید به [EasyCron.com](https://www.easycron.com/)
2. یک cron job جدید ایجاد کنید:
   - **URL:** `https://your-domain.onrender.com/api/cron/update-prayer-times`
   - **Schedule:** `0 0 * * *` (روزانه)
   - **Timezone:** `Asia/Tehran`

### روش 3: استفاده از GitHub Actions

ایجاد فایل `.github/workflows/update-prayer-times.yml`:

```yaml
name: Update Prayer Times

on:
  schedule:
    - cron: '0 0 * * *'  # هر روز ساعت 12 شب UTC

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger prayer times update
        run: |
          curl -X GET \
            "https://your-domain.onrender.com/api/cron/update-prayer-times" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## برای Vercel

اگر روی Vercel میزبانی کنید، فایل `vercel.json` را اضافه کنید:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-prayer-times",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## نکات مهم

- **Schedule Format:** CRON format (minute hour day month day-of-week)
- **UTC vs Local:** EasyCron و سرویس‌های دیگر معمولاً UTC استفاده می‌کنند
- **Timezone تهران:** UTC+3:30
- **بهترین زمان:** صبح زود (4:30) برای دریافت اوقات شرعی روز

## تست کردن

```bash
# از طریق Terminal:
curl http://localhost:3000/api/cron/update-prayer-times

# با secret:
curl http://localhost:3000/api/cron/update-prayer-times \
  -H "Authorization: Bearer your-secret-key"
```

## نتیجه موفق

اگر درخواست موفق باشد، پاسخ:
```json
{
  "ok": true,
  "message": "Prayer times updated successfully",
  "data": {
    "date": "1403-08-24",
    "shamsiDate": "چهارشنبه 24 آبان 1403",
    "prayerTimes": { ... }
  }
}
```
