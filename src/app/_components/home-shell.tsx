  "use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatShamsiDate, getShamsiEventsByDate } from "@/lib/shamsi-events";
import { ServiceWorkerClient } from "./service-worker-client";
import { toJalaali } from "jalaali-js";
import { readStoredMembership, writeStoredMembership, type MembershipRole } from "@/lib/membership-client";
import { devotionalSchedule } from "@/lib/devotional-data";

type HadithItem = {
  id?: string;
  text: string;
  translation: string;
  source: string;
  order?: number;
};

type AnnouncementItem = {
  id?: string;
  title: string;
  body: string;
  highlight?: string;
  createdAt?: string;
  updatedAt?: string;
};

type QuickAction = {
  title: string;
  description: string;
  icon: string;
  href: string;
  accent?: string;
  disabled?: boolean;
};

const quickActions: QuickAction[] = [
  {
    title: 'ادعیه و زیارات',
    description: 'نمایش دعای روز و زیارت مخصوص همان روز در همین داشبورد',
    icon: '📿',
    href: '/devotions',
    accent: 'from-emerald-500/30 to-emerald-500/5',
  },
  {
    title: 'وصیت‌نامه شهدا',
    description: 'مروری بر بخشی از وصایای نورانی شهدا برای تقویت روحیه جهادی',
    icon: '📜',
    href: '/martyrs-wills',
    accent: 'from-teal-400/30 to-emerald-500/5',
  },
  {
    title: 'داستان‌های پندآموز',
    description: 'حکایت‌ها و داستان‌های الهام‌بخش برای جوانان مسجدی',
    icon: '📘',
    href: '/inspiring-stories',
    accent: 'from-indigo-400/30 to-purple-500/5',
  },
  {
    title: 'مدیریت خادمین و اعلان‌ها',
    description: 'اگر عضو فعال پایگاه یا مدیر مسجد هستید از اینجا وارد شوید',
    icon: '🛠️',
    href: '/management-access',
    accent: 'from-fuchsia-500/30 to-fuchsia-500/5',
  },
];

const defaultAnnouncements: AnnouncementItem[] = [
  {
    title: 'ویژه‌برنامه قرآنی سه‌شنبه‌ها',
    body: 'قرائت جزء‌خوانی و تفسیر کوتاه بعد از نماز مغرب در صحن اصلی مسجد.',
    highlight: 'آغاز از این هفته',
  },
  {
    title: 'پویش کمک مؤمنانه',
    body: 'جمع‌آوری کمک‌های نقدی و غیرنقدی برای خانواده‌های نیازمند محله تا پایان ماه جاری.',
    highlight: 'مسئول: پایگاه بسیج',
  },
  {
    title: 'ثبت‌نام اردوی جهادی',
    body: 'اعزام گروه جهادی به روستاهای خراسان در تاریخ ۲۵ آذر؛ ثبت‌نام در واحد فرهنگی.',
  },
];

const impactHighlights = [
  { title: '۱۰۰۰+ آیین برگزار شده', subtitle: 'آیین‌های برگزار شده', icon: '🕯️', detail: 'آرشیو منظم همه مراسم‌ها و همراهان در سامانه' },
  { title: '۱۲ برنامه', subtitle: 'در پیش رو', icon: '🗂️', detail: 'ستاد فرهنگی مسجد در حال آماده‌سازی' },
  { title: '۲۴/۷', subtitle: 'بروزرسانی خودکار', icon: '♻️', detail: 'Cron job و کش داخلی' },
];

type ThemeMode = "dark" | "light";
type ThemePreference = ThemeMode;

const defaultHadithBank: HadithItem[] = [
  {
    text: "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ",
    translation: "مؤمنان برادر یکدیگرند؛ میان برادران خود اصلاح برقرار کنید.",
    source: "قرآن کریم، سوره حجرات آیه ۱۰",
  },
  {
    text: "رَحِمَ اللّٰهُ عَبْدًا أَحْيَا حَقًّا وَأَمَاتَ بَاطِلًا",
    translation: "خدا رحمت کند بنده‌ای را که حقی را زنده و باطلی را نابود سازد.",
    source: "امام علی (ع) - نهج‌البلاغه، خطبه ۱۷۴",
  },
  {
    text: "مَنْ ذَكَرَ اللّٰهَ كَثِيرًا أَحَبَّهُ اللّٰهُ كَثِيرًا",
    translation: "هر که بسیار یاد خدا کند، خدا نیز او را بسیار دوست می‌دارد.",
    source: "امام صادق (ع) - کافی، ج ۲، ص ۵۰۳",
  },
  {
    text: "أَحَبُّ النَّاسِ إِلَى اللّٰهِ أَنْفَعُهُمْ لِلنَّاسِ",
    translation: "محبوب‌ترین مردم نزد خدا کسی است که سودش به مردم بیشتر برسد.",
    source: "پیامبر اکرم (ص) - کنزالعمال، ح ۱۷۲۰۳",
  },
  {
    text: "اَلزَّائِرُ لَنَا كَزَائِرِ الرَّسُولِ اللّٰهِ",
    translation: "زیارت‌کننده ما همچون زیارت‌کننده رسول خدا (ص) است.",
    source: "امام رضا (ع) - کامل الزیارات، باب ۶۲",
  },
  {
    text: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ",
    translation: "خدا توبه‌کنندگان و پاکیزگان را دوست دارد.",
    source: "قرآن کریم, سوره بقره آیه ۲۲۲",
  },
  {
    text: "إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ",
    translation: "خدا نیکوکاران را دوست دارد.",
    source: "قرآن کریم، سوره آل عمران آیه ۱۳۴",
  },
  {
    text: "إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ",
    translation: "خدا نیکوکاران را دوست دارد.",
    source: "قرآن کریم، سوره آل عمران آیه ۱۳۴",
  },
  {
    text: "إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ",
    translation: "خدا نیکوکاران را دوست دارد.",
    source: "قرآن کریم، سوره آل عمران آیه ۱۳۴",
  },
];

const prayerLabels: Record<string, string> = {
  fajr: 'اذان صبح',
  sunrise: 'طلوع خورشید',
  zuhr: 'اذان ظهر',
  asr: 'اذان عصر',
  sunset: 'غروب خورشید',
  maghrib: 'اذان مغرب',
  isha: 'اذان عشاء',
  midnight: 'نیمه شب شرعی',
};

const prayerDisplayOrder: (keyof typeof prayerLabels)[] = ['fajr', 'sunrise', 'zuhr', 'sunset', 'maghrib', 'midnight'];

interface HijriDateMeta {
  formatted?: string | null;
  raw?: string | null;
}

interface PrayerData {
  date: string;
  shamsiDate: string;
  gregorianDate: string;
  prayerTimes: Record<string, string>;
  events?: string[];
  iranianEvents?: string[];
  islamicEvents?: string[];
  hijriDate: HijriDateMeta | null;
  timezone?: string;
  shamsiDate_parts?: { year: number; month: number; day: number };
  source?: Record<string, string>;
  city?: string;
}

interface HomeShellProps {
  variant?: "default" | "miniApp";
}

export function HomeShell({ variant = "default" }: HomeShellProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isMiniApp = variant === "miniApp";
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [prayerLoading, setPrayerLoading] = useState(true);
  const [prayerError, setPrayerError] = useState<string | null>(null);
  const [themePref, setThemePref] = useState<ThemePreference>('light');
  const [resolvedTheme, setResolvedTheme] = useState<ThemeMode>('light');
  const [offline, setOffline] = useState(false);
  const [membershipRole, setMembershipRole] = useState<MembershipRole>(() => readStoredMembership());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || offline) return;
    let cancelled = false;
    const controller = new AbortController();

    const syncMembership = async () => {
      try {
        const res = await fetch("/api/membership/role", { cache: "no-store", signal: controller.signal });
        if (!res.ok) throw new Error("failed_membership_fetch");
        const data = await res.json();
        const role: MembershipRole = data?.role === "manager" || data?.role === "active" ? data.role : "guest";
        if (cancelled) return;
        setMembershipRole(role);
        writeStoredMembership(role);
      } catch (error) {
        if (!cancelled) {
          console.warn("membership role sync failed", error);
          setMembershipRole((prev) => prev);
        }
      }
    };

    syncMembership();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [mounted, offline]);

  const applyTheme = useCallback((mode: ThemeMode) => {
    setResolvedTheme(mode);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = mode;
      document.documentElement.style.colorScheme = mode;
    }
  }, []);

  // Only run this effect once on mount to avoid infinite loop
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('masjed-theme');
    if ((stored === 'dark' || stored === 'light') && stored !== themePref) {
      setThemePref(stored);
      applyTheme(stored);
    } else {
      applyTheme(themePref);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyTheme(themePref);
  }, [themePref, applyTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('masjed-theme', themePref);
  }, [themePref]);

  const shamsiMeta = useMemo(() => {
    const { jy, jm, jd } = toJalaali(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      selectedDate.getDate()
    );
    return {
      year: jy,
      month: jm,
      day: jd,
      formatted: formatShamsiDate(jy, jm, jd, true),
      raw: `${jy}-${jm.toString().padStart(2, "0")}-${jd.toString().padStart(2, "0")}`,
    };
  }, [selectedDate]);

  const fallbackEvents = useMemo(() => {
    if (!prayerData?.shamsiDate_parts) return [];
    const { year, month, day } = prayerData.shamsiDate_parts;
    return getShamsiEventsByDate(year, month, day);
  }, [prayerData?.shamsiDate_parts]);

  const isNetworkError = (error: unknown) => {
    if (typeof window === 'undefined') return false;
    if (error instanceof TypeError) return true;
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const msg = String((error as { message?: string }).message || '').toLowerCase();
      return msg.includes('failed to fetch') || msg.includes('network');
    }
    return false;
  };

  const fetchPrayerTimes = useCallback(async () => {
    try {
      setPrayerLoading(true);
      setPrayerError(null);

      const response = await fetch(`/api/prayer-by-date?shamsiDate=${shamsiMeta.raw}`);
      if (!response.ok) throw new Error('عدم دسترسی به اوقات شرعی');
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || 'خطای ناشناخته');
      setPrayerData(result);
      setOffline(false);
    } catch (error) {
      setPrayerError(error instanceof Error ? error.message : 'خطای ناشناخته');
      setPrayerData(null);
      if (isNetworkError(error)) {
        setOffline(true);
      }
    } finally {
      setPrayerLoading(false);
    }
  }, [shamsiMeta.raw]);

  useEffect(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  const moveDay = (delta: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta);
      return next;
    });
  };

  const [hadiths, setHadiths] = useState<HadithItem[]>(defaultHadithBank);
  const [hadithError, setHadithError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(defaultAnnouncements);
  const [announcementError, setAnnouncementError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchHadiths = async () => {
      try {
        const res = await fetch('/api/hadiths');
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        if (!cancelled && Array.isArray(data.hadiths) && data.hadiths.length) {
          setHadiths(data.hadiths);
          setOffline(false);
        }
      } catch (error) {
        if (!cancelled) {
          setHadithError('عدم دسترسی به بانک احادیث');
          if (isNetworkError(error)) {
            setOffline(true);
          }
        }
      }
    };
    fetchHadiths();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let aborted = false;
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        if (!aborted && Array.isArray(data.announcements) && data.announcements.length) {
          setAnnouncements(data.announcements);
          setOffline(false);
        }
      } catch (error) {
        if (!aborted) {
          setAnnouncementError('عدم دسترسی به اطلاعیه‌ها');
          if (isNetworkError(error)) {
            setOffline(true);
          }
        }
      }
    };
    fetchAnnouncements();
    return () => {
      aborted = true;
    };
  }, []);

  const todaysHadith = useMemo(() => {
    const dayIndex = Math.floor(new Date().getTime() / 86400000);
    const bank = hadiths.length ? hadiths : defaultHadithBank;
    return bank[dayIndex % bank.length];
  }, [hadiths]);

  const [devotionalLoading, setDevotionalLoading] = useState(false);
  const [devotionalError, setDevotionalError] = useState<string | null>(null);
  const [devotionalInfo, setDevotionalInfo] = useState(() => devotionalSchedule[selectedDate.getDay()]);

  useEffect(() => {
    let cancelled = false;
    const loadDevotional = async () => {
      const dayIndex = selectedDate.getDay();
      setDevotionalLoading(true);
      setDevotionalError(null);
      try {
        const res = await fetch(`/api/devotional?type=dua&day=${dayIndex}`, { cache: "no-store" });
        if (!res.ok) throw new Error("عدم دسترسی به متن دعا");
        const data = await res.json();
        if (!data?.ok) throw new Error(data?.error || "خطا در دریافت محتوای دعا");
        if (!cancelled) {
          const fallback = devotionalSchedule[dayIndex];
          setDevotionalInfo({
            dayLabel: data.dayLabel ?? fallback?.dayLabel ?? "",
            duaTitle: data.entry?.duaTitle ?? fallback?.duaTitle ?? "",
            duaContent: data.entry?.duaContent ?? fallback?.duaContent ?? "",
            ziyaratTitle: data.entry?.ziyaratTitle ?? fallback?.ziyaratTitle ?? "",
            ziyaratContent: data.entry?.ziyaratContent ?? fallback?.ziyaratContent ?? "",
          });
        }
      } catch (error) {
        if (!cancelled) {
          setDevotionalError(error instanceof Error ? error.message : "خطا در دریافت محتوای دعا");
          setDevotionalInfo(devotionalSchedule[selectedDate.getDay()]);
        }
      } finally {
        if (!cancelled) setDevotionalLoading(false);
      }
    };
    loadDevotional();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const [devotionalModal, setDevotionalModal] = useState<{
    title: string;
    content: string;
    metadata: string;
  } | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (devotionalModal) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
    document.body.style.overflow = "";
  }, [devotionalModal]);

  const layout = useMemo(() => {
    if (isMiniApp) {
      return {
        outer: "relative min-h-screen overflow-hidden overscroll-y-none",
        inner: "relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-8 px-3 pt-0 pb-4 sm:px-4",
        headerPadding: "p-4",
        sectionGap: "gap-3",
        footerPadding: "px-4 py-3 text-xs",
      };
    }
    return {
      outer: "relative min-h-screen overflow-hidden overscroll-y-none",
      inner: "relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-0 pb-3 lg:px-8 lg:pt-2 lg:pb-6",
      headerPadding: "p-6",
      sectionGap: "gap-4",
      footerPadding: "px-6 py-4 text-sm",
    };
  }, [isMiniApp]);

  const hijriLabel = prayerData?.hijriDate?.formatted ?? '';
  const combinedEvents = useMemo(() => {
    const bucket = new Set<string>();
    (prayerData?.iranianEvents ?? []).forEach((item) => item && bucket.add(item));
    (prayerData?.islamicEvents ?? []).forEach((item) => item && bucket.add(item));
    (prayerData?.events ?? []).forEach((item) => item && bucket.add(item));
    fallbackEvents.forEach((item) => item && bucket.add(item));
    return Array.from(bucket);
  }, [prayerData, fallbackEvents]);

  const toggleTheme = () => {
    setThemePref((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isLightTheme = resolvedTheme === 'light';
  const membershipBadgeClass = isLightTheme
    ? "inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-[11px] font-semibold text-emerald-900 shadow-sm shadow-emerald-200/60"
    : "inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm";
  const membershipLabel = membershipRole === "manager" ? "مدیر" : membershipRole === "active" ? "عضو فعال" : "عادی";
  const membershipDeskConfig = useMemo(() => {
    if (membershipRole === "manager") {
      return {
        title: "میز کار مدیر مسجد",
        description: "تمام ابزارهای ثبت اعلان، مدیریت محتوا و اعضا آماده است. بدون ورود مجدد ادامه بده.",
        cta: "ورود به میز مدیر",
        href: "/manager/desk",
      };
    }
    if (membershipRole === "active") {
      return {
        title: "میز کار عضو فعال بسیج",
        description: "امتیازات و برنامه‌هایت از همین‌جا در دسترس است؛ کافی است میز بسیج را باز کنی.",
        cta: "ورود به میز بسیج",
        href: "/basij/desk",
      };
    }
    return null;
  }, [membershipRole]);
  const membershipCtaClass = isLightTheme
    ? "rounded-2xl bg-gradient-to-l from-emerald-500 via-teal-500 to-emerald-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-400/40 transition hover:-translate-y-0.5"
    : "rounded-2xl bg-gradient-to-l from-emerald-400 via-emerald-500 to-lime-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5";
  const membershipHintClass = isLightTheme ? "text-[11px] text-emerald-900/70" : "text-[11px] text-white/70";
  const footerBackground = isLightTheme
    ? 'linear-gradient(90deg, #0b6b2b 0%, #0b6b2b 30%, #fefefe 50%, #b71c1c 70%, #b71c1c 100%)'
    : 'linear-gradient(90deg, #06381f 0%, #06381f 30%, #0a0a0a 50%, #7b0000 70%, #7b0000 100%)';

  if (!mounted) {
    return <div className="relative min-h-screen overflow-hidden bg-[#fdf9f0]" />;
  }

  if (offline) {
    return (
      <>
        <ServiceWorkerClient />
        <div className="flex min-h-screen items-center justify-center bg-[#030d09] px-6 text-center text-white">
          <div>
            <p className="text-xl font-semibold">اتصال برقرار نیست</p>
            <p className="mt-3 text-sm text-white/70">سرور محلی یا اینترنت را بررسی کرده و دوباره تلاش کنید.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ServiceWorkerClient />
      <div className={layout.outer} style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div
          aria-hidden="true"
          className={
            isLightTheme
              ? "pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#f5e9d7_0%,#fde68a_30%,#bbf7d0_100%)]"
              : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.85),_transparent_72%)]"
          }
        />
        <div
          aria-hidden="true"
          className={
            isLightTheme
              ? "pointer-events-none absolute inset-0 bg-transparent"
              : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(40,53,147,0.88),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(91,33,182,0.68),_transparent_80%)]"
          }
        />
        <div
          aria-hidden="true"
          className={
            isLightTheme
              ? "pointer-events-none absolute inset-0 bg-transparent"
              : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.35),_transparent_78%)]"
          }
        />

      <div
        className={
          isMiniApp
            ? "relative z-20 flex w-full justify-start px-0 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-1"
            : "relative z-20 flex w-full justify-start px-0 pt-3 sm:px-1 lg:px-2"
        }
      >
        <div className="flex w-full items-center justify-between gap-3">
          <div
            className={`flex items-center gap-2 text-xs ${
              isLightTheme ? "text-emerald-900" : "text-white"
            }`}
          >
            <button
              onClick={toggleTheme}
              className={
                isLightTheme
                  ? "flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-lg text-emerald-700 shadow-md shadow-emerald-200/80 backdrop-blur-sm transition hover:bg-emerald-100 hover:shadow-emerald-300/90"
                  : "flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/70 text-lg text-white shadow-md backdrop-blur-sm transition hover:border-white/80"
              }
              aria-label="تغییر حالت روز و شب"
            >
              {resolvedTheme === "dark" ? "☀️" : "🌙"}
            </button>
            <span
              className={
                isLightTheme
                  ? "hidden cursor-default whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-900 shadow-sm shadow-emerald-100 sm:inline"
                  : "hidden cursor-default whitespace-nowrap rounded-full border border-white/25 bg-black/50 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg backdrop-blur-sm sm:inline"
              }
            >
              مسجد و پایگاه امام جعفر صادق (ع) - مشهد
            </span>
          </div>
          <a
            href="/masjed-app.apk"
            download
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
              isLightTheme
                ? 'border-emerald-300 bg-white/80 text-emerald-900 shadow-sm hover:bg-emerald-50'
                : 'border-white/30 bg-black/60 text-white backdrop-blur-sm hover:border-white/70'
            }`}
          >
            📱 دانلود نسخه اندروید
          </a>
        </div>
      </div>

      <div className={layout.inner}>
        <section
          className={
            isLightTheme
              ? "rounded-3xl border border-emerald-200/80 bg-[linear-gradient(135deg,#ecfdf5_0%,#d1fae5_40%,#bbf7d0_100%)] p-4 text-sm text-slate-900"
              : "rounded-3xl border border-white/10 bg-black/30 p-4 text-sm text-white"
          }
        >
          <p
            className="mb-3 text-center text-3xl font-semibold leading-relaxed sm:text-4xl"
            style={{ fontFamily: '"Amiri", "Scheherazade New", "IranNastaliq", serif' }}
          >
            <span
              className={
                isLightTheme
                  ? "text-[#d4a017]"
                  : "bg-gradient-to-r from-[#fef9c3] via-[#facc15] to-[#f97316] bg-clip-text text-transparent"
              }
              style={{
                textShadow: isLightTheme
                  ? "0 10px 28px rgba(25, 40, 34, 0.45)"
                  : "0 10px 32px rgba(0, 0, 0, 0.6)",
              }}
            >
              اللهم عجل لولیک الفرج
            </span>
          </p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveDay(-1)}
                  className={
                    isLightTheme
                      ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800 transition hover:bg-emerald-100"
                      : "rounded-full border border-emerald-200/30 bg-emerald-900/40 px-3 py-1 text-emerald-100 transition hover:border-emerald-200/60"
                  }
                  aria-label="روز قبل"
                >
                  ▶
                </button>
                <div className="flex min-w-[220px] flex-col items-center text-center">
                  <h2
                    className={
                      isLightTheme
                        ? "text-lg font-semibold text-emerald-900"
                        : "text-lg font-semibold"
                    }
                  >
                    {prayerData?.shamsiDate ?? shamsiMeta.formatted}
                  </h2>
                </div>
                <button
                  onClick={() => moveDay(1)}
                  className={
                    isLightTheme
                      ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800 transition hover:bg-emerald-100"
                      : "rounded-full border border-emerald-200/30 bg-emerald-900/40 px-3 py-1 text-emerald-100 transition hover:border-emerald-200/60"
                  }
                  aria-label="روز بعد"
                >
                  ◀
                </button>
              </div>
              {combinedEvents.length ? (
                <p
                  className={
                    isLightTheme
                      ? "mt-1 text-[11px] text-emerald-800/90 text-center"
                      : "mt-1 text-[11px] text-amber-100 text-center"
                  }
                >
                  {combinedEvents.join(" • ")}
                </p>
              ) : (
                <p
                  className={
                    isLightTheme
                      ? "mt-1 text-[11px] text-emerald-900/70 text-center"
                      : "mt-1 text-[11px] text-white/70 text-center"
                  }
                >
                  مناسبت ثبت نشده است
                </p>
              )}
            </div>
            <div
              className={
                isLightTheme
                  ? "text-left text-xs text-emerald-900 sm:text-right"
                  : "text-left text-xs sm:text-right"
              }
            >
              {hijriLabel && (
                <p
                  className={
                    isLightTheme
                      ? "text-xs text-emerald-800/80"
                      : "text-xs text-white/70"
                  }
                >
                  {hijriLabel}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            {prayerLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: prayerDisplayOrder.length }).map((_, idx) => (
                  <div
                    key={idx}
                    className={
                      isLightTheme
                        ? "h-20 animate-pulse rounded-2xl border border-emerald-700 bg-lime-100/80"
                        : "h-20 animate-pulse rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-slate-900/70 via-slate-900/50 to-slate-900/80"
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {prayerDisplayOrder.map((key) => (
                  <div
                    key={key}
                    className={
                      isLightTheme
                        ? "rounded-2xl border border-emerald-700 bg-lime-100/90 p-3 text-center"
                        : "rounded-2xl border border-emerald-400/50 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-slate-900/90 p-3 text-center"
                    }
                  >
                    <p
                      className={
                        isLightTheme
                          ? "text-xs text-sky-900"
                          : "text-xs text-white/60"
                      }
                    >
                      {prayerLabels[key]}
                    </p>
                    <p
                      className={
                        isLightTheme
                          ? "mt-2 text-xl font-bold text-sky-800"
                          : "mt-2 text-xl font-bold text-emerald-300"
                      }
                    >
                      {prayerData?.prayerTimes?.[key] ?? '—'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <header
          className={`flex flex-col gap-4 rounded-3xl border ${
            isLightTheme
              ? 'border-emerald-300/70 bg-[linear-gradient(135deg,#ecfdf5_0%,#d1fae5_40%,#bbf7d0_100%)]'
              : 'border-white/10 bg-white/5'
          } ${layout.headerPadding} backdrop-blur`}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1
                className={
                  isLightTheme
                    ? "mt-2 text-3xl font-bold leading-tight text-emerald-950 sm:text-4xl"
                    : "mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl"
                }
              >
                داشبورد هوشمند مسجد
              </h1>
              <p
                className={
                  isLightTheme
                    ? "mt-3 max-w-3xl text-base font-semibold leading-relaxed text-emerald-900 sm:text-lg"
                    : "mt-3 max-w-3xl text-base font-semibold leading-relaxed text-amber-100 sm:text-lg"
                }
              >
                مسجد فقط محل نماز خواندن نیست؛ مسجد پایگاه توحید است؛ مسجد مرکز تصمیم‌گیری‌های بزرگ است؛ مسجد جایگاهی است که دلها در آن به نور خداوند روشن می‌شود.
                <br />
                <span
                  className={
                    isLightTheme
                      ? "mt-2 inline-block text-xs font-normal text-emerald-800/80"
                      : "mt-2 inline-block text-xs font-normal text-emerald-100/90"
                  }
                >
                  مقام معظم رهبری(مد ظله العالی) ۱۳۹۸/۰۷/۲۲
                </span>
              </p>
              <div
                className={
                  isLightTheme
                    ? "mt-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 p-5 text-sm text-emerald-950"
                    : "mt-4 rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-white/85"
                }
              >
                <p
                  className={
                    isLightTheme
                      ? "text-sm font-semibold text-emerald-700"
                      : "text-emerald-200/80"
                  }
                >
                  حدیث روز
                </p>
                <p
                  className={
                    isLightTheme
                      ? "mt-2 text-sm leading-7 text-emerald-950"
                      : "mt-2 text-sm leading-7 text-white/90"
                  }
                >
                  {todaysHadith.text}
                </p>
                <p
                  className={
                    isLightTheme
                      ? "mt-3 text-lg font-semibold leading-8 text-emerald-700"
                      : "mt-3 text-lg font-semibold leading-8 text-emerald-100"
                  }
                >
                  {todaysHadith.translation}
                </p>
                <p
                  className={
                    isLightTheme
                      ? "mt-2 text-xs text-emerald-900/70"
                      : "mt-2 text-xs text-white/60"
                  }
                >
                  {todaysHadith.source}
                </p>
                {hadithError && (
                  <p className="mt-2 text-xs text-red-300">
                    {hadithError}
                  </p>
                )}
              </div>
            </div>
            <div
              className={
                isLightTheme
                  ? "flex w-full flex-col gap-4 rounded-2xl border border-emerald-200/80 bg-white/80 p-5 text-sm text-emerald-950 lg:max-w-xs"
                  : "flex w-full flex-col gap-4 rounded-2xl border border-white/15 bg-black/40 p-5 text-sm lg:max-w-xs"
              }
            >
              <p
                className={
                  isLightTheme ? "text-emerald-900/80" : "text-white/70"
                }
              >
                جدول ادعیه و زیارات روز
              </p>
              <button
                onClick={() => router.push(`/devotional?type=dua&day=${selectedDate.getDay()}`)}
                className={
                  isLightTheme
                    ? "group rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-100 via-emerald-200 to-teal-100 p-5 text-right transition hover:bg-emerald-100"
                    : "group rounded-2xl border border-emerald-200/30 bg-gradient-to-br from-emerald-900/50 via-emerald-800/30 to-emerald-700/20 p-5 text-right transition hover:border-emerald-200/60"
                }
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={isLightTheme ? "text-emerald-800/90" : "text-emerald-100/90"}>
                    دعای روز {devotionalInfo?.dayLabel}
                  </span>
                  {devotionalLoading && (
                    <span className={isLightTheme ? "text-emerald-900/70" : "text-emerald-200/80"}>...در حال بروزرسانی</span>
                  )}
                </div>
                {devotionalError && (
                  <p className="mt-1 text-[11px] text-rose-500">{devotionalError}</p>
                )}
                <p
                  className={
                    isLightTheme
                      ? "mt-3 text-sm font-semibold text-emerald-950"
                      : "mt-3 text-sm font-semibold text-white/90"
                  }
                >
                  {devotionalInfo?.duaTitle}
                </p>
              </button>
              <button
                onClick={() => router.push(`/devotional?type=ziyarat&day=${selectedDate.getDay()}`)}
                className={
                  isLightTheme
                    ? "rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-100 via-emerald-200 to-teal-100 p-4 text-right transition hover:bg-emerald-100"
                    : "rounded-2xl border border-emerald-200/30 bg-gradient-to-br from-emerald-900/50 via-emerald-800/30 to-emerald-700/20 p-4 text-right transition hover:border-emerald-200/60"
                }
              >
                <p
                  className={
                    isLightTheme
                      ? "text-xs text-emerald-800"
                      : "text-xs text-amber-200"
                  }
                >
                  زیارت روز {devotionalInfo?.dayLabel}
                </p>
                <p
                  className={
                    isLightTheme
                      ? "mt-1 font-semibold text-emerald-950"
                      : "mt-1 font-semibold text-white"
                  }
                >
                  {devotionalInfo?.ziyaratTitle}
                </p>
              </button>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => router.push('/basij/login')}
                  className={
                    isLightTheme
                      ? "flex-1 rounded-2xl bg-gradient-to-l from-emerald-500 via-emerald-400 to-lime-400 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-400/60 transition hover:-translate-y-0.5 sm:px-6 sm:text-sm"
                      : "flex-1 rounded-2xl bg-gradient-to-l from-emerald-500 via-emerald-400 to-lime-400 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5 sm:px-6 sm:text-sm"
                  }
                >
                  شروع سریع داشبورد روزانه
                </button>
                <button
                  onClick={() => router.push('/auth/login')}
                  className={
                    isLightTheme
                      ? "flex-1 rounded-2xl border border-emerald-400 px-4 py-2.5 text-xs font-semibold text-emerald-900 shadow-sm shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-50 sm:px-5 sm:text-sm"
                      : "flex-1 rounded-2xl border border-white/30 px-4 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-white sm:px-5 sm:text-sm"
                  }
                >
                  ورود مدیر
                </button>
              </div>
            </div>
          </div>
        </header>

        <section
          className={`grid ${layout.sectionGap} ${
            isMiniApp ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {quickActions.map((action) => {
            const isDisabled = Boolean(action.disabled);
            const accent = action.accent ?? "from-emerald-500/30 to-emerald-500/5";
            const baseClass = isLightTheme
              ? "border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-50 text-emerald-950 shadow-[0_18px_40px_rgba(34,197,94,0.18)]"
              : `border-white/10 bg-gradient-to-br ${accent} text-white`;
            const motionClass = isLightTheme
              ? "transition duration-200 hover:-translate-y-1"
              : "transition duration-200 hover:-translate-y-1 hover:border-white/50 hover:shadow-[0_20px_45px_rgba(16,185,129,0.45)]";
            return (
              <button
                key={action.title}
                type="button"
                aria-disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) router.push(action.href);
                }}
                className={`group flex h-full flex-col items-start gap-4 rounded-3xl border ${baseClass} p-5 text-right ${
                  isDisabled ? "cursor-default" : `cursor-pointer ${motionClass}`
                }`}
              >
                <div className="flex items-start gap-3">
                  {action.icon && (
                    <span className="mt-1 text-3xl leading-none">
                      {action.icon}
                    </span>
                  )}
                  <div>
                    <p className={isLightTheme ? "text-lg font-semibold text-emerald-950" : "text-lg font-semibold"}>
                      {action.title}
                    </p>
                    <p className={isLightTheme ? "mt-1 text-sm text-emerald-900/80" : "mt-1 text-sm text-white/80"}>{action.description}</p>
                  </div>
                </div>
                <span className={isLightTheme ? "mt-auto text-xs text-emerald-800/80" : "mt-auto text-xs text-white/70"}>
                  رفتن به صفحه →
                </span>
              </button>
            );
          })}
        </section>

        {prayerError && (
          <section className="rounded-3xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">
            {prayerError}
          </section>
        )}

        <section className={`grid gap-4 ${isMiniApp ? "" : "lg:grid-cols-[2fr,1fr]"}`}>
          <div
            className={
              isLightTheme
                ? "rounded-3xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50 via-emerald-100 to-amber-100 p-3 sm:p-4 shadow-[0_20px_50px_rgba(15,118,110,0.25)]"
                : "rounded-3xl border border-white/10 bg-white/5 p-3 sm:p-4 shadow-inner shadow-black/20"
            }
          >
            <div className="flex items-center justify-between">
              <h2
                className={
                  isLightTheme
                    ? "text-2xl font-bold text-emerald-900"
                    : "text-2xl font-bold text-emerald-200"
                }
              >
                داشبورد مدیریتی
              </h2>
            </div>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
              {impactHighlights.map((item) => (
                <div
                  key={item.title}
                  className={
                    isLightTheme
                      ? "rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-100 via-emerald-200 to-amber-200 p-3"
                      : "rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-slate-900/90 p-3"
                  }
                >
                  <div className="text-xl">{item.icon}</div>
                  <p
                    className={
                      isLightTheme
                        ? "mt-3 text-xl font-black text-emerald-950"
                        : "mt-3 text-xl font-black text-white"
                    }
                  >
                    {item.title}
                  </p>
                  <p
                    className={
                      isLightTheme
                        ? "text-sm text-emerald-900/80"
                        : "text-sm text-emerald-100/80"
                    }
                  >
                    {item.subtitle}
                  </p>
                  <p
                    className={
                      isLightTheme
                        ? "mt-3 text-xs text-emerald-900/70"
                        : "mt-3 text-xs text-white/60"
                    }
                  >
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div
            className={
              isLightTheme
                ? "rounded-3xl border border-emerald-300/80 bg-gradient-to-br from-teal-100 via-emerald-100 to-amber-100 p-6 shadow-[0_18px_45px_rgba(14,116,144,0.22)]"
                : "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner shadow-black/20"
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  className={
                    isLightTheme
                      ? "text-xl font-semibold text-emerald-950"
                      : "text-xl font-semibold text-white"
                  }
                >
                  اطلاعیه‌های مسجد و پایگاه
                </h3>
                <p className={`mt-2 text-sm ${isLightTheme ? 'text-emerald-800/80' : 'text-white/70'}`}>
                  تازه‌ترین پیام‌های مدیریتی برای نمایش عمومی
                </p>
              </div>
              {announcementError && (
                <span className="text-xs text-red-200">{announcementError}</span>
              )}
            </div>
            <div className="mt-5 space-y-4">
              {announcements.map((item, idx) => (
                <div
                  key={item.id ?? idx}
                  className={`rounded-2xl border p-4 ${
                    isLightTheme
                      ? 'border-white/80 bg-white/80 shadow-[0_12px_30px_rgba(16,185,129,0.15)]'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-base font-semibold ${isLightTheme ? 'text-emerald-900' : 'text-white'}`}>
                      {item.title}
                    </p>
                    {item.highlight && (
                      <span
                        className={`rounded-full px-3 py-0.5 text-[11px] font-semibold ${
                          isLightTheme ? 'bg-emerald-100 text-emerald-900' : 'bg-white/10 text-emerald-100'
                        }`}
                      >
                        {item.highlight}
                      </span>
                    )}
                  </div>
                  <p className={`mt-2 text-sm leading-7 ${isLightTheme ? 'text-emerald-900/80' : 'text-white/75'}`}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`rounded-3xl border p-6 ${
            isMiniApp ? "pb-5 text-sm" : ""
          } ${
            isLightTheme
              ? "border-emerald-300/80 bg-gradient-to-br from-emerald-50 via-emerald-100 to-amber-100 shadow-[0_20px_50px_rgba(15,118,110,0.25)]"
              : "border-white/10 bg-black/40"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                className={
                  isLightTheme
                    ? "text-2xl font-semibold text-emerald-900"
                    : "text-2xl font-semibold text-emerald-200/90"
                }
              >
                هیئت اجرایی مسجد
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div
              className={
                isLightTheme
                  ? "rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-100 via-emerald-200 to-amber-200 p-5 shadow-[0_12px_30px_rgba(15,118,110,0.15)]"
                  : "rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-slate-900/90 p-5"
              }
            >
              <p
                className={
                  isLightTheme
                    ? "text-sm text-emerald-900/80"
                    : "text-sm text-white/70"
                }
              >
                مدیریت برنامه‌ها
              </p>
              <h3
                className={
                  isLightTheme
                    ? "mt-2 text-lg font-semibold text-emerald-950"
                    : "mt-2 text-lg font-semibold text-white"
                }
              >
                تقویم رویدادها و کلاس‌ها
              </h3>
              <p
                className={
                  isLightTheme
                    ? "mt-2 text-sm text-emerald-900/80"
                    : "mt-2 text-sm text-white/70"
                }
              >
                ایجاد، ویرایش و نمایش خودکار کلاس‌ها و محافل قرآنی در صفحه عمومی مسجد.
              </p>
              <span
                className={
                  isLightTheme
                    ? "mt-4 inline-flex w-fit rounded-full bg-emerald-50/90 px-3 py-1 text-xs text-emerald-900/90"
                    : "mt-4 inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-white/80"
                }
              >
                بزودی در نسخه ۲.۱
              </span>
            </div>
            <div
              className={
                isLightTheme
                  ? "rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-100 via-emerald-200 to-amber-200 p-4"
                  : "rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-slate-900/90 p-4"
              }
            >
              <p
                className={
                  isLightTheme
                    ? "text-sm text-emerald-900/80"
                    : "text-sm text-white/70"
                }
              >
                ثبت‌نام اردو و کلاس
              </p>
              <h3
                className={
                  isLightTheme
                    ? "mt-2 text-lg font-semibold text-emerald-950"
                    : "mt-2 text-lg font-semibold text-white"
                }
              >
                اردوها و کلاس‌های اوقات فراغت
              </h3>
              <p
                className={
                  isLightTheme
                    ? "mt-2 text-sm text-emerald-900/80"
                    : "mt-2 text-sm text-white/70"
                }
              >
                مدیریت ظرفیت، دریافت فرم‌های رضایت والدین و پیگیری وضعیت پرداخت شرکت‌کنندگان.
              </p>
              <span
                className={
                  isLightTheme
                    ? "mt-4 inline-flex w-fit rounded-full bg-emerald-50/90 px-3 py-1 text-xs text-emerald-900/90"
                    : "mt-4 inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-white/80"
                }
              >
                بزودی
              </span>
            </div>
          </div>
        </section>

        <footer
          className={`rounded-3xl border ${
            isLightTheme
              ? 'border-emerald-900/10 text-black shadow-emerald-900/5'
              : 'border-white/20 text-white shadow-black/50'
          } ${layout.footerPadding} text-center font-semibold tracking-wide sm:text-base`}
          style={{ backgroundImage: footerBackground }}
        >
          تقدیم به پیشگاه ولایت مطلقه فقیه، و در انتظار ظهور حضرت بقیة‌الله الاعظم (ارواحنا فداه)
        </footer>
      </div>
      {devotionalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-[#040c0a] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{devotionalModal.title}</h3>
              <button
                onClick={() => setDevotionalModal(null)}
                className="rounded-full border border-white/30 px-3 py-1 text-xs text-white/80"
              >
                بستن
              </button>
            </div>
            <div className="mt-4 max-h-[60vh] overflow-y-auto whitespace-pre-line text-sm leading-7">
              {devotionalModal.content}
            </div>
          </div>
        </div>
      )}
    </div>
  </>
  );
}
