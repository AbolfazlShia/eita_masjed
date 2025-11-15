'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const quickActions = [
  {
    title: 'اوقات شرعی امروز',
    description: 'نمایش لحظه‌ای اذان‌ها، شمارش معکوس و بروزرسانی خودکار',
    icon: '🕰️',
    href: '/start',
    accent: 'from-emerald-500/30 to-emerald-500/5',
  },
  {
    title: 'تقویم و مناسبت‌ها',
    description: 'نمایش کامل ماه شمسی و مناسبت‌های مذهبی هر روز',
    icon: '📅',
    href: '/calendar',
    accent: 'from-amber-400/30 to-amber-400/5',
  },
  {
    title: 'آرشیو اوقات شرعی',
    description: 'جستجوی تاریخ شمسی دلخواه و دریافت گزارش کامل',
    icon: '📖',
    href: '/prayer-times',
    accent: 'from-sky-400/30 to-sky-400/5',
  },
  {
    title: 'مدیریت خادمین و اعلان‌ها',
    description: 'ثبت اطلاعیه‌های مسجد و مدیریت اعضا (به‌زودی)',
    icon: '🛠️',
    href: '/auth/login',
    accent: 'from-fuchsia-500/30 to-fuchsia-500/5',
  },
];

const impactHighlights = [
  { title: '۲۳۵۰+', subtitle: 'نمازگزار فعال', icon: '🕌', detail: 'سرویس‌دهی روزانه به مخاطبان ایتا و وب' },
  { title: '۴۵+', subtitle: 'مناسبت پوشش‌داده‌شده', icon: '🎉', detail: 'تقویم شمسی و قمری کامل' },
  { title: '۲۴/۷', subtitle: 'بروزرسانی خودکار', icon: '♻️', detail: 'Cron job و کش داخلی' },
];

const timeline = [
  { time: 'اذان صبح', detail: 'تشرف جمعی و برنامه‌های ویژه نیایش' },
  { time: 'نماز ظهر', detail: 'سخنرانی کوتاه و پخش زنده' },
  { time: 'نماز مغرب', detail: 'محفل انس با قرآن و جلسات جوانان' },
];

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#030d09]" />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030d09] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(250,204,21,0.12),_transparent_45%)]" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 lg:px-8 lg:py-16">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-emerald-200/80">مسجد و پایگاه امام جعفر صادق (ع) - مشهد</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl">
                داشبورد هوشمند مسجد
              </h1>
              <p className="mt-4 max-w-3xl text-sm text-white/80 sm:text-base">
                همه اوقات شرعی، مناسبت‌ها، اعلان‌ها و ابزار مدیریت مسجد در یک محیط واکنش‌گرا.
                به‌صورت کامل برای وب، موبایل و اَپ ایتا بهینه شده است.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push('/start')}
                  className="rounded-2xl bg-gradient-to-l from-emerald-500 via-emerald-400 to-lime-400 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/40 transition hover:translate-y-0.5"
                >
                  شروع سریع داشبورد روزانه
                </button>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="rounded-2xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-white"
                >
                  ورود مدیران
                </button>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 rounded-2xl bg-black/30 p-5 text-sm lg:max-w-xs">
              <p className="text-white/70">جدول برنامه‌های امروز</p>
              {timeline.map((item) => (
                <div key={item.time} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-white font-semibold">{item.time}</p>
                    <p className="text-xs text-white/70">{item.detail}</p>
                  </div>
                  <span className="text-lg">→</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => router.push(action.href)}
              className={`group flex h-full flex-col items-start gap-4 rounded-3xl border border-white/10 bg-gradient-to-br ${action.accent} p-5 text-right text-white transition hover:border-white/40 hover:shadow-emerald-500/20`}
            >
              <span className="text-2xl">{action.icon}</span>
              <div>
                <p className="text-lg font-semibold">{action.title}</p>
                <p className="mt-1 text-sm text-white/80">{action.description}</p>
              </div>
              <span className="mt-auto text-xs text-white/70">رفتن به صفحه →</span>
            </button>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-200">داشبورد مدیریتی</p>
                <h2 className="mt-2 text-2xl font-bold">مرکز کنترل مسجد</h2>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-4 py-1 text-xs text-emerald-200">نسخه ۲.۰</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {impactHighlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-2xl">{item.icon}</div>
                  <p className="mt-4 text-2xl font-black text-white">{item.title}</p>
                  <p className="text-sm text-emerald-100/80">{item.subtitle}</p>
                  <p className="mt-3 text-xs text-white/60">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#13281e] to-[#0b1510] p-6">
            <p className="text-sm text-emerald-200">اعلان فوری</p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              سامانه اعلان مسجد
            </h3>
            <p className="mt-3 text-sm text-white/75">
              اعلان‌های ایتا، پیامک و نمایشگر مسجد از یک پنل مشترک مدیریت می‌شوند.
            </p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/80">
              <div className="rounded-2xl bg-black/30 p-4">
                ✅ اتصال خودکار Cron<br />
                🔔 پخش اعلان مناسبتی<br />
                🪪 مدیریت نقش‌ها و دسترسی‌ها
              </div>
              <button
                onClick={() => router.push('/auth/register')}
                className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white"
              >
                درخواست دسترسی جدید
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-emerald-200/90">هیئت اجرایی مسجد</p>
              <h2 className="text-2xl font-semibold">ابزارهای پیشنهادی برای خادمین</h2>
            </div>
            <button
              onClick={() => router.push('/?app=true')}
              className="rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white hover:bg-white/25"
            >
              نسخه وب‌اپ ایتا
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/70">مدیریت برنامه‌ها</p>
              <h3 className="mt-2 text-lg font-semibold text-white">تقویم رویدادها و کلاس‌ها</h3>
              <p className="mt-2 text-sm text-white/70">
                ایجاد، ویرایش و نمایش خودکار کلاس‌ها و محافل قرآنی در صفحه عمومی مسجد.
              </p>
              <span className="mt-4 inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                بزودی در نسخه ۲.۱
              </span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/70">پخش محتوا</p>
              <h3 className="mt-2 text-lg font-semibold text-white">سیستم اطلاع‌رسانی چندکاناله</h3>
              <p className="mt-2 text-sm text-white/70">
                ارسال همزمان اعلان به نمایشگر مسجد، ایتا و پیامک با یک کلیک.
              </p>
              <span className="mt-4 inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                در حال توسعه
              </span>
            </div>
          </div>
        </section>

        <footer className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/70">
          نسخه ۲.۰.۰ · طراحی شده با ❤️ برای مسجد مشهد · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
