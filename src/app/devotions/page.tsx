"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const devotionCards = [
  {
    title: "دعای کمیل",
    badge: "شب‌های جمعه",
    summary: "متن کامل دعای کمیل همراه ترجمه و صوت",
    icon: "🌙",
  },
  {
    title: "دعای توسل",
    badge: "سه‌شنبه شب‌ها",
    summary: "برای توسل به چهارده معصوم و طلب حاجات",
    icon: "🤲",
  },
  {
    title: "دعای ندبه",
    badge: "صبح‌های جمعه",
    summary: "آمادگی برای ظهور و یاد امام زمان (عج)",
    icon: "🌅",
  },
  {
    title: "دعای عهد",
    badge: "هر صبح",
    summary: "تجدید بیعت روزانه با حضرت ولی‌عصر (عج)",
    icon: "🕊️",
  },
  {
    title: "دعای ۱۴ صحیفه سجادیه",
    badge: "مجموعه کامل",
    summary: "گلچینی از نیایش‌های امام سجاد (ع)",
    icon: "📜",
  },
  {
    title: "زیارت آل یاسین",
    badge: "ویژه انتظار",
    summary: "زیارت مخصوص امام زمان (عج)",
    icon: "✨",
  },
  {
    title: "زیارت عاشورا",
    badge: "هر روز | ظهر عاشورا",
    summary: "متن کامل به همراه لعن و سلام",
    icon: "🏴",
  },
];

export default function DevotionsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const resolved = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(resolved);
  }, []);

  const toggleTheme = () => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    root.classList.remove("light", "dark");
    root.classList.add(next);
    try {
      localStorage.setItem("theme", next);
    } catch (err) {
      console.warn("Cannot persist theme", err);
    }
    setTheme(next as "light" | "dark");
  };

  const isLight = theme === "light";

  const baseText = isLight ? "text-emerald-950" : "text-white";
  const heroPanel = isLight
    ? "border-emerald-200/80 bg-[linear-gradient(135deg,#ecfdf5_0%,#d1fae5_40%,#bbf7d0_100%)] shadow-[0_30px_80px_rgba(45,194,137,0.28)]"
    : "border-white/15 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.32),_transparent_60%),linear-gradient(140deg,rgba(1,7,14,0.95),rgba(5,20,33,0.92))] shadow-[0_40px_110px_rgba(0,0,0,0.75)] backdrop-blur-[18px]";
  const glassPanel = isLight
    ? "border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-emerald-100 to-amber-100 shadow-[0_20px_55px_rgba(15,118,110,0.18)]"
    : "border-white/12 bg-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.7)] backdrop-blur-[20px]";
  const cardText = isLight ? "text-emerald-900/80" : "text-emerald-100/80";

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div
        className={
          isLight
            ? "absolute inset-0 bg-[linear-gradient(to_bottom,#f5e9d7_0%,#fde68a_30%,#bbf7d0_100%)]"
            : "absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.85),_transparent_72%)]"
        }
      />
      <div
        className={
          isLight
            ? "absolute inset-0 bg-transparent"
            : "absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(40,53,147,0.88),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(91,33,182,0.68),_transparent_80%)]"
        }
      />
      <div
        className={
          isLight
            ? "pointer-events-none absolute inset-0 bg-transparent"
            : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.35),_transparent_78%)]"
        }
      />
      <div
        className={`relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-8 pt-4 sm:px-8 lg:px-12 ${baseText}`}
      >
        <div
          className={
            isLight
              ? "relative z-20 flex w-full items-center justify-between gap-4 px-0 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-1"
              : "relative z-20 flex w-full items-center justify-between gap-4 px-0 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-1"
          }
        >
          <div className={`flex items-center gap-2 text-xs ${isLight ? "text-emerald-900" : "text-white"}`}>
            <button
              onClick={toggleTheme}
              className={
                isLight
                  ? "flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-lg text-emerald-700 shadow-md shadow-emerald-200/80 backdrop-blur-sm transition hover:bg-emerald-100 hover:shadow-emerald-300/90"
                  : "flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/70 text-lg text-white shadow-md backdrop-blur-sm transition hover:border-white/80"
              }
              aria-label="تغییر حالت روز و شب"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <span
              className={
                isLight
                  ? "cursor-default hidden whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-900 shadow-sm shadow-emerald-100 sm:inline"
                  : "cursor-default hidden whitespace-nowrap rounded-full border border-white/25 bg-black/50 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg backdrop-blur-sm sm:inline"
              }
            >
              مسجد و پایگاه امام جعفر صادق (ع) - مشهد
            </span>
          </div>
          <button
            onClick={() => router.push("/")}
            className={
              isLight
                ? "rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300"
                : "rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:border-emerald-300/50"
            }
          >
            بازگشت به داشبورد
          </button>
        </div>

        <header className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-left">
            <p className={isLight ? "text-xs text-emerald-700/70" : "text-xs text-emerald-200/80"}>
              آرشیو کامل ادعیه و زیارات ثابت مسجد
            </p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">کتابخانه ادعیه و زیارات</h1>
          </div>
        </header>

        <section className="mt-10">
          <div className={`rounded-[32px] border p-8 ${heroPanel}`}>
            <p className="text-sm font-semibold text-emerald-600">روح‌بخش و الهام‌بخش</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              کتابخانه ادعیه مسجد با الهام از صفحه اصلی
            </h2>
            <p className={`mt-4 text-base leading-7 ${cardText}`}>
              همه دعاها و زیارات شاخص در یک قاب واحد با طراحی گرافیکی ویژه و هماهنگ با هویت بصری داشبورد اصلی.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[{ label: "میانگین قرائت", value: "۱۵ دقیقه" }, { label: "فایل‌های پرطرفدار", value: "۷ مورد" }, { label: "بروزرسانی", value: "روزانه" }].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border px-4 py-3 text-center text-sm font-semibold ${glassPanel}`}
                >
                  <p className="text-xs text-emerald-500">{item.label}</p>
                  <p className="mt-1 text-lg">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <main className="mt-10 flex-1">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {devotionCards.map((card) => (
              <article
                key={card.title}
                className={`${
                  isLight
                    ? "group rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-emerald-100/60 text-emerald-900 shadow-[0_15px_35px_rgba(16,185,129,0.18)]"
                    : "group rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1a1a] via-[#0b1111] to-[#051414] text-white shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                } p-6 transition duration-200 hover:-translate-y-1`}
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl">{card.icon}</p>
                      <h2 className="mt-2 text-xl font-bold">{card.title}</h2>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isLight
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-white/15 text-emerald-200"
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <p className={`mt-4 flex-1 text-sm leading-7 ${cardText}`}>
                    {card.summary}
                  </p>
                  <button
                    type="button"
                    className={`mt-6 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold shadow-lg ${
                      isLight
                        ? "bg-gradient-to-l from-emerald-500 via-emerald-400 to-lime-400 text-white shadow-emerald-400/50"
                        : "bg-gradient-to-l from-emerald-400 via-teal-400 to-lime-400 text-[#02120b] shadow-emerald-700/50"
                    }`}
                  >
                    مشاهده و پخش
                    <span aria-hidden>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
