# 🚨 اورژانسی: سایت رو از Netlify انتقال دهید!

## مشکل
Netlify حساب رایگان شما را متوقف کرده:
```
"Site not available - reached its usage limits"
```

## حل سریع: Deploy روی Render (رایگان و بدون محدودیت)

### مرحله 1: برو به Render
```
https://render.com
```

### مرحله 2: ورود با GitHub
- بالای سمت راست: "Sign up"
- انتخاب: "Continue with GitHub"

### مرحله 3: اجازه بدهید به GitHub
- Authorize Render

### مرحله 4: New Web Service
- سمت راست: "+ New"
- انتخاب: "Web Service"

### مرحله 5: انتخاب مخزن
- جستجو: `eita_masjed`
- انتخاب کن
- کلیک: "Connect"

### مرحله 6: تنظیمات
Render خودکار تشخیص می‌دهد:
- **Name:** masjed-app
- **Environment:** Node
- **Build:** npm run build ✅
- **Start:** npm run start ✅

### مرحله 7: Deploy!
- کلیک: "Create Web Service"
- **صبر کن:** ۳-۵ دقیقه

### مرحله 8: URL جدید
بعد از deploy:
```
https://masjed-app.onrender.com
```

---

## 🎯 آپدیت ایتا

URL جدید را در ایتا استفاده کنید:
```
https://masjed-app.onrender.com
```

---

## 📝 اگر خودکار نشد:

اگر Render `render.yaml` را نخواند، دستی تنظیم کن:
- **Build Command:** npm run build
- **Start Command:** npm run start
- **Node Version:** 18 (یا بزرگ‌تر)

---

**فوری انجام بده! سایت فعلاً down است!** 🔴
