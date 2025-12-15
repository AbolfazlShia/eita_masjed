"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  exitAndroidApp,
  hasAndroidExitAck,
  markAndroidExitAck,
  writeAndroidDeskRememberState,
} from "@/lib/android";
import { writeStoredMembership } from "@/lib/membership-client";

export default function BasijLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPrompt, setSuccessPrompt] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/basij/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password: password.trim(), remember }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "خطا");
      writeAndroidDeskRememberState(remember);
      writeStoredMembership("active");
      const inApp = searchParams?.get("inApp") === "1";
      const source = searchParams?.get("source") || "";
      const isAndroidContext = inApp && source === "android";
      const suffix = inApp && source === "android" ? "?inApp=1&source=android" : "";
      if (isAndroidContext && !hasAndroidExitAck("basij")) {
        setSuccessPrompt(true);
      } else {
        router.push(`/basij/desk${suffix}`);
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "عدم دسترسی";
      setError(message === "invalid_password" ? "گذرواژه اشتباه است" : message === "not_found" ? "عضو یافت نشد" : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030d14] text-white" dir="rtl">
      {successPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 text-center text-white">
          <div className="max-w-sm rounded-3xl border border-emerald-200/30 bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
            <h3 className="text-xl font-extrabold">ورود بسیج انجام شد</h3>
            <p className="mt-3 text-sm text-white/80">برای دسترسی به میز، اپ را یک‌بار ببند و دوباره باز کن.</p>
            <button
              type="button"
              onClick={() => {
                markAndroidExitAck("basij");
                exitAndroidApp();
              }}
              className="mt-5 w-full rounded-2xl border border-white/30 bg-white/15 py-2.5 text-sm font-bold text-white transition hover:border-white/70 hover:bg-white/25"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.25),_transparent_50%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[40px] bg-gradient-to-br from-emerald-500 via-green-700 to-slate-900 p-10 text-white">
            <h1 className="text-3xl font-black leading-tight">ورود سریع اعضای فعال بسیج مسجد</h1>
            <p className="mt-6 text-sm text-white/80">
              با وارد کردن شماره همراه و گذرواژه، به میز کار بسیج دسترسی پیدا می‌کنید؛ از اینجا می‌توانید برنامه‌های روزانه، مأموریت‌ها و گزارش‌های میدانی را مدیریت کنید.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[{ title: "ثبت مأموریت", desc: "گزارش لحظه‌ای فعالیت‌ها" }, { title: "اعلام پشتیبانی", desc: "دریافت درخواست تجهیزات" }].map((card) => (
                <div key={card.title} className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
                  <p className="text-lg font-semibold">{card.title}</p>
                  <p className="mt-1 text-sm text-white/80">{card.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-2xl px-4 py-3 text-xs text-white/80">
              <div className="flex h-14 w-14 items-center justify-center text-3xl">🕌</div>
              <div>
                <p className="text-sm font-semibold text-white">مسجد امام جعفر صادق (ع)</p>
                <p className="mt-1 text-[11px] text-white/80">مشهد - نبش شهید صارمی ۴۹</p>
              </div>
            </div>
          </section>

          <section className="flex flex-col justify-center rounded-[40px] bg-[#050c16]/80 p-8 sm:p-10">
            <h2 className="text-3xl font-extrabold">ورود اعضای فعال</h2>
            <p className="mt-2 text-sm text-white/70">لطفاً شماره همراه تایید شده و گذرواژه را وارد کنید.</p>

            <form onSubmit={submit} className="mt-8 space-y-5 text-sm" suppressHydrationWarning>
              <label className="block text-white/80">
                شماره همراه
                <input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="مثلاً 09151234567"
                  suppressHydrationWarning
                />
              </label>

              <label className="block text-white/80">
                گذرواژه
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/50"
                  placeholder="رمز محرمانه"
                  suppressHydrationWarning
                />
              </label>

              <label className="flex items-center justify-between text-white/70">
                <span className="text-sm">مرا به خاطر بسپار</span>
                <button
                  type="button"
                  onClick={() => setRemember((prev) => !prev)}
                  className={`relative h-7 w-12 rounded-full transition ${remember ? "bg-emerald-400/90" : "bg-white/15"}`}
                  disabled={successPrompt}
                >
                  <span
                    className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition ${remember ? "translate-x-5" : ""}`}
                  />
                </button>
              </label>

              {error && <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">{error}</p>}

              <button
                type="submit"
                disabled={loading || successPrompt}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300 py-3 text-lg font-extrabold text-emerald-950 shadow-[0_25px_45px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? "در حال ورود..." : "ورود به میز کار بسیج"}
              </button>
            </form>

          </section>
        </div>
      </div>
    </div>
  );
}
