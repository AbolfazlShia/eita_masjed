"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { writeAndroidDeskRememberState } from '@/lib/android';

export default function LoginPage() {
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
      setError('لطفاً نام کاربری و گذرواژه را به‌درستی وارد کنید.');
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
    <div className="relative min-h-screen overflow-hidden bg-[#010409] text-white">
      <div className="absolute -top-32 -right-16 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="absolute -bottom-40 -left-10 h-96 w-96 rounded-full bg-lime-400/20 blur-[110px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_70%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_25px_90px_rgba(1,4,9,0.85)]">
          <div className="grid items-stretch gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden rounded-[32px] rounded-b-[0] rounded-l-[32px] rounded-r-[32px] rounded-t-[32px] bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-900 p-10 text-white lg:rounded-br-[120px]">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'160\' height=\'160\' viewBox=\'0 0 160 160\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'rgba(255,255,255,0.4)\' stroke-width=\'0.5\'%3E%3Cpath d=\'M0 80h160M80 0v160\'/%3E%3Ccircle cx=\'80\' cy=\'80\' r=\'60\'/%3E%3Ccircle cx=\'80\' cy=\'80\' r=\'30\'/%3E%3C/g%3E%3C/svg%3E")' }} />
              <div className="relative z-10 flex flex-col gap-6">
                <h1 className="text-4xl font-black leading-snug">
                  ورود خدمتگزاران مسجد
                </h1>
                <p className="text-base text-emerald-50/80 leading-7">
                  سامانه مدیریت مسجد، یک فضای هوشمند برای پیگیری برنامه‌ها، اعلامیه‌ها و کنترل محتوای نمایشگرهاست.
                  با ورود به پنل، گزارش‌های روزانه، مناسبت‌ها و وضعیت اوقات شرعی را در اختیار داشته باشید.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[{
                    title: 'امنیت چندلایه',
                    desc: 'ورود با پین اختصاصی و ثبت لاگ در لحظه.'
                  }, {
                    title: 'کنترل سریع',
                    desc: 'انتشار اطلاعیه ها و برنامه های مسجد.'
                  }].map((item) => (
                    <div key={item.title} className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm text-white/80">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3 text-sm text-white/75">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">🕌</span>
                  <p>
                    مسجد امام جعفر صادق (ع)
                    <span className="block text-xs text-white/60">مشهد مقدس · خیابان صارمی ۴۹</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-[32px] bg-[#060c13]/70 p-8 backdrop-blur-xl sm:p-10">
              <div>
                <h2 className="text-3xl font-extrabold text-white">کنترل داشبورد روزانه</h2>
                <p className="mt-2 text-sm text-slate-300">
                  لطفاً نام خدمتگزار و گذرواژه اختصاصی خود را وارد کنید.
                </p>
              </div>

              <form onSubmit={submit} className="mt-8 space-y-5">
                <label className="block text-sm font-semibold text-slate-200">
                  نام کاربری
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-white/40 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="نام کاربری خود را وارد کنید"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-200">
                  گذرواژه
                  <input
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                    maxLength={16}
                    inputMode="numeric"
                    type="password"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-white/40 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="برای مثال: ۱۲۳۴"
                  />
                </label>

                <label className="flex items-center justify-between text-sm text-slate-300">
                  <span>مرا به خاطر بسپار</span>
                  <button
                    type="button"
                    onClick={() => setRemember((prev) => !prev)}
                    className={`relative h-7 w-12 rounded-full transition ${remember ? 'bg-emerald-400/90' : 'bg-white/10'}`}
                    aria-pressed={remember}
                  >
                    <span
                      className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition ${remember ? 'translate-x-5' : ''}`}
                    />
                  </button>
                </label>

                {error && (
                  <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300 py-3 text-lg font-extrabold text-emerald-950 shadow-[0_25px_45px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'در حال ورود...' : 'ورود به پنل مدیریت'}
                </button>
              </form>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
                ورود تنها برای تیم اجرایی مسجد در نظر گرفته شده است. در صورت بروز مشکل با مسئول سامانه تماس بگیرید.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
