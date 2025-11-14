# 🔧 حل مشکل اتصال EITA به سایت

## مشکل
سایت در مرورگر باز می‌شود اما زمانی که از ایتا (EITA) وصل می‌شود، نمایش داده نمی‌شود.

## علت
مشکل به دلیل **CORS (Cross-Origin Resource Sharing)** و **Security Headers** بود که سایت اجازه نمی‌داد EITA به آن دسترسی داشته باشد.

## راه حل های انجام شده

### 1. تنظیم CORS Headers در `next.config.ts`
```typescript
headers: async () => {
  return [
    {
      source: "/:path*",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: "*",
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET, POST, PUT, DELETE, OPTIONS",
        },
        {
          key: "Access-Control-Allow-Headers",
          value: "Content-Type, Authorization, x-eita-token",
        },
        {
          key: "X-Frame-Options",
          value: "ALLOWALL",
        },
      ],
    },
  ];
}
```

### 2. اضافه کردن OPTIONS Handler در Webhook
در فایل `src/app/api/eita/webhook/route.ts` یک تابع OPTIONS اضافه شد:
```typescript
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-eita-token',
    },
  });
}
```

### 3. تنظیم متغیرهای محیطی
یک فایل `.env.local` ایجاد شد با توکن‌های امنیتی.

## آزمایش

### 1. بررسی سایت در مرورگر
```bash
http://localhost:3000
```

### 2. تست Webhook
```bash
curl -X POST http://localhost:3000/api/eita/webhook \
  -H "Content-Type: application/json" \
  -H "x-eita-token: your-secure-token-here" \
  -d '{"message": "test from EITA"}'
```

### 3. برای deploy روی سرور
- توجه داشته باشید که URL سایت شما باید `https://` باشد
- توکن را در متغیرهای محیطی سرور تنظیم کنید

## نکات مهم

⚠️ **برای Production:**
1. توکن را تغییر دهید: در `.env.local` یک توکن قوی قرار دهید
2. اگر نیاز به محدود کردن CORS دارید، می‌توانید `*` را با دومین خاص جایگزین کنید
3. HTTPS استفاده کنید

📝 **ویرایش برای دومین خاص:**
```typescript
{
  key: "Access-Control-Allow-Origin",
  value: "https://eita.example.com", // بجای *
}
```

## استقرار

اگر روی **Netlify** یا **Render** استقرار دارید:
- متغیرهای محیطی را در پنل کنفیگ تنظیم کنید
- سرویس را دوباره rebuild کنید
