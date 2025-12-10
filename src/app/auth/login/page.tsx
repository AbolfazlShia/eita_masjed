"use client";

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { writeAndroidDeskRememberState } from '@/lib/android';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">در حال بارگذاری...</div>}>
      <LoginFormInner />
    </Suspense>
  );
}

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState('');
  const [pin, setPin] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFirstName = firstName.trim();
    const cleanPin = pin.trim();
    if (!cleanFirstName || !cleanPin) {
      setError('لطفاً همه فیلدها را پر کنید');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: cleanFirstName, pin: cleanPin, remember })
      });
      const data = await res.json();
      if (data.ok) {
        writeAndroidDeskRememberState(remember);
        const inApp = searchParams?.get('inApp') === '1';
        const source = searchParams?.get('source') || '';
        const suffix = inApp && source === 'android' ? '?inApp=1&source=android' : '';
        router.push(`/manager/desk${suffix}`);
      } else {
        const message =
          data.error === 'not_found'
            ? 'کاربر یافت نشد'
            : data.error || 'خطا';
        setError(message);
      }
    } catch {
      setError('خطا در اتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-black text-white" dir="rtl">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-12">
        <div className="grid gap-6 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_35px_90px_rgba(0,0,0,0.65)] lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[40px] bg-gradient-to-br from-emerald-500 via-green-700 to-slate-900 p-10 text-white">
            <p className="text-xs tracking-[0.5em] text-white/70">مسجد امام جعفر صادق (ع)</p>
            <h1 className="mt-4 text-4xl font-black leading-tight">ورود مدیران مسجد</h1>
            <p className="mt-6 text-sm text-white/80">
              با وارد کردن نام کوچک و پین چهار رقمی، به داشبورد مدیریتی دسترسی پیدا می‌کنید؛ از اینجا می‌توانید برنامه‌های مسجد و آمارهای اصلی را مدیریت کنید.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[{ title: 'گزارش‌گیری سریع', desc: 'آمار حضور و برنامه‌ها' }, { title: 'ارسال اطلاعیه', desc: 'مدیریت پیام‌های مسجد' }].map((card) => (
                <div key={card.title} className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
                  <p className="text-lg font-semibold">{card.title}</p>
                  <p className="mt-1 text-sm text-white/80">{card.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col justify-center rounded-[40px] bg-[#050c16]/80 p-8 sm:p-10">
            <p className="text-xs tracking-[0.4em] text-emerald-300">ورود مدیران</p>
            <h2 className="mt-3 text-3xl font-extrabold">داشبورد مسجد</h2>
            <p className="mt-2 text-sm text-white/70">نام کوچک تایید شده و پین را وارد کنید.</p>

            <form onSubmit={submit} className="mt-8 space-y-5 text-sm">
              <label className="block text-white/80">
                نام کوچک
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="مثلاً علی"
                />
              </label>

              <label className="block text-white/80">
                پین چهار رقمی
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="****"
                />
              </label>

              <label className="flex items-center justify-between text-white/70">
                <span className="text-sm">مرا به خاطر بسپار</span>
                <button
                  type="button"
                  onClick={() => setRemember((prev) => !prev)}
                  className={`relative h-7 w-12 rounded-full transition ${remember ? 'bg-emerald-400/90' : 'bg-white/15'}`}
                >
                  <span
                    className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition ${remember ? 'translate-x-5' : ''}`}
                  />
                </button>
              </label>

              {error && <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300 py-3 text-lg font-extrabold text-emerald-950 shadow-[0_25px_45px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? 'در حال ورود...' : 'ورود به داشبورد'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
