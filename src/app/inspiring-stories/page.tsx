"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type StoryRecord = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
};

type StoryListResponse = {
  stories?: StoryRecord[];
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return fallback;
};

export default function InspiringStoriesPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") {
      return "light";
    }
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  });
  const [stories, setStories] = useState<StoryRecord[]>([]);
  const [storyLoading, setStoryLoading] = useState(true);
  const [storyError, setStoryError] = useState<string | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const goHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "masjed://home";
      setTimeout(() => router.push("/"), 200);
      return;
    }
    router.push("/");
  };

  const fetchStories = async () => {
    setStoryLoading(true);
    setStoryError(null);
    try {
      const res = await fetch("/api/inspiring-stories");
      if (!res.ok) throw new Error("failed");
      const data: StoryListResponse = await res.json();
      setStories(Array.isArray(data.stories) ? data.stories : []);
    } catch (error: unknown) {
      setStoryError(getErrorMessage(error, "بارگذاری داستان‌ها انجام نشد"));
    } finally {
      setStoryLoading(false);
    }
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
  const subtleText = isLight ? "text-emerald-900/80" : "text-emerald-100/80";
  const heroPanel = isLight
    ? "border-emerald-200/80 bg-[linear-gradient(145deg,#f5fff6_0%,#e0ffe8_50%,#bbf7d0_100%)] shadow-[0_35px_90px_rgba(34,197,94,0.25)]"
    : "border-white/15 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.32),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(76,29,149,0.35),_transparent_60%),linear-gradient(160deg,rgba(3,6,14,0.95),rgba(6,16,28,0.92))] shadow-[0_45px_120px_rgba(3,7,18,0.8)] backdrop-blur-[26px]";
  const glassPanel = isLight
    ? "border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-emerald-100 to-amber-100 shadow-[0_22px_60px_rgba(16,185,129,0.18)]"
    : "border-white/15 bg-gradient-to-br from-[#0f172a]/80 via-[#111827]/85 to-[#030712]/90 shadow-[0_35px_90px_rgba(0,0,0,0.75)] backdrop-blur-[28px]";
  const cardsPanel = isLight
    ? "border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 shadow-[0_20px_55px_rgba(34,197,94,0.18)]"
    : "border-white/10 bg-[#08121b] shadow-[0_18px_55px_rgba(0,0,0,0.65)]";
  const heroHighlights = useMemo(
    () => [
      { label: "روایت‌های آماده", value: `${stories.length.toLocaleString("fa-IR")} داستان` },
      { label: "میانگین اجرا", value: "۴ دقیقه" },
      { label: "چرخه بروزرسانی", value: "هفتگی" },
    ],
    [stories.length]
  );

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
              : "relative z-20 flex w-full.items-center justify-between gap-4 px-0 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-1"
          }
        >
          <div className={`flex items-center gap-2 text-xs ${isLight ? "text-emerald-900" : "text-white"}`}>
            <button
              onClick={toggleTheme}
              className={
                isLight
                  ? "flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-lg text-emerald-700 shadow-md shadow-emerald-200/80 backdrop-blur-sm.transition hover:bg-emerald-100 hover:shadow-emerald-300/90"
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
            <p className={isLight ? "text-xs text-emerald-700/70" : "text-xs text-emerald-200/80"}>مرکز روایت‌های الهام‌بخش مسجد</p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">کتابخانه داستان‌های پندآموز</h1>
          </div>
          <div className={`max-w-md rounded-[28px] border px-5 py-4 text-sm leading-7 ${glassPanel}`}>
            <p className={isLight ? "text-sm font-semibold text-slate-800" : "text-sm font-semibold text-emerald-100"}>یادداشت الهام‌بخش</p>
            <p className={`mt-2 text-[15px] ${isLight ? "text-slate-900" : "text-emerald-100/85"}`}>
              قصه‌های کوتاه، همان نقشهٔ راهِ نرم برای تربیت نسل مسجدی‌اند؛ هر روایت یک تمرین مشترک برای خانواده‌ها و هیئت اجرایی است.
            </p>
          </div>
        </header>

        <section className="mt-10">
          <div className={`rounded-[32px] border p-8 ${heroPanel}`}>
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">
              روایت درست، پلی است که با <span className="text-black dark:text-black">جانِ نسل قبل</span> ساخته شده تا امروز ما مسیر را گم نکنیم.
            </h2>
            <p className={`mt-4 text-[17px] leading-8 ${subtleText}`}>
              در این صفحه، داستان‌ها برای عموم مردم خلاصه شده‌اند؛ مربی می‌تواند در چند دقیقه پیام عملی را پیدا کند و نسخه کامل را در جلسات روایت کند.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border px-4 py-3 text-center text-sm font-semibold ${glassPanel}`}
                >
                  <p className={`text-xs ${isLight ? "text-emerald-800" : "text-emerald-200"}`}>{item.label}</p>
                  <p className="mt-1 text-lg">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <main className="mt-10 flex-1">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
            {storyLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-40 animate-pulse rounded-3xl border ${
                    isLight ? "border-emerald-100 bg-white/70" : "border-white/10 bg-white/5"
                  }`}
                />
              ))
            ) : storyError ? (
              <div className={`rounded-3xl border p-6 text-center text-base ${cardsPanel}`}>
                {storyError}
              </div>
            ) : stories.length ? (
              stories.map((story) => (
                <article
                  key={story.id}
                  className={`rounded-3xl border p-6 ${cardsPanel} transition duration-200 hover:-translate-y-1`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className={`text-xl font-bold ${baseText}`}>{story.title}</h3>
                    <span className={`text-xs ${subtleText}`}>
                      {new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(story.updatedAt || story.createdAt))}
                    </span>
                  </div>
                  <p className={`mt-4 text-base leading-7 ${subtleText}`}>{story.excerpt}</p>
                </article>
              ))
            ) : (
              <div className={`rounded-3xl border p-6 text-center text-base ${cardsPanel}`}>
                هنوز داستانی ثبت نشده است.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
