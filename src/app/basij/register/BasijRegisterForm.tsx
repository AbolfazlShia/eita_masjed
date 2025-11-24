"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BasijRegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/basij/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, unit, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      router.push("/basij/login");
    } catch (error: any) {
      const message = error?.message || "خطا";
      setError(
        message === "duplicate_phone"
          ? "این شماره همراه قبلاً ثبت شده است"
          : message === "limit_reached"
          ? "ظرفیت ثبت اعضا تکمیل شده است"
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09111f] text-white" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(16,185,129,0.2),_transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-12">
        <div className="rounded-[40px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-12">
          <p className="text-xs tracking-[0.4em] text-emerald-300">ثبت‌نام عضو فعال</p>
          <h1 className="mt-3 text-3xl font-black text-white">پیوستن به تیم عملیات فرهنگی و امنیتی مسجد</h1>
          <p className="mt-2 text-sm text-white/70">
            اطلاعات خود را وارد کنید تا پس از تایید مسئول پایگاه، دسترسی به میز کار بسیج فعال شود.
          </p>

          <form onSubmit={submit} className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
            <label className="block text-white/80">
              نام کوچک
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-white/15 bg-[#0b1626] px-4 py-3 text-white outline-none transition focus:border-emerald-300"
              />
            </label>
            <label className="block text-white/80">
              نام خانوادگی
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-[#0b1626] px-4 py-3 text-white outline-none transition focus:border-emerald-300"
              />
            </label>
            <label className="block text-white/80">
              شماره همراه تایید شده
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="tel"
                className="mt-2 w-full rounded-2xl border border-white/15 bg-[#0b1626] px-4 py-3 text-white outline-none transition focus:border-emerald-300"
                placeholder="0915xxxxxxx"
              />
            </label>
            <label className="block text-white/80">
              واحد یا مأموریت
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-[#0b1626] px-4 py-3 text-white outline-none transition focus:border-emerald-300"
                placeholder="واحد فرهنگی / امنیت محله"
              />
            </label>
            <label className="block text-white/80 sm:col-span-2">
              گذرواژه موقت
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-white/15 bg-[#0b1626] px-4 py-3 text-white outline-none transition focus:border-emerald-300"
                placeholder="گذرواژه محرمانه"
              />
            </label>

            {error && <p className="sm:col-span-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">{error}</p>}

            <div className="sm:col-span-2 mt-2 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-2xl bg-gradient-to-r from-sky-400 via-emerald-300 to-lime-300 px-4 py-3 text-lg font-extrabold text-emerald-950 shadow-[0_25px_45px_rgba(14,165,233,0.35)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? "در حال ثبت..." : "ثبت‌نام عضو فعال"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/basij/login")}
                className="rounded-2xl border border-white/40 px-4 py-3 text-sm text-white/80 transition hover:border-white"
              >
                بازگشت به ورود
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
