"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { devotionalSchedule } from "@/app/_components/home-shell";

function DevotionalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeParam = (searchParams.get("type") || "dua") as "dua" | "ziyarat";
  const dayParam = searchParams.get("day");
  const dayIndex = Number.isInteger(Number(dayParam)) ? parseInt(dayParam as string, 10) : new Date().getDay();

  const info = devotionalSchedule[dayIndex];

  const isDua = typeParam === "dua";
  const title = info ? (isDua ? info.duaTitle : info.ziyaratTitle) : "متن یافت نشد";
  const dayLabel = info?.dayLabel ?? "";
  const content = info ? (isDua ? info.duaContent : info.ziyaratContent) : "موردی برای این روز پیدا نشد.";

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(current);
  }, []);

  const isLightTheme = theme === "light";

  const lines = content.split("\n");

  const panelSurface = isLightTheme
    ? "border border-emerald-200/80 bg-white/90 shadow-[0_30px_80px_rgba(34,197,94,0.22)]"
    : "border border-white/15 bg-[#07131f]/85 shadow-[0_35px_95px_rgba(0,0,0,0.7)] backdrop-blur";

  const scrollSurface = isLightTheme
    ? "bg-gradient-to-br from-emerald-50 via-white to-amber-50"
    : "bg-gradient-to-br from-[#031c18] via-[#04161a] to-[#050e18]";

  const backButtonClass = isLightTheme
    ? "rounded-full border border-emerald-200 bg-white/90 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm shadow-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-50"
    : "rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/85 transition hover:-translate-y-0.5 hover:border-white/50";

  const metaSubtitle = isLightTheme ? "text-xs text-emerald-700/90" : "text-xs text-emerald-300/90";
  const metaHint = isLightTheme ? "mt-1 text-xs text-emerald-900/70" : "mt-1 text-xs text-emerald-100/70";
  const innerTextColor = isLightTheme ? "text-[#0b1f33]" : "text-white";
  const unifiedParagraphClass = isLightTheme
    ? "mb-3 text-xl sm:text-2xl font-semibold leading-[2.25rem] text-emerald-900"
    : "mb-3 text-xl sm:text-2xl font-semibold leading-[2.25rem] text-emerald-100";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className={
          isLightTheme
            ? "absolute inset-0 bg-[linear-gradient(to_bottom,#f5e9d7_0%,#fde68a_30%,#bbf7d0_100%)]"
            : "absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.85),_transparent_72%)]"
        }
      />
      <div
        className={
          isLightTheme
            ? "absolute inset-0 bg-transparent"
            : "absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(40,53,147,0.88),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(91,33,182,0.68),_transparent_80%)]"
        }
      />
      <div
        className={
          isLightTheme
            ? "pointer-events-none absolute inset-0 bg-transparent"
            : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.35),_transparent_78%)]"
        }
      />
      <div className={`relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8 ${innerTextColor}`}>
        <header className="mb-6 flex items-center justify-between">
          <button onClick={() => router.back()} className={backButtonClass}>
            بازگشت
          </button>
          <div className="text-left">
            <p
              className={
                isLightTheme
                  ? "text-[11px] text-emerald-700/80"
                  : "text-[11px] text-emerald-200/80"
              }
            >
              {isDua ? "دعای روز" : "زیارت روز"} {dayLabel}
            </p>
            <h1 className="mt-1 text-lg font-semibold sm:text-xl">{title}</h1>
          </div>
        </header>

        <main className={`flex-1 overflow-hidden rounded-3xl p-5 sm:p-7 ${panelSurface}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p
                className={
                  isLightTheme
                    ? "text-xs text-emerald-700/90"
                    : "text-xs text-emerald-300/90"
                }
              >
                {isDua ? "متن کامل دعا" : "متن کامل زیارت"}
              </p>
            </div>
          </div>

          <section
            className={`mt-4 max-h-[calc(100vh-210px)] overflow-y-auto rounded-2xl p-4 text-right tracking-wide sm:p-6 ${scrollSurface}`}
            style={{ fontFamily: '"Amiri", "Scheherazade New", "IranNastaliq", serif' }}
          >
            {lines.map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              return (
                <p key={idx} className={unifiedParagraphClass}>
                  {trimmed}
                </p>
              );
            })}
          </section>
        </main>

        <footer
          className={
            isLightTheme
              ? "mt-6 text-center text-[11px] font-bold text-black"
              : "mt-6 text-center text-[11px] font-bold text-white"
          }
        >
          تلاوت این متن را به نیت سلامتی و تعجیل در فرج حضرت ولی‌عصر (عج) هدیه کنید.
        </footer>
      </div>
    </div>
  );
}

export default function DevotionalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#030d14] text-white">
          در حال بارگذاری دعا...
        </div>
      }
    >
      <DevotionalContent />
    </Suspense>
  );
}
