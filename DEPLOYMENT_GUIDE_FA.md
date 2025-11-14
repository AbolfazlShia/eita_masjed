# 🔴 حل مشکل: net::ERR_TIMED_OUT

## مشکل
ایتا نمی‌تواند سایت شما را ببیند و خطای `net::ERR_TIMED_OUT` می‌دهد.

## دلیل
سایت شما **فقط روی کامپیوتر شخصی** درحال اجرا است:
- `http://localhost:3000` - فقط از کامپیوتر شما
- `http://192.168.43.126:3000` - فقط از شبکه محلی

اما **ایتا از خارج شبکه** نمی‌تواند به آن دسترسی داشته باشد.

## ✅ حل: استقرار روی سرور عمومی

### اختیار 1: Render.com (توصیه شده - رایگان)

#### مرحله 1: آماده‌سازی

```bash
# اطمینان از وجود build صحیح
npm run build

# push به GitHub (اگر هنوز نشده)
git add .
git commit -m "Ready for Render deployment"
git push
```

#### مرحله 2: استقرار

1. برو به **https://render.com**
2. ورود با **GitHub**
3. کلیک بر **"New +"** → **"Web Service"**
4. انتخاب مخزن `eita_masjed`

#### مرحله 3: تنظیمات

```
Name: masjed-app
Region: Singapore (یا نزدیک به شما)
Branch: main
Build Command: npm run build
Start Command: npm run start
```

#### مرحله 4: Environment Variables

```
EITA_TOKEN = [یک توکن قوی وارد کن]
```

مثال:
```
EITA_TOKEN = supersecuretoken123456789abcdef
```

#### مرحله 5: Deploy

کلیک بر **"Create Web Service"**

⏳ مدت: 2-3 دقیقه

### مرحله 6: گرفتن URL

بعد از استقرار موفق:
```
https://masjed-app.onrender.com
```

### مرحله 7: اتصال به ایتا

در **ایتا** این URL را استفاده کن:
```
https://masjed-app.onrender.com/api/eita/webhook?token=supersecuretoken123456789abcdef
```

یا با Header:
```
URL: https://masjed-app.onrender.com/api/eita/webhook
Header: x-eita-token: supersecuretoken123456789abcdef
```

---

### اختیار 2: Netlify

1. برو به **https://app.netlify.com**
2. ورود با **GitHub**
3. **"New site from Git"**
4. انتخاب مخزن

---

### اختیار 3: Vercel (رسمی Next.js)

1. برو به **https://vercel.com**
2. **Import Git Repository**
3. انتخاب `eita_masjed`
4. Auto-configures

---

## 🧪 تست

بعد از استقرار:

```bash
# تست سایت
curl https://masjed-app.onrender.com/

# تست webhook
curl -X POST https://masjed-app.onrender.com/api/eita/webhook \
  -H "Content-Type: application/json" \
  -H "x-eita-token: supersecuretoken123456789abcdef" \
  -d '{"message": "test from EITA"}'
```

جواب باید:
```json
{"ok": true}
```

---

## 📝 خطوط خاصی برای تذکر

### ⚠️ توکن را تغییر دهید!
در `.env.local` و Render dashboard توکن را **قوی** تنظیم کنید.

### 🔒 HTTPS اجباری است
ایتا فقط از `https://` پذیرایی می‌کند.

### ⏱️ اگر هنوز timeout است:

1. **بررسی استقرار:**
   ```
   Render Dashboard → Logs
   ```

2. **بررسی توکن:**
   ```bash
   # کدام توکنی از ایتا آمده؟
   # آیا با Render متطابق است؟
   ```

3. **کلیک دوباره Deploy:**
   ```
   Render Dashboard → Manual Deploy → Deploy Latest Commit
   ```

---

## 🚀 تخمین زمان

- ✏️ Setup: 5 دقیقه
- ⏳ Render Deploy: 2-3 دقیقه
- ✅ Total: 7-8 دقیقه

