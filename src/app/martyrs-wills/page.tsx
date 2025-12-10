"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const willEntries = [
  {
    name: "شهید محمدابراهیم همت",
    unit: "فرمانده لشکر ۲۷ محمدرسول‌الله",
    context: "عملیات خیبر · جزایر مجنون",
    excerpt:
      "برادران! مبادا لحظه‌ای از ولایت فقیه جدا شوید که رمز پیروزی ما اطاعت از همین پرچم است. قدر این فرصت خدمت به اسلام را بدانید و بی‌هیاهو در میدان بمانید.",
    tags: ["ولایت‌مداری", "خدمت بی‌نام"],
  },
  {
    name: "شهید حسین علم‌الهدی",
    unit: "فرمانده گروه خط‌شکن هویزه",
    context: "عملیات نصر · هویزه",
    excerpt:
      "از شما می‌خواهم اگر خبری از نبودن من رسید، تنها دعایی کنید که خداوند این اندک قدم را قبول کند و در دفاع از قرآن و مستضعفین ثابت‌قدم بمانید.",
    tags: ["اخلاص", "دفاع از مستضعفین"],
  },
  {
    name: "شهید محمود کاوه",
    unit: "فرمانده قرارگاه نجف",
    context: "عملیات کربلای ۲",
    excerpt:
      "امروز جهاد فقط در میدان جنگ نیست؛ هر جا که بتوانید دل مردم را به انقلاب امیدوار کنید، همان‌جا یک سنگر است. خودتان را با قرآن و دعا سلاح‌بند کنید.",
    tags: ["امیدآفرینی", "انس با قرآن"],
  },
  {
    name: "شهید مهدی باکری",
    unit: "فرمانده لشکر عاشورا",
    context: "عملیات بدر",
    excerpt:
      "به همسرم بگویید هر جا دیدی نامم را می‌برند، از مردم بخواه برایم استغفار کنند. آنچه می‌ماند عمل صالح است، نه تمجیدهای ظاهری.",
    tags: ["تواضع", "عمل صالح"],
  },
];

export default function MartyrsWillsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") {
      return "light";
    }
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  });

  const goHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "masjed://home";
      setTimeout(() => router.push("/"), 200);
      return;
    }
    router.push("/");
  };

  const toggleTheme = () => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    root.classList.remove("light", "dark");
    root.classList.add(next);
    try {
      localStorage.setItem("theme", next);
    } catch (error) {
      console.warn("Cannot persist theme", error);
    }
    setTheme(next as "light" | "dark");
  };

  const isLight = theme === "light";
  const baseText = isLight ? "text-emerald-950" : "text-white";
  const heroPanel = isLight
    ? "border-emerald-200/80 bg-[linear-gradient(145deg,#f5fff6_0%,#e0ffe8_50%,#bbf7d0_100%)] shadow-[0_35px_90px_rgba(34,197,94,0.25)]"
    : "border-white/15 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.32),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(76,29,149,0.35),_transparent_60%),linear-gradient(160deg,rgba(3,6,14,0.95),rgba(6,16,28,0.92))] shadow-[0_45px_120px_rgba(3,7,18,0.8)] backdrop-blur-[26px]";
  const glassPanel = isLight
    ? "border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-emerald-100 to-amber-100 shadow-[0_22px_60px_rgba(16,185,129,0.18)]"
    : "border-white/15 bg-gradient-to-br from-[#0f172a]/80 via-[#111827]/85 to-[#030712]/90 shadow-[0_35px_90px_rgba(0,0,0,0.75)] backdrop-blur-[28px]";
  const heroHighlights = [
    { label: "میانگین زمان مطالعه", value: "۴ دقیقه" },
    { label: "وصایای منتشرشده", value: `${willEntries.length.toLocaleString("fa-IR")} وصیت` },
    { label: "بروزرسانی", value: "هفتگی" },
  ];

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

      <div className={`relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-8 pt-4 sm:px-8 lg:px-12 ${baseText}`}>
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
                  ? "hidden cursor-default whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-900 shadow-sm shadow-emerald-100 sm:inline"
                  : "hidden cursor-default whitespace-nowrap rounded-full border border-white/25 bg-black/50 px-3 py-1.5 text-[11px] font-medium text-white.shadow-lg backdrop-blur-sm sm:inline"
              }
            >
              مسجد و پایگاه امام جعفر صادق (ع) - مشهد
            </span>
          </div>
          <button
            onClick={goHome}
            className={
              isLight
                ? "rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300"
                : "rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:border-emerald-300/50"
            }
          >
            بازگشت به خانه
          </button>
        </div>

        <header className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={isLight ? "text-xs text-emerald-700/70" : "text-xs text-emerald-200/80"}>مرکز جامع وصیت‌نامه‌های نورانی شهدا</p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">بانک وصیت‌نامه شهدا</h1>
          </div>
          <div className={`rounded-[28px] border px-5 py-4 text-base ${glassPanel}`}>
            <p className={isLight ? "text-sm font-semibold text-slate-800" : "text-sm font-semibold text-emerald-200"}>یادداشت الهام‌بخش</p>
            <p className={`mt-2 text-[15px] leading-7 ${isLight ? "text-slate-800/90" : "text-emerald-100/80"}`}>
              «آنچه شهدا را جاودانه کرد، ترکیب تعقل جهادی با عرفان عملی بود؛ مطالعهٔ وصایای آنان نقشه راه امروز ماست.»
            </p>
          </div>
        </header>

        <section className="mt-10">
          <div className={`rounded-[32px] border p-8 ${heroPanel}`}>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              وصیت‌نامه یک شهید نقشه‌راهی است که او با <span className={isLight ? "text-red-600" : "text-red-400"}>خون</span> خود برای پیروزی ما ترسیم کرده است.
            </h2>
            <p className={`mt-4 text-[17px] leading-8 ${isLight ? "text-slate-900" : "text-emerald-100/80"}`}>
              این صفحه برای عموم مردم طراحی شده تا هر کس بتواند در چند دقیقه با روحیه و دغدغه‌های شهدا همراه شود؛ از خواندن خلاصه‌های ساده گرفته تا دسترسی سریع به متن کامل وصیت‌نامه‌ها.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div key={item.label} className={`rounded-2xl border px-4 py-3 text-center text-sm font-semibold ${glassPanel}`}>
                  <p className={`text-xs ${isLight ? "text-emerald-800" : "text-emerald-200"}`}>{item.label}</p>
                  <p className="mt-1 text-lg">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <main className="mt-10 flex-1">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {willEntries.map((entry) => (
              <article
                key={entry.name}
                className={`$${
                  isLight
                    ? "group rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-emerald-100/60 text-emerald-900 shadow-[0_20px_45px_rgba(16,185,129,0.18)]"
                    : "group rounded-3xl border border-white/12 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),_transparent_75%),linear-gradient(150deg,#030712,#050b16,#03060d)] text-white shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
                } p-6 transition duration-200 hover:-translate-y-1`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-base font-bold">{entry.name}</span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs ${
                        isLight ? "border-emerald-200 text-emerald-900" : "border-white/30 text-emerald-200"
                      }`}
                    >
                      {entry.context}
                    </span>
                  </div>
                  <p className={`text-sm ${isLight ? "text-emerald-900/80" : "text-white/80"}`}>{entry.unit}</p>
                  <p className={`mt-4 text-base leading-7 ${isLight ? "text-emerald-900/90" : "text-emerald-100/80"}`}>{entry.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
