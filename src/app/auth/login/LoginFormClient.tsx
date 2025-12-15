"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  exitAndroidApp,
  hasAndroidExitAck,
  markAndroidExitAck,
  writeAndroidDeskRememberState,
} from "@/lib/android";
import { writeStoredMembership } from "@/lib/membership-client";

const NIGHT_PALETTE = {
  outerBg: "bg-gradient-to-br from-[#030712] via-[#041124] to-[#0f182e]",
  overlayA: "bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_60%)]",
  overlayB: "bg-[radial-gradient(circle_at_bottom,_rgba(37,99,235,0.3),_transparent_55%)]",
  infoPanelBg: "bg-gradient-to-br from-emerald-600/80 via-emerald-700/80 to-slate-900/90 text-white",
  infoBadge: "text-white/70",
  infoBodyText: "text-white/80",
  cardSurface: "border-white/15 bg-black/20",
  cardDesc: "text-white/70",
  accentText: "text-emerald-300",
  formBg: "bg-[#050c16]/90",
  formText: "text-white",
  subtleText: "text-white/70",
  rememberOn: "border-emerald-300 bg-emerald-400/90",
  rememberOff: "border-white/20 bg-white/30",
  emergencyPanel: "border-white/10 bg-black/10 text-white/70",
};

export default function LoginFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [pin, setPin] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPrompt, setSuccessPrompt] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);
  const palette = NIGHT_PALETTE;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFirstName = firstName.trim();
    const cleanPin = pin.trim();
    if (!cleanFirstName || !cleanPin) {
      setError("لطفاً همه فیلدها را پر کنید");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: cleanFirstName, pin: cleanPin, remember }),
      });
      const data = await res.json();
      if (data.ok) {
        writeAndroidDeskRememberState(remember);
        writeStoredMembership("manager");
        const inApp = searchParams?.get("inApp") === "1";
        const source = searchParams?.get("source") || "";
        const isAndroidContext = inApp && source === "android";
        const suffix = inApp && source === "android" ? "?inApp=1&source=android" : "";
        if (isAndroidContext && !hasAndroidExitAck("manager")) {
          setSuccessPrompt(true);
        } else {
          router.push(`/manager/desk${suffix}`);
        }
      } else {
        const message = data.error === "not_found" ? "کاربر یافت نشد" : data.error || "خطا";
        setError(message);
      }
    } catch {
      setError("خطا در اتصال");
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return null;
  }

  return (
    <div className={`relative min-h-screen overflow-hidden ${palette.outerBg}`} dir="rtl" suppressHydrationWarning>
      {successPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 text-center text-white">
          <div className="max-w-sm rounded-3xl border border-emerald-200/30 bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
            <h3 className="text-xl font-extrabold">ورود انجام شد</h3>
            <p className="mt-3 text-sm text-white/80">
              برای دسترسی به میز کار، لطفاً یک‌بار اپلیکیشن را بسته و دوباره باز کنید.
            </p>
            <button
              type="button"
              onClick={() => {
                markAndroidExitAck("manager");
                exitAndroidApp();
              }}
              className="mt-5 w-full rounded-2xl border border-white/30 bg-white/15 py-2.5 text-sm font-bold text-white transition hover:border-white/70 hover:bg-white/25"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
      <div className={`absolute inset-0 ${palette.overlayA}`} />
      <div className={`absolute inset-0 ${palette.overlayB}`} />
      <div className="absolute -top-32 -right-10 h-72 w-72 rounded-full bg-white/10 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-emerald-500/10 blur-[140px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-3 py-10 sm:px-6">
        <div className="mt-8 grid gap-6 md:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          <section className={`rounded-[30px] border border-white/10 p-6 text-white shadow-[0_40px_120px_rgba(0,0,0,0.35)] sm:p-8 ${palette.infoPanelBg}`}>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">داشبورد مدیریتی هوشمند</h1>
            <p className={`mt-4 text-sm leading-7 ${palette.infoBodyText}`}>
              وضعیت برنامه‌ها، حضور اعضا و پیام‌های فوری را از یک منظر واحد رصد کنید. ورود با نام کوچک و پین اختصاصی انجام می‌شود و
              دسترسی مستقل برای هر مدیر تعریف شده است.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { title: "گزارش‌های زنده", desc: "نمای کلی حضور و فعالیت" },
                { title: "ارسال اعلان لحظه‌ای", desc: "هماهنگی با بسیج و خادمین" },
                { title: "مدیریت برنامه‌ها", desc: "ویرایش سریع جلسات و مراسم" },
                { title: "کنترل دسترسی", desc: "تنظیم نقش و مجوز مدیران" },
              ].map((card) => (
                <div
                  key={card.title}
                  className={`rounded-3xl border ${palette.cardSurface} p-4 text-sm text-white shadow-[0_15px_35px_rgba(0,0,0,0.15)]`}
                >
                  <p className="text-base font-semibold">{card.title}</p>
                  <p className={`mt-1 text-xs ${palette.cardDesc}`}>{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-2xl px-4 py-3 text-xs text-white/80">
              <div className="flex h-14 w-14 items-center justify-center text-3xl">🕌</div>
              <div>
                <p className="text-sm font-semibold text-white">مسجد امام جعفر صادق (ع)</p>
                <p className="text-[11px] text-white/80">مشهد - نبش شهید صارمی ۴۹</p>
              </div>
            </div>
          </section>

          <section className={`rounded-[30px] border border-white/10 p-6 sm:p-8 ${palette.formBg}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-3xl font-extrabold ${palette.formText}`}>ورود مدیران</h2>
                <p className={`mt-2 text-sm ${palette.subtleText}`}>نام کوچک تایید شده و پین چهار رقمی را وارد کنید.</p>
              </div>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-5 text-sm" suppressHydrationWarning>
              <label className={`block ${palette.formText}`}>
                نام کوچک
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-base text-white placeholder-white/70 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/40"
                  placeholder="مثلاً علی"
                  suppressHydrationWarning
                  disabled={successPrompt}
                />
              </label>

              <label className={`block ${palette.formText}`}>
                پین چهار رقمی
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-base text-white placeholder-white/70 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/40"
                  placeholder="****"
                  suppressHydrationWarning
                  disabled={successPrompt}
                />
              </label>

              <label className={`flex items-center justify-between ${palette.subtleText}`}>
                <span className="text-sm">مرا به خاطر بسپار</span>
                <button
                  type="button"
                  onClick={() => setRemember((prev) => !prev)}
                  className={`relative h-8 w-14 rounded-full border ${
                    remember ? palette.rememberOn : palette.rememberOff
                  } transition`}
                  disabled={successPrompt}
                >
                  <span
                    className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-lg transition ${
                      remember ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </label>

              {error && (
                <p className="rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || successPrompt}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300 py-3 text-lg font-extrabold text-emerald-950 shadow-[0_25px_45px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? "در حال ورود..." : "ورود به داشبورد"}
              </button>
            </form>

            <p className={`mt-6 text-xs leading-6 ${palette.subtleText}`}>
              در صورت بروز مشکل در ورود، به مدیریت مسجد اطلاع دهید تا دسترسی تازه صادر شود.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
