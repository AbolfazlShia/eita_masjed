#!/bin/bash

# 🚀 استقرار سریع روی Render.com
# ============================

echo "📦 آماده‌سازی برای استقرار..."
echo ""

# بررسی git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ این دایرکتوری یک مخزن git نیست!"
  exit 1
fi

# ساخت production build
echo "🔨 ساخت production build..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build ناموفق! لطفاً خطاها را رفع کنید."
  exit 1
fi

echo "✅ Build موفق!"
echo ""
echo "📋 بعدی مراحل برای استقرار روی Render:"
echo ""
echo "1. برو به https://render.com"
echo "2. با GitHub login کن"
echo "3. روی 'New +' کلیک کن"
echo "4. 'Web Service' را انتخاب کن"
echo "5. مخزن 'eita_masjed' را انتخاب کن"
echo ""
echo "6️⃣ Settings:"
echo "   • Name: masjed-app"
echo "   • Environment: Node"
echo "   • Build Command: npm run build"
echo "   • Start Command: npm run start"
echo ""
echo "7️⃣ Environment Variables:"
echo "   • EITA_TOKEN: [یک توکن قوی وارد کن]"
echo ""
echo "8. روی 'Create Web Service' کلیک کن"
echo ""
echo "⏳ استقرار ۲-۳ دقیقه طول می‌کشد"
echo "✅ بعد از آن URL شما چیزی مثل: https://masjed-app.onrender.com"
echo ""
echo "📝 برای ایتا این URL را استفاده کن:"
echo "   https://masjed-app.onrender.com/api/eita/webhook"
