"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { devotionalSchedule } from "@/app/_components/home-shell";

type DevotionalClientProps = {
  initialParams: {
    type?: string | null;
    day?: string | null;
    inApp?: string | null;
  };
};

export default function DevotionalClient({ initialParams }: DevotionalClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  const currentTypeParam = (searchParams.get("type") ?? initialParams.type ?? "dua") as "dua" | "ziyarat";
  const currentDayParam = searchParams.get("day") ?? initialParams.day ?? undefined;
  const isInApp = (searchParams.get("inApp") ?? initialParams.inApp ?? "") === "1";

  const dayIndex = Number.isInteger(Number(currentDayParam))
    ? parseInt(currentDayParam as string, 10)
    : new Date().getDay();
  const info = devotionalSchedule[dayIndex];

  const isDua = currentTypeParam === "dua";
  const title = info ? (isDua ? info.duaTitle : info.ziyaratTitle) : "متن یافت نشد";
  const dayLabel = info?.dayLabel ?? "";
  const content = info ? (isDua ? info.duaContent : info.ziyaratContent) : "موردی برای این روز پیدا نشد.";

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const getTheme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    setTheme(getTheme());
    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateViewport = () => {
      setViewportHeight(window.innerHeight);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);
    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, []);

  useEffect(() => {
    const node = scrollAreaRef.current;
    if (!node) return;
    const handleTouchMove = (event: TouchEvent) => {
      event.stopPropagation();
    };
    node.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      node.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const goHome = () => {
    if (isInApp && typeof window !== "undefined" && typeof document !== "undefined") {
      let handledDeepLink = false;
      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
          handledDeepLink = true;
          document.removeEventListener("visibilitychange", handleVisibilityChange);
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.location.href = "masjed://home";

      setTimeout(() => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        if (!handledDeepLink) {
          router.push("/");
        }
      }, 600);
    }

    router.push("/");
  };

  const isLightTheme = theme === "light";

  const lines = content.split("\n");

  const panelSurface = isLightTheme
    ? "border border-emerald-200/80 bg-white/90 shadow-[0_30px_80px_rgba(34,197,94,0.22)]"
    : "border border-white/15 bg-[#07131f]/85 shadow-[0_35px_95px_rgba(0,0,0,0.7)] backdrop-blur";

  const scrollSurface = isLightTheme
    ? "bg-gradient-to-br from-emerald-50 via-white to-amber-50"
    : "bg-gradient-to-br from-[#031c18] via-[#04161a] to-[#050e18]";

  const innerTextColor = isLightTheme ? "text-[#0b1f33]" : "text-white";
  const backButtonClass = isLightTheme
    ? "rounded-full border border-emerald-200 bg-white/90 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm shadow-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-50"
    : "rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/85 transition hover:-translate-y-0.5 hover:border-white/50";
  const unifiedParagraphClass = isLightTheme
    ? "mb-3 text-xl sm:text-2xl font-semibold leading-[2.25rem] text-emerald-900"
    : "mb-3 text-xl sm:text-2xl font-semibold leading-[2.25rem] text-emerald-100";

  return (
    <div
      className="relative flex w-full overflow-hidden"
      style={
        viewportHeight
          ? {
              minHeight: viewportHeight,
            }
          : { minHeight: "100dvh" }
      }
    >
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
      <div className={`relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8 ${innerTextColor}`}>
        <header className={`mb-4 flex items-center ${isInApp ? "justify-center" : "justify-between"} gap-3`}>
          {!isInApp && (
            <button onClick={goHome} className={backButtonClass}>
              بازگشت به خانه
            </button>
          )}
          <div className="flex-1 text-center">
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

        <div className="flex flex-1 min-h-0 flex-col">
          <main
            className={`flex-1 min-h-0 overflow-hidden rounded-3xl p-5 sm:p-7 ${panelSurface}`}
            data-devotional-panel="surface"
          >
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

            <div className="mt-4 flex-1 min-h-0 overflow-hidden">
              <section
                ref={scrollAreaRef}
                className={`h-full overflow-y-auto rounded-2xl p-4 text-right tracking-wide sm:p-6 ${scrollSurface}`}
                style={{
                  fontFamily: '"Amiri", "Scheherazade New", "IranNastaliq", serif',
                  WebkitOverflowScrolling: "touch",
                  overscrollBehavior: "contain",
                  touchAction: "pan-y",
                }}
                data-devotional-scroll="content"
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
            </div>
          </main>

          <footer
            className={
              isLightTheme
                ? "mt-4 text-center text-[11px] font-bold text-black"
                : "mt-4 text-center text-[11px] font-bold text-white"
            }
          >
            تلاوت این متن را به نیت سلامتی و تعجیل در فرج حضرت ولی‌عصر (عج) هدیه کنید.
          </footer>
        </div>
      </div>
    </div>
  );
}
