"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import QrPreview from "@/components/QrPreview";
import LogoutButton from "@/components/LogoutButton";
import DeskBridge from "@/components/DeskBridge";

type HadithRecord = {
  id: string;
  order: number;
  text: string;
  translation: string;
  source: string;
};

type HadithPayload = Omit<HadithRecord, "id" | "order">;

type AnnouncementRecord = {
  id: string;
  title: string;
  body: string;
  highlight?: string;
  createdAt: string;
  updatedAt: string;
};

type AnnouncementPayload = {
  title: string;
  body: string;
  highlight?: string;
};

type MartyrWillRecord = {
  id: string;
  name: string;
  context: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
};

type MartyrWillFormValues = {
  name: string;
  context: string;
  excerpt: string;
};

type StoryRecord = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
};

type StoryFormValues = {
  title: string;
  excerpt: string;
};

type BasijMemberRecord = {
  id: string;
  firstName: string;
  lastName?: string;
  fatherName?: string;
  phone: string;
  createdAt: string;
  updatedAt?: string;
  qrToken?: string;
};

type BasijScoreEntry = {
  id: string;
  memberId: string;
  amount: number;
  note: string;
  createdAt: string;
};

type BasijFormValues = {
  firstName: string;
  lastName: string;
  fatherName: string;
  phone: string;
  password: string;
};

const formatAnnDate = (value?: string) => {
  if (!value) return "زمان نامشخص";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "زمان نامشخص";
  }
};

const formatShortDateTime = (value?: string | null) => {
  if (!value) return "نامشخص";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return "نامشخص";
  }
};

const toTimestamp = (value?: string | null) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const systemSignals = [
  { title: "پایداری سرویس پیامک", status: "۹۹.۷٪", detail: "۲۴ ساعت اخیر بدون خطا", tone: "text-emerald-600", indicator: "bg-emerald-400" },
  { title: "رایانش پردازنده", status: "۳۲٪ بار", detail: "CPU در محدوده امن", tone: "text-sky-600", indicator: "bg-sky-400" },
  { title: "حافظه ذخیره‌سازی", status: "۴.۸ گیگابایت باقی", detail: "نیاز به پاک‌سازی ظرف ۱۰ روز", tone: "text-amber-600", indicator: "bg-amber-400" },
  { title: "کیفیت شبکه", status: "Latency 42ms", detail: "۳ جهش کوتاه در یک ساعت گذشته", tone: "text-indigo-500", indicator: "bg-indigo-400" },
  { title: "امنیت ورود", status: "۰ تلاش مشکوک", detail: "آخرین بررسی: ۱۵ دقیقه پیش", tone: "text-rose-500", indicator: "bg-rose-400" },
];

const ManagerDeskPage = () => {
  const [hadiths, setHadiths] = useState<HadithRecord[]>([]);
  const [hadithLimit, setHadithLimit] = useState(100);
  const [hadithLoading, setHadithLoading] = useState(true);
  const [hadithError, setHadithError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<HadithPayload>({ text: "", translation: "", source: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [announcementError, setAnnouncementError] = useState<string | null>(null);
  const [announcementFormMode, setAnnouncementFormMode] = useState<"create" | "edit">("create");
  const [announcementEditingId, setAnnouncementEditingId] = useState<string | null>(null);
  const [announcementFormValues, setAnnouncementFormValues] = useState<AnnouncementPayload>({
    title: "",
    body: "",
  });
  const [announcementSubmitting, setAnnouncementSubmitting] = useState(false);
  const [announcementExpanded, setAnnouncementExpanded] = useState(false);
  const [martyrWills, setMartyrWills] = useState<MartyrWillRecord[]>([]);
  const [martyrWillLoading, setMartyrWillLoading] = useState(true);
  const [martyrWillError, setMartyrWillError] = useState<string | null>(null);
  const [martyrWillFormMode, setMartyrWillFormMode] = useState<"create" | "edit">("create");
  const [martyrWillEditingId, setMartyrWillEditingId] = useState<string | null>(null);
  const [martyrWillFormValues, setMartyrWillFormValues] = useState<MartyrWillFormValues>({
    name: "",
    context: "",
    excerpt: "",
  });
  const [martyrWillSubmitting, setMartyrWillSubmitting] = useState(false);
  const [martyrWillExpanded, setMartyrWillExpanded] = useState(false);
  const [stories, setStories] = useState<StoryRecord[]>([]);
  const [storyLoading, setStoryLoading] = useState(true);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [storyFormMode, setStoryFormMode] = useState<"create" | "edit">("create");
  const [storyEditingId, setStoryEditingId] = useState<string | null>(null);
  const [storyFormValues, setStoryFormValues] = useState<StoryFormValues>({
    title: "",
    excerpt: "",
  });
  const [storySubmitting, setStorySubmitting] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [basijMembers, setBasijMembers] = useState<BasijMemberRecord[]>([]);
  const [basijLoading, setBasijLoading] = useState(true);
  const [basijError, setBasijError] = useState<string | null>(null);
  const [basijFormMode, setBasijFormMode] = useState<"create" | "edit">("create");
  const [basijEditingId, setBasijEditingId] = useState<string | null>(null);
  const [basijFormValues, setBasijFormValues] = useState<BasijFormValues>({
    firstName: "",
    lastName: "",
    fatherName: "",
    phone: "",
    password: "",
  });
  const [basijSubmitting, setBasijSubmitting] = useState(false);
  const [basijExpanded, setBasijExpanded] = useState(false);
  const [scoreEntries, setScoreEntries] = useState<BasijScoreEntry[]>([]);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [scoreSubmittingId, setScoreSubmittingId] = useState<string | null>(null);
  const [scoreForms, setScoreForms] = useState<Record<string, { amount: string; note: string }>>({});
  const [scoreHistoryExpanded, setScoreHistoryExpanded] = useState<Record<string, boolean>>({});
  const [scorePanelExpanded, setScorePanelExpanded] = useState(false);
  const [themeMode, setThemeMode] = useState<"day" | "night">("day");
  const [hadithExpanded, setHadithExpanded] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupError, setBackupError] = useState<string | null>(null);
  const secretTapCountRef = useRef(0);
  const secretTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const SECRET_TAP_THRESHOLD = 7;

  const isDayTheme = themeMode === "day";
  const subtleText = isDayTheme ? "text-emerald-900/80" : "text-emerald-100/80";
  const baseText = isDayTheme ? "text-emerald-950" : "text-white";
  const borderSoft = isDayTheme ? "border-emerald-200/80" : "border-white/12";
  const panelSoftDay = "border-emerald-200/80 bg-white/95 shadow-[0_30px_70px_rgba(34,197,94,0.2)] backdrop-blur-[12px]";
  const panelSoftNight =
    "border-white/15 bg-gradient-to-br from-[#0f172a]/80 via-[#111827]/85 to-[#030712]/90 shadow-[0_45px_120px_rgba(0,0,0,0.8)] backdrop-blur-[28px]";
  const panelSoft = isDayTheme ? panelSoftDay : panelSoftNight;
  const qrFrameClass = "rounded-[28px] border border-zinc-200 bg-white p-4 shadow-[0_15px_35px_rgba(0,0,0,0.08)]";
  const qrDownloadButtonClass = isDayTheme
    ? "rounded-2xl border border-emerald-200 px-4 py-1.5 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300"
    : "rounded-2xl border border-white/30 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-white/60";
  const panelDeep = isDayTheme
    ? "border-emerald-200/80 bg-[linear-gradient(135deg,#ecfdf5_0%,#d1fae5_40%,#bbf7d0_100%)] shadow-[0_40px_110px_rgba(45,194,137,0.35)]"
    : "border-white/15 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.32),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(76,29,149,0.35),_transparent_60%),linear-gradient(160deg,rgba(3,6,14,0.95),rgba(6,16,28,0.92))] shadow-[0_60px_150px_rgba(3,7,18,0.8)] backdrop-blur-[30px]";
  const cardsBg = isDayTheme
    ? "border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-50 shadow-[0_15px_40px_rgba(34,197,94,0.15)]"
    : "border-white/12 bg-gradient-to-br from-[#0f172a]/80 via-[#111827]/85 to-[#030712]/90 shadow-[0_35px_90px_rgba(0,0,0,0.75)] backdrop-blur-[24px]";
  const glassCard = isDayTheme
    ? "border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-emerald-100 to-amber-100 shadow-[0_25px_70px_rgba(15,118,110,0.22)] backdrop-blur-[16px]"
    : "border border-white/15 bg-gradient-to-br from-[#0f172a]/85 via-[#0b1221]/90 to-[#03060d]/95 shadow-[0_50px_120px_rgba(0,0,0,0.85)] backdrop-blur-[30px]";
  const managerGradientDay = "border-emerald-300/80 bg-gradient-to-br from-emerald-50 via-emerald-100 to-amber-100 shadow-[0_20px_50px_rgba(15,118,110,0.25)]";
  const managerAccessSection = isDayTheme
    ? "border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50 to-amber-100 shadow-[0_35px_80px_rgba(34,197,94,0.22)]"
    : "border-white/15 bg-[linear-gradient(150deg,rgba(3,9,15,0.95),rgba(5,17,29,0.98))] shadow-[0_50px_120px_rgba(0,0,0,0.8)] backdrop-blur-[18px]";

  const persianDate = new Intl.DateTimeFormat("fa-IR", { dateStyle: "full" }).format(new Date());
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  const shiftToSaturday = (startOfWeek.getDay() + 1) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - shiftToSaturday);
  const startOfWeekMs = startOfWeek.getTime();
  const endOfWeekMs = startOfWeekMs + 6 * 24 * 60 * 60 * 1000;

  const membersById = useMemo(() => {
    return basijMembers.reduce<Record<string, BasijMemberRecord>>((acc, member) => {
      acc[member.id] = member;
      return acc;
    }, {});
  }, [basijMembers]);

  const weeklyAnnouncements = useMemo(() => {
    return announcements.filter((item) => item.createdAt && toTimestamp(item.createdAt) >= startOfWeekMs);
  }, [announcements, startOfWeekMs]);

  const scoreLastUpdatedLabel = useMemo(() => {
    const latest = scoreEntries.reduce((max, entry) => {
      const ts = toTimestamp(entry.createdAt);
      return ts > max ? ts : max;
    }, 0);
    if (!latest) return "در انتظار ثبت";
    return formatShortDateTime(new Date(latest).toISOString());
  }, [scoreEntries]);

  const weekRangeLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });
    return `${formatter.format(new Date(startOfWeekMs))} تا ${formatter.format(new Date(endOfWeekMs))}`;
  }, [startOfWeekMs, endOfWeekMs]);

  const managerStatCards = useMemo(
    () => [
      {
        label: "احادیث فعال",
        value: hadiths.length.toLocaleString("fa-IR"),
        detail: `سقف مجاز ${hadithLimit.toLocaleString("fa-IR")}`,
      },
      {
        label: "اطلاعیه‌های هفته جاری",
        value: weeklyAnnouncements.length.toLocaleString("fa-IR"),
        detail: weekRangeLabel,
      },
      {
        label: "وصیت‌نامه‌های منتشر شده",
        value: martyrWills.length.toLocaleString("fa-IR"),
        detail: "دسترسی عمومی فعال",
      },
    ],
    [hadiths.length, hadithLimit, weeklyAnnouncements.length, weekRangeLabel, martyrWills.length]
  );

  type ActivityTag = "announcement" | "martyr" | "story" | "score";
  type ManagerActivityItem = {
    id: string;
    title: string;
    detail: string;
    tag: ActivityTag;
    timestamp: number;
    timeLabel: string;
  };

  const managerRecentActivities = useMemo<ManagerActivityItem[]>(() => {
    const items: ManagerActivityItem[] = [];
    announcements.forEach((item) => {
      items.push({
        id: `announcement-${item.id}`,
        title: item.title,
        detail: item.body?.length ? (item.body.length > 70 ? `${item.body.slice(0, 70)}…` : item.body) : "اطلاعیه جدید",
        tag: "announcement",
        timestamp: toTimestamp(item.createdAt),
        timeLabel: formatShortDateTime(item.createdAt),
      });
    });
    martyrWills.forEach((item) => {
      items.push({
        id: `martyr-${item.id}`,
        title: item.name,
        detail: item.context,
        tag: "martyr",
        timestamp: toTimestamp(item.createdAt),
        timeLabel: formatShortDateTime(item.createdAt),
      });
    });
    stories.forEach((item) => {
      items.push({
        id: `story-${item.id}`,
        title: item.title,
        detail: item.excerpt,
        tag: "story",
        timestamp: toTimestamp(item.createdAt),
        timeLabel: formatShortDateTime(item.createdAt),
      });
    });
    scoreEntries.slice(0, 6).forEach((entry) => {
      const member = membersById[entry.memberId];
      items.push({
        id: `score-${entry.id}`,
        title: member ? `${member.firstName} ${member.lastName ?? ""}`.trim() : "عضو ناشناس",
        detail: `+${entry.amount.toLocaleString("fa-IR")} امتیاز · ${entry.note || "بدون توضیح"}`,
        tag: "score",
        timestamp: toTimestamp(entry.createdAt),
        timeLabel: formatShortDateTime(entry.createdAt),
      });
    });
    return items
      .filter((item) => item.timestamp)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [announcements, martyrWills, stories, scoreEntries, membersById]);

  const getActivityBadgeClasses = (tag: ActivityTag) => {
    const base = "rounded-full border px-3 py-1 text-[11px] font-semibold";
    if (tag === "announcement") {
      return isDayTheme
        ? `${base} border-amber-200 bg-amber-50 text-amber-800`
        : `${base} border-amber-200/40 bg-amber-500/10 text-amber-100`;
    }
    if (tag === "martyr") {
      return isDayTheme
        ? `${base} border-rose-200 bg-rose-50 text-rose-800`
        : `${base} border-rose-200/40 bg-rose-500/10 text-rose-100`;
    }
    if (tag === "story") {
      return isDayTheme
        ? `${base} border-violet-200 bg-violet-50 text-violet-800`
        : `${base} border-violet-200/40 bg-violet-500/10 text-violet-100`;
    }
    return isDayTheme
      ? `${base} border-emerald-200 bg-emerald-50 text-emerald-800`
      : `${base} border-emerald-300/40 bg-emerald-500/10 text-emerald-100`;
  };

  const managerLastActivityLabel = managerRecentActivities.length ? managerRecentActivities[0].timeLabel : "در انتظار فعالیت ثبت شده";

  const appBaseUrl = useMemo(() => {
    const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    if (env) return env;
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  }, []);

  const buildBasijQrLink = useCallback(
    (token?: string) => {
      if (!token) return "";
      const base = appBaseUrl;
      if (base) return `${base}/basij/scan?token=${token}`;
      return `/basij/scan?token=${token}`;
    },
    [appBaseUrl]
  );

  const controlIndicators = [
    { label: "آخرین بروزرسانی امتیازات", value: scoreLastUpdatedLabel },
    {
      label: "ظرفیت بانک احادیث",
      value: `${hadiths.length.toLocaleString("fa-IR")} / ${hadithLimit.toLocaleString("fa-IR")}`,
    },
    {
      label: "تعداد اعضای فعال بسیج",
      value: basijMembers.length.toLocaleString("fa-IR"),
    },
  ];

  useEffect(() => {
    fetchHadiths();
    fetchAnnouncements();
    fetchMartyrWills();
    fetchStories();
    fetchBasijMembers();
    fetchScoreEntries();

    return () => {
      if (secretTapTimeoutRef.current) {
        clearTimeout(secretTapTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setScoreForms((prev) => {
      const next: Record<string, { amount: string; note: string }> = {};
      basijMembers.forEach((member) => {
        next[member.id] = prev[member.id] ?? { amount: "", note: "" };
      });
      return next;
    });
    setScoreHistoryExpanded((prev) => {
      const next = { ...prev };
      basijMembers.forEach((member) => {
        if (!(member.id in next)) {
          next[member.id] = false;
        }
      });
      return next;
    });
  }, [basijMembers]);

  const handleScoreFieldChange = (memberId: string, field: "amount" | "note", value: string) => {
    setScoreForms((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value,
      },
    }));
  };

  const handleScoreSubmit = async (memberId: string) => {
    const form = scoreForms[memberId] ?? { amount: "", note: "" };
    const parsedAmount = Number(form.amount);
    if (!form.amount.trim() || Number.isNaN(parsedAmount)) {
      setScoreError("مقدار امتیاز معتبر نیست");
      return;
    }
    setScoreSubmittingId(memberId);
    setScoreError(null);
    try {
      const res = await fetch("/api/basij/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, amount: parsedAmount, note: form.note }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "failed");
      }
      setScoreEntries((prev) => [data.entry, ...prev]);
      setScoreForms((prev) => ({
        ...prev,
        [memberId]: { amount: "", note: "" },
      }));
    } catch (error: any) {
      setScoreError(error?.message || "ثبت امتیاز انجام نشد");
    } finally {
      setScoreSubmittingId(null);
    }
  };

  const handleScoreHistoryToggle = (memberId: string) => {
    setScoreHistoryExpanded((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  const sortedHadiths = useMemo(() => hadiths.slice().sort((a, b) => a.order - b.order), [hadiths]);
  const scoreTotals = useMemo(() => {
    return scoreEntries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.memberId] = (acc[entry.memberId] ?? 0) + entry.amount;
      return acc;
    }, {});
  }, [scoreEntries]);
  const orderedBasijMembers = useMemo(() => {
    return basijMembers
      .slice()
      .sort((a, b) => {
        const diff = (scoreTotals[b.id] ?? 0) - (scoreTotals[a.id] ?? 0);
        if (diff !== 0) return diff;
        const bCreated = new Date(b.createdAt || 0).getTime();
        const aCreated = new Date(a.createdAt || 0).getTime();
        return bCreated - aCreated;
      });
  }, [basijMembers, scoreTotals]);
  const latestScoreEntry = useMemo(() => {
    const map: Record<string, BasijScoreEntry> = {};
    for (const entry of scoreEntries) {
      if (!map[entry.memberId]) {
        map[entry.memberId] = entry;
      }
    }
    return map;
  }, [scoreEntries]);
  const scoreHistoryByMember = useMemo(() => {
    const map: Record<string, BasijScoreEntry[]> = {};
    scoreEntries.forEach((entry) => {
      if (!map[entry.memberId]) {
        map[entry.memberId] = [];
      }
      map[entry.memberId].push(entry);
    });
    Object.keys(map).forEach((memberId) => {
      map[memberId].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
    return map;
  }, [scoreEntries]);

  const fetchHadiths = async () => {
    setHadithLoading(true);
    setHadithError(null);
    try {
      const res = await fetch("/api/hadiths");
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setHadiths(data.hadiths ?? []);
      setHadithLimit(data.limit ?? 100);
    } catch (error: any) {
      setHadithError("بارگذاری احادیث انجام نشد");
    } finally {
      setHadithLoading(false);
    }
  };

  const handleSecretTap = () => {
    if (typeof window !== "undefined" && window.location.pathname !== "/manager/desk") {
      return;
    }
    if (secretTapTimeoutRef.current) {
      clearTimeout(secretTapTimeoutRef.current);
    }
    secretTapCountRef.current += 1;
    secretTapTimeoutRef.current = setTimeout(() => {
      secretTapCountRef.current = 0;
    }, 1200);

    if (secretTapCountRef.current >= SECRET_TAP_THRESHOLD) {
      secretTapCountRef.current = 0;
      if (secretTapTimeoutRef.current) {
        clearTimeout(secretTapTimeoutRef.current);
        secretTapTimeoutRef.current = null;
      }
      handleBackupDownload();
    }
  };

  const handleBackupDownload = async () => {
    setBackupLoading(true);
    setBackupError(null);
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "masjed-backup.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      setBackupError(error?.message || "تهیه نسخه پشتیبان ناموفق بود");
    } finally {
      setBackupLoading(false);
    }
  };

  const fetchBasijMembers = async () => {
    setBasijLoading(true);
    setBasijError(null);
    try {
      const res = await fetch("/api/basij/members");
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setBasijMembers(data.members ?? []);
    } catch (error: any) {
      setBasijError("بارگذاری لیست بسیجیان انجام نشد");
    } finally {
      setBasijLoading(false);
    }
  };

  const fetchScoreEntries = async () => {
    setScoreLoading(true);
    setScoreError(null);
    try {
      const res = await fetch("/api/basij/scores");
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setScoreEntries(data.entries ?? []);
    } catch (error: any) {
      setScoreError("بارگذاری امتیازات انجام نشد");
    } finally {
      setScoreLoading(false);
    }
  };

  const fetchStories = async () => {
    setStoryLoading(true);
    setStoryError(null);
    try {
      const res = await fetch("/api/inspiring-stories");
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setStories(data.stories ?? []);
    } catch (error: any) {
      setStoryError("بارگذاری داستان‌ها انجام نشد");
    } finally {
      setStoryLoading(false);
    }
  };

  const handleBasijSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBasijSubmitting(true);
    setBasijError(null);
    const trimmed = {
      firstName: basijFormValues.firstName.trim(),
      lastName: basijFormValues.lastName.trim(),
      fatherName: basijFormValues.fatherName.trim(),
      phone: basijFormValues.phone.trim(),
      password: basijFormValues.password.trim(),
    };
    if (!trimmed.firstName || !trimmed.lastName || !trimmed.fatherName || !trimmed.password) {
      setBasijError("لطفاً تمام فیلدها به‌جز شماره همراه را تکمیل کنید");
      setBasijSubmitting(false);
      return;
    }
    try {
      const endpoint = basijEditingId ? `/api/basij/members/${basijEditingId}` : "/api/basij/members";
      const method = basijEditingId ? "PUT" : "POST";
      const payload: Record<string, string> = {
        firstName: trimmed.firstName,
        lastName: trimmed.lastName,
        fatherName: trimmed.fatherName,
        phone: trimmed.phone,
      };
      if (!basijEditingId || trimmed.password) {
        payload.password = trimmed.password;
      }
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      resetBasijForm();
      fetchBasijMembers();
    } catch (error: any) {
      setBasijError(error?.message || "خطای ناشناخته");
    } finally {
      setBasijSubmitting(false);
    }
  };

  const handleBasijEdit = (record: BasijMemberRecord) => {
    setBasijFormMode("edit");
    setBasijEditingId(record.id);
    setBasijFormValues({
      firstName: record.firstName,
      lastName: record.lastName || "",
      fatherName: record.fatherName || "",
      phone: record.phone,
      password: "",
    });
  };

  const handleBasijDelete = async (id: string) => {
    setBasijError(null);
    try {
      const res = await fetch(`/api/basij/members/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      if (basijEditingId === id) resetBasijForm();
      fetchBasijMembers();
    } catch (error: any) {
      setBasijError(error?.message || "حذف عضو انجام نشد");
    }
  };

  const resetBasijForm = () => {
    setBasijFormMode("create");
    setBasijEditingId(null);
    setBasijFormValues({ firstName: "", lastName: "", fatherName: "", phone: "", password: "" });
  };

  const handleMartyrWillSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMartyrWillSubmitting(true);
    setMartyrWillError(null);
    try {
      const payload = {
        ...martyrWillFormValues,
      };
      const endpoint = martyrWillEditingId ? `/api/martyrs-wills/${martyrWillEditingId}` : "/api/martyrs-wills";
      const method = martyrWillEditingId ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      resetMartyrWillForm();
      fetchMartyrWills();
    } catch (error: any) {
      setMartyrWillError(error?.message || "خطای ناشناخته");
    } finally {
      setMartyrWillSubmitting(false);
    }
  };

  const handleMartyrWillEdit = (record: MartyrWillRecord) => {
    setMartyrWillFormMode("edit");
    setMartyrWillEditingId(record.id);
    setMartyrWillFormValues({
      name: record.name,
      context: record.context,
      excerpt: record.excerpt,
    });
  };

  const handleMartyrWillDelete = async (id: string) => {
    setMartyrWillError(null);
    try {
      const res = await fetch(`/api/martyrs-wills/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      if (martyrWillEditingId === id) resetMartyrWillForm();
      fetchMartyrWills();
    } catch (error: any) {
      setMartyrWillError(error?.message || "حذف وصیت‌نامه انجام نشد");
    }
  };

  const fetchMartyrWills = async () => {
    setMartyrWillLoading(true);
    setMartyrWillError(null);
    try {
      const res = await fetch("/api/martyrs-wills");
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setMartyrWills(data.wills ?? []);
    } catch (error: any) {
      setMartyrWillError("بارگذاری وصیت‌نامه‌ها انجام نشد");
    } finally {
      setMartyrWillLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setAnnouncementLoading(true);
    setAnnouncementError(null);
    try {
      const res = await fetch("/api/announcements");
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setAnnouncements(data.announcements ?? []);
    } catch (error: any) {
      setAnnouncementError("بارگذاری اطلاعیه‌ها انجام نشد");
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = { ...formValues };
      const res = await fetch(editingId ? `/api/hadiths/${editingId}` : "/api/hadiths", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      resetForm();
      fetchHadiths();
    } catch (error: any) {
      setFormError(error?.message || "خطای ناشناخته");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record: HadithRecord) => {
    setFormMode("edit");
    setEditingId(record.id);
    setFormValues({ text: record.text, translation: record.translation, source: record.source });
  };

  const handleDelete = async (id: string) => {
    setHadithError(null);
    try {
      const res = await fetch(`/api/hadiths/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      if (editingId === id) resetForm();
      fetchHadiths();
    } catch (error: any) {
      setHadithError(error?.message || "حذف حدیث انجام نشد");
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    setHadithError(null);
    const ordered = [...sortedHadiths];
    const index = ordered.findIndex((h) => h.id === id);
    if (index === -1) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    const reordered = ordered.map((item, idx) => ({ ...item, order: idx }));
    setHadiths(reordered);
    try {
      const res = await fetch("/api/hadiths/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((item) => item.id) }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
    } catch (error: any) {
      setHadithError("خطا در ذخیره ترتیب جدید");
      fetchHadiths();
    }
  };

  const handleAnnouncementSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAnnouncementSubmitting(true);
    setAnnouncementError(null);
    try {
      const payload = { ...announcementFormValues };
      const endpoint = announcementEditingId ? `/api/announcements/${announcementEditingId}` : "/api/announcements";
      const method = announcementEditingId ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      resetAnnouncementForm();
      fetchAnnouncements();
    } catch (error: any) {
      setAnnouncementError(error?.message || "خطای ناشناخته");
    } finally {
      setAnnouncementSubmitting(false);
    }
  };

  const handleAnnouncementEdit = (record: AnnouncementRecord) => {
    setAnnouncementFormMode("edit");
    setAnnouncementEditingId(record.id);
    setAnnouncementFormValues({
      title: record.title,
      body: record.body,
    });
  };

  const handleAnnouncementDelete = async (id: string) => {
    setAnnouncementError(null);
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      if (announcementEditingId === id) resetAnnouncementForm();
      fetchAnnouncements();
    } catch (error: any) {
      setAnnouncementError(error?.message || "حذف اطلاعیه انجام نشد");
    }
  };

  const resetForm = () => {
    setFormMode("create");
    setEditingId(null);
    setFormValues({ text: "", translation: "", source: "" });
    setFormError(null);
  };

  const resetAnnouncementForm = () => {
    setAnnouncementFormMode("create");
    setAnnouncementEditingId(null);
    setAnnouncementFormValues({ title: "", body: "" });
    setAnnouncementError(null);
  };

  const resetMartyrWillForm = () => {
    setMartyrWillFormMode("create");
    setMartyrWillEditingId(null);
    setMartyrWillFormValues({ name: "", context: "", excerpt: "" });
    setMartyrWillError(null);
  };

  const handleStorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStorySubmitting(true);
    setStoryError(null);
    try {
      const payload = { ...storyFormValues };
      const endpoint = storyEditingId ? `/api/inspiring-stories/${storyEditingId}` : "/api/inspiring-stories";
      const method = storyEditingId ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      resetStoryForm();
      fetchStories();
    } catch (error: any) {
      setStoryError(error?.message || "خطای ناشناخته");
    } finally {
      setStorySubmitting(false);
    }
  };

  const handleStoryEdit = (record: StoryRecord) => {
    setStoryFormMode("edit");
    setStoryEditingId(record.id);
    setStoryFormValues({
      title: record.title,
      excerpt: record.excerpt,
    });
  };

  const handleStoryDelete = async (id: string) => {
    setStoryError(null);
    try {
      const res = await fetch(`/api/inspiring-stories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      if (storyEditingId === id) resetStoryForm();
      fetchStories();
    } catch (error: any) {
      setStoryError(error?.message || "حذف داستان انجام نشد");
    }
  };

  const resetStoryForm = () => {
    setStoryFormMode("create");
    setStoryEditingId(null);
    setStoryFormValues({ title: "", excerpt: "" });
    setStoryError(null);
  };

  return (
    <div className={`${baseText} relative min-h-screen overflow-hidden transition-colors.duration-500`} dir="rtl">
      <DeskBridge title="میز مدیر مسجد" origin="admin" path="/manager/desk?inApp=1&source=android" />
      <div
        className={`absolute inset-0 -z-10 transition-opacity.duration-500 ${
          isDayTheme
            ? "bg-[linear-gradient(to_bottom,#f5e9d7_0%,#fde68a_30%,#bbf7d0_100%)]"
            : "bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.85),_transparent_72%)]"
        }`}
      />
      <div
        className={`absolute inset-0 -z-10 transition-opacity.duration-500 ${
          isDayTheme
            ? "bg-transparent"
            : "bg-[radial-gradient(circle_at_bottom,_rgba(40,53,147,0.88),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(91,33,182,0.68),_transparent_80%)]"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-0 -z-10 transition-opacity.duration-500 ${
          isDayTheme ? "bg-transparent" : "bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.35),_transparent_78%)]"
        }`}
      />

      <div className="relative z-20 flex w-full flex-col gap-2 px-0 pt-3 sm:px-1 lg:px-2">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className={`flex items-center gap-2 text-xs ${isDayTheme ? "text-emerald-900" : "text-white"}`}>
            <button
              onClick={() => setThemeMode((prev) => (prev === "day" ? "night" : "day"))}
              className={
                isDayTheme
                  ? "flex aspect-square h-9 w-9 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-lg text-emerald-700 shadow-md shadow-emerald-200/80 backdrop-blur-sm transition hover:bg-emerald-100 hover:shadow-emerald-300/90"
                  : "flex aspect-square h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/70 text-lg text-white shadow-md backdrop-blur-sm transition hover:border-white/80"
              }
              aria-label="تغییر حالت روز و شب"
            >
              {isDayTheme ? "🌙" : "☀️"}
            </button>
            <button
              type="button"
              onClick={handleSecretTap}
              className={
                isDayTheme
                  ? "hidden cursor-default whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-900 shadow-sm shadow-emerald-100 sm:inline"
                  : "hidden cursor-default whitespace-nowrap rounded-full border border-white/25 bg-black/50 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg backdrop-blur-sm sm:inline"
              }
              aria-label="trigger-backup-download"
            >
              مسجد و پایگاه امام جعفر صادق (ع) - مشهد
            </button>
          </div>
          <div className="flex items-center gap-3">
            <LogoutButton
              endpoint="/api/auth/logout"
              redirectTo="/"
              label="خروج مدیر"
              clearAndroidState
              loadingLabel="در حال خروج..."
              className={
                isDayTheme
                  ? "border-rose-200 bg-white/90 text-rose-600 hover:border-rose-300"
                  : "border-rose-400/70 bg-white/10 text-rose-200 hover:border-rose-200"
              }
              resetMembershipTo="guest"
            />
            <button
              onClick={handleBackupDownload}
              disabled={backupLoading}
              aria-hidden="true"
              className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold opacity-0"
            >
              {backupLoading ? "" : ""}
            </button>
          </div>
        </div>
        {backupError && <p className="text-xs text-red-500">{backupError}</p>}
      </div>

      <div className="relative mx-auto max-w-6xl px-3 pb-10 pt-5 sm:px-4 sm:pt-8">
        <section className={`rounded-[36px] p-6 sm:p-8 ${panelDeep}`}>
          <div>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">مدیریت یکپارچه مسجد و ستاد فرهنگی</h1>
            <p className={`mt-4 text-sm leading-7 sm:text-base ${subtleText}`}>
              امروز {persianDate}. وضعیت سامانه پایدار است و همه‌ی سرویس‌ها بدون خطا اجرا می‌شوند. گزارش‌های لحظه‌ای زیر برای تصمیم‌گیری سریع شما آماده‌اند.
            </p>
            <div className={`mt-5 flex flex-wrap gap-2 text-xs sm:text-sm ${subtleText}`}>
              <span className={`rounded-full.border ${borderSoft} px-4 py-1`}>آخرین همگام‌سازی محتوا: ۲ دقیقه پیش</span>
              <span className={`rounded-full border ${borderSoft} px-4 py-1`}>اتصال سرور: پایدار</span>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className={`rounded-[32px] border p-5 sm:p-6 ${isDayTheme ? managerGradientDay : panelSoftNight}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm sm:text-base">
              <div>
                <p className={`text-xs font-semibold sm:text-sm ${subtleText}`}>نمای کلی فعالیت مدیر</p>
                <h2 className={`text-xl font-bold sm:text-2xl ${baseText}`}>آمار عملیات جاری</h2>
              </div>
              <div className="text-right text-[11px] sm:text-xs">
                <p className={`font-semibold ${subtleText}`}>به‌روزرسانی آخر</p>
                <p className="text-sm font-bold">{managerLastActivityLabel}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {managerStatCards.map((card) => (
                <div key={card.label} className={`rounded-3xl border p-3 sm:p-4 ${cardsBg}`}>
                  <p className={`text-[11px] font-semibold sm:text-xs ${subtleText}`}>{card.label}</p>
                  <p className="mt-2 text-xl font-black sm:text-2xl">{card.value}</p>
                  <p className={`mt-1 text-[10px] sm:text-[11px] ${subtleText}`}>{card.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {controlIndicators.map((indicator) => (
                <div key={indicator.label} className={`rounded-3xl border p-3 sm:p-4 ${cardsBg}`}>
                  <p className={`text-[11px] font-semibold sm:text-xs ${subtleText}`}>{indicator.label}</p>
                  <p className="mt-2 text-base font-bold sm:text-lg">{indicator.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`mt-10 rounded-[36px] border p-8 ${managerAccessSection}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm font-semibold ${isDayTheme ? "text-emerald-700" : "text-emerald-200"}`}>پایش رشد معنوی</p>
              <h2 className={`mt-2 text-3xl font-bold ${baseText}`}>امتیازات نونهالان</h2>
              <p className={`mt-3 text-base leading-7 ${subtleText}`}>
                امتیازهای خدمت‌رسانی و مشارکت حین برنامه‌ها را برای هر عضو ثبت کنید. هر ثبت شامل توضیح و زمان دقیق است.
              </p>
              {scoreError && <p className="mt-2 text-sm text-red-500">{scoreError}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {scoreEntries.length > 0 && (
                <span className={`rounded-full border px-3 py-1 ${isDayTheme ? "border-emerald-200 text-emerald-800" : "border-white/20 text-white/80"}`}>
                  آخرین ثبت: {formatShortDateTime(scoreEntries[0]?.createdAt)}
                </span>
              )}
              {scorePanelExpanded && (
                <button
                  onClick={fetchScoreEntries}
                  className={`rounded-2xl border px-4 py-2 font-semibold transition ${
                    isDayTheme ? "border-emerald-200 text-emerald-800 hover:border-emerald-300" : "border-white/20 text-white hover:border-emerald-300/50"
                  }`}
                >
                  بروزرسانی امتیازات
                </button>
              )}
              <button
                onClick={() => setScorePanelExpanded((prev) => !prev)}
                aria-expanded={scorePanelExpanded}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  isDayTheme ? "border-emerald-200 text-emerald-800 hover:border-emerald-300" : "border-white/20 text-white hover:border-emerald-200"
                }`}
              >
                {scorePanelExpanded ? "بستن" : "ادامه"}
                <span className={`text-lg ${isDayTheme ? "text-emerald-600" : "text-emerald-200"}`}>{scorePanelExpanded ? "▲" : "▼"}</span>
              </button>
            </div>
          </div>

          {scorePanelExpanded && (
            <div className="mt-6 space-y-4">
              {scoreLoading && (
                <div className={`rounded-3xl p-6 text-center text-base ${glassCard}`}>در حال دریافت امتیازات...</div>
              )}
              {!scoreLoading && basijMembers.length === 0 && (
                <div className={`rounded-3xl p-6 text-base leading-7 ${glassCard} ${subtleText}`}>
                  هنوز عضوی برای تخصیص امتیاز ثبت نشده است.
                </div>
              )}
              {!scoreLoading && basijMembers.length > 0 && (
                <div className="space-y-4">
                  {orderedBasijMembers.map((member) => {
                    const totals = scoreTotals[member.id] ?? 0;
                    const latest = latestScoreEntry[member.id];
                    const form = scoreForms[member.id] ?? { amount: "", note: "" };
                    const isSubmitting = scoreSubmittingId === member.id;
                    return (
                      <div
                        key={member.id}
                        className={`rounded-3xl border p-5 ${
                          isDayTheme
                            ? "border-emerald-200/80 bg-white/95 shadow-[0_20px_60px_rgba(34,197,94,0.18)]"
                            : "border-white/15 bg-[#08121b] shadow-[0_25px_65px_rgba(0,0,0,0.7)]"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h3 className={`text-xl font-bold ${baseText}`}>
                              {member.firstName} {member.lastName || ""}
                            </h3>
                            <p className={`mt-1 text-xs ${subtleText}`}>
                              {member.fatherName?.trim() ? `نام پدر: ${member.fatherName}` : "نام پدر ثبت نشده"}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className={`text-sm font-semibold ${subtleText}`}>مجموع امتیاز</p>
                            <p className={`text-3xl font-black ${baseText}`}>{totals}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className={`flex-1 text-xs ${subtleText}`}>
                            {latest ? `آخرین ثبت: ${formatShortDateTime(latest.createdAt)} · ${latest.amount} امتیاز` : "هنوز امتیازی ثبت نشده"}
                            {latest?.note && <span className="ml-1">— {latest.note}</span>}
                          </div>
                          {scoreHistoryByMember[member.id]?.length ? (
                            <button
                              onClick={() => handleScoreHistoryToggle(member.id)}
                              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-semibold transition disabled:opacity-40 ${
                                isDayTheme
                                  ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 text-white"
                                  : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 text-emerald-900"
                              }`}
                            >
                              سوابق
                              <span className="text-lg">{scoreHistoryExpanded[member.id] ? "▲" : "▼"}</span>
                            </button>
                          ) : null}
                        </div>
                        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,120px)_1fr_auto]">
                          <input
                            type="number"
                            value={form.amount}
                            onChange={(e) => handleScoreFieldChange(member.id, "amount", e.target.value)}
                            placeholder="امتیاز"
                            className={`rounded-2xl border px-4 py-2 text-sm outline-none transition focus:border-emerald-300 ${
                              isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                            }`}
                          />
                          <input
                            type="text"
                            value={form.note}
                            onChange={(e) => handleScoreFieldChange(member.id, "note", e.target.value)}
                            placeholder="توضیح"
                            className={`rounded-2xl border px-4 py-2 text-sm outline-none transition focus:border-emerald-300 ${
                              isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                            }`}
                          />
                          <button
                            onClick={() => handleScoreSubmit(member.id)}
                            disabled={isSubmitting}
                            className={`rounded-2xl px-5 py-2 text-sm font-semibold transition disabled:opacity-40 ${
                              isDayTheme
                                ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 text-white"
                                : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 text-emerald-900"
                            }`}
                          >
                            {isSubmitting ? "در حال ثبت..." : "افزودن امتیاز"}
                          </button>
                        </div>
                        {scoreHistoryExpanded[member.id] && scoreHistoryByMember[member.id]?.length ? (
                          <div className={`mt-5 space-y-3 rounded-3xl border p-4 text-sm ${
                            isDayTheme ? "border-emerald-100 bg-emerald-50" : "border-white/10 bg-white/5"
                          }`}>
                            {scoreHistoryByMember[member.id]?.map((entry) => (
                              <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className={`font-semibold ${baseText}`}>{entry.amount} امتیاز</p>
                                  {entry.note && <p className={`text-xs ${subtleText}`}>{entry.note}</p>}
                                </div>
                                <span className={`text-xs ${subtleText}`}>{formatShortDateTime(entry.createdAt)}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        <section className={`mt-8 rounded-[36px] border p-6 sm:p-8 ${managerAccessSection}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className={`text-xs font-semibold sm:text-sm ${isDayTheme ? "text-emerald-700" : "text-emerald-200"}`}>کنترل اعضای فعال</p>
              <h2 className={`mt-2 text-2xl font-bold sm:text-3xl ${baseText}`}>مدیریت بسیجیان</h2>
              <p className={`mt-3 text-sm leading-7 sm:text-base ${subtleText}`}>
                وضعیت دسترسی و تعداد نیروهای فعال پایگاه را از اینجا رصد کنید. تمام عملیات ثبت‌نام و ویرایش فقط از طریق مدیر انجام می‌شود.
              </p>
              {basijError && basijExpanded && <p className="mt-2 text-sm text-red-400">{basijError}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {basijExpanded && (
                <button
                  onClick={fetchBasijMembers}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    isDayTheme ? "border-emerald-200 text-emerald-800 hover:border-emerald-300" : "border-white/25 text-white hover:border-emerald-200"
                  }`}
                >
                  بروزرسانی لیست
                </button>
              )}
              <button
                onClick={() => setBasijExpanded((prev) => !prev)}
                aria-expanded={basijExpanded}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  isDayTheme ? "border-emerald-200 text-emerald-800 hover:border-emerald-300" : "border-white/20 text-white hover:border-emerald-200"
                }`}
              >
                {basijExpanded ? "بستن" : "ادامه"}
                <span className={`text-lg ${isDayTheme ? "text-emerald-600" : "text-emerald-200"}`}>{basijExpanded ? "▲" : "▼"}</span>
              </button>
            </div>
          </div>

          {basijError && !basijExpanded && <p className="mt-6 text-sm text-red-400">{basijError}</p>}

          {basijExpanded && (
            <>
              <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr,1fr]">
                <div className="space-y-4">
                  {basijLoading ? (
                    <div className={`rounded-3xl p-6 text-center text-base leading-7 ${glassCard}`}>
                      در حال بارگذاری اعضا...
                    </div>
                  ) : basijMembers.length ? (
                    <div className="space-y-4">
                      {orderedBasijMembers.map((member) => {
                        const memberQrLink = buildBasijQrLink(member.qrToken);
                        const memberNameLabel = `${member.firstName} ${member.lastName || ""}`.trim() || member.firstName || "بسیجی";
                        const downloadName = `${member.firstName}-${member.lastName || member.fatherName || member.id}`;
                        return (
                          <article
                            key={member.id}
                            className={`rounded-3xl border p-4 sm:p-5 ${
                              isDayTheme
                                ? "border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 shadow-[0_18px_50px_rgba(34,197,94,0.16)]"
                                : "border-white/10 bg-[#08121b] shadow-[0_18px_55px_rgba(0,0,0,0.65)]"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <h3 className={`text-xl font-bold ${baseText}`}>
                                  {member.firstName} {member.lastName || ""}
                                </h3>
                                <p className={`mt-1 text-xs ${subtleText}`}>
                                  {member.fatherName?.trim() ? `نام پدر: ${member.fatherName}` : "نام پدر ثبت نشده"}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span
                                  className={`rounded-full border px-3 py-1 ${
                                    isDayTheme ? "border-emerald-200 text-emerald-800" : "border-white/20 text-white/80"
                                  }`}
                                >
                                  {member.phone}
                                </span>
                                <span className={subtleText}>{formatShortDateTime(member.updatedAt ?? member.createdAt)}</span>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3 text-sm">
                              <button
                                onClick={() => handleBasijEdit(member)}
                                className={`rounded-2xl border px-4 py-1 transition ${
                                  isDayTheme ? "border-emerald-200 text-emerald-700 hover:border-emerald-300" : "border-emerald-300/40 text-emerald-200 hover:border-emerald-200"
                                }`}
                              >
                                ویرایش
                              </button>
                              <button
                                onClick={() => handleBasijDelete(member.id)}
                                className={`rounded-2xl border px-4 py-1 transition ${
                                  isDayTheme ? "border-red-200 text-red-500 hover:border-red-300" : "border-red-400/30 text-red-200 hover:border-red-200"
                                }`}
                              >
                                حذف
                              </button>
                            </div>
                            {memberQrLink ? (
                              <div
                                className={`mt-4 rounded-3xl border px-4 py-4 ${
                                  isDayTheme ? "border-emerald-100 bg-white/90" : "border-white/10 bg-white/5"
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <p className={`text-sm font-semibold ${baseText}`}>کد اختصاصی {memberNameLabel}</p>
                                  <span className={`text-xs ${subtleText}`}>دانلود یا نمایش فوری</span>
                                </div>
                                <div className="mt-3 flex justify-center">
                                  <QrPreview
                                    value={memberQrLink}
                                    minimal
                                    allowDownload
                                    downloadFileName={downloadName}
                                    downloadLabel={`دانلود QR ${member.firstName}`}
                                    frameClassName={qrFrameClass}
                                    downloadButtonClassName={qrDownloadButtonClass}
                                    fgColor="#000000"
                                    bgColor="#ffffff"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`mt-4 rounded-3xl border px-4 py-3 text-sm ${
                                  isDayTheme ? "border-emerald-100 bg-white text-emerald-900" : "border-white/10 bg-white/5 text-white/75"
                                }`}
                              >
                                برای این عضو هنوز QR ثبت نشده است.
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`rounded-3xl p-6 text-base leading-7 ${glassCard} ${subtleText}`}>
                      هنوز عضوی ثبت نشده است.
                    </div>
                  )}
                </div>

                <form onSubmit={handleBasijSubmit} className={`rounded-[32px] border p-5 sm:p-6 ${panelSoft}`}>
                  <h3 className={`mt-3 text-xl font-bold sm:text-2xl ${baseText}`}>
                    {basijFormMode === "create" ? "ثبت عضو جدید" : "ویرایش عضو انتخابی"}
                  </h3>
                  <div className="mt-4 space-y-4 text-sm sm:text-base">
                    <label className={`block ${baseText}`}>
                      نام
                      <input
                        value={basijFormValues.firstName}
                        onChange={(e) => setBasijFormValues((prev) => ({ ...prev, firstName: e.target.value }))}
                        className={`mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-emerald-300 ${
                          isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                        }`}
                        required
                        suppressHydrationWarning
                      />
                    </label>
                    <label className={`block ${baseText}`}>
                      نام خانوادگی
                      <input
                        value={basijFormValues.lastName}
                        onChange={(e) => setBasijFormValues((prev) => ({ ...prev, lastName: e.target.value }))}
                        className={`mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-emerald-300 ${
                          isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                        }`}
                        required
                        suppressHydrationWarning
                      />
                    </label>
                    <label className={`block ${baseText}`}>
                      شماره همراه (اختیاری)
                      <input
                        value={basijFormValues.phone}
                        onChange={(e) => setBasijFormValues((prev) => ({ ...prev, phone: e.target.value }))}
                        className={`mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-emerald-300 ${
                          isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                        }`}
                        suppressHydrationWarning
                      />
                    </label>
                    <label className={`block ${baseText}`}>
                      نام پدر
                      <input
                        value={basijFormValues.fatherName}
                        onChange={(e) => setBasijFormValues((prev) => ({ ...prev, fatherName: e.target.value }))}
                        className={`mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus-border-emerald-300 ${
                          isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                        }`}
                        required
                        suppressHydrationWarning
                      />
                    </label>
                    <label className={`block ${baseText}`}>
                      گذرواژه
                      <input
                        type="password"
                        value={basijFormValues.password}
                        onChange={(e) => setBasijFormValues((prev) => ({ ...prev, password: e.target.value }))}
                        className={`mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-emerald-300 ${
                          isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                        }`}
                        required
                        suppressHydrationWarning
                      />
                    </label>
                    {basijError && <p className="text-sm text-red-500">{basijError}</p>}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3 text-base">
                    <button
                      type="submit"
                      disabled={basijSubmitting}
                      className={`flex-1 rounded-2xl px-4 py-2 font-semibold transition disabled:opacity-40 ${
                        isDayTheme
                          ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 text-white"
                          : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 text-emerald-900"
                      }`}
                    >
                      {basijSubmitting ? "در حال ذخیره..." : basijFormMode === "create" ? "ثبت عضو" : "ذخیره تغییرات"}
                    </button>
                    {basijFormMode === "edit" && (
                      <button
                        type="button"
                        onClick={resetBasijForm}
                        className={`rounded-2xl border px-4 py-2 transition ${
                          isDayTheme ? "border-emerald-100 text-emerald-700 hover:border-emerald-300" : "border-white/25 text-white/80 hover:border-white"
                        }`}
                      >
                        انصراف
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </>
          )}
        </section>

        <section className={`mt-8 rounded-[36px] border p-6 sm:p-8 ${managerAccessSection}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className={`text-xs font-semibold sm:text-sm ${isDayTheme ? "text-emerald-700" : "text-emerald-200"}`}>بانک وصیت‌نامه شهدا</p>
              <h2 className={`mt-2 text-2xl font-bold ${baseText}`}>مدیریت وصیت‌نامه‌های شهدا</h2>
              <p className={`mt-3 text-sm leading-7 sm:text-base ${subtleText}`}>
                هر وصیت‌نامه جدید پس از تأیید، در صفحهٔ «وصیت‌نامه شهدا» نمایش داده می‌شود و می‌تواند به‌عنوان الگوی الهام‌بخش در جلسات معرفی شود.
              </p>
              {martyrWillError && martyrWillExpanded && <p className="mt-2 text-sm text-red-400">{martyrWillError}</p>}
            </div>
            <div className="flex items-center gap-3">
              {martyrWillExpanded && (
                <button
                  onClick={fetchMartyrWills}
                  className={`rounded-2xl border px-5 py-2 text-base transition ${
                    isDayTheme ? "border-emerald-200 text-emerald-800 hover:border-emerald-300" : "border-white/20 text-white hover:border-emerald-300/50"
                  }`}
                >
                  بروزرسانی وصیت‌نامه‌ها
                </button>
              )}
              <button
                onClick={() => setMartyrWillExpanded((prev) => !prev)}
                aria-expanded={martyrWillExpanded}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  isDayTheme ? "border-emerald-200 text-emerald-800 hover:border-emerald-300" : "border-white/20 text-white hover:border-emerald-200"
                }`}
              >
                {martyrWillExpanded ? "بستن" : "ادامه"}
                <span className={`text-lg ${isDayTheme ? "text-emerald-600" : "text-emerald-200"}`}>
                  {martyrWillExpanded ? "▲" : "▼"}
                </span>
              </button>
            </div>
          </div>

          {martyrWillExpanded && (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr,1fr]">
              <div className="space-y-4">
                {martyrWillLoading ? (
                  <div className={`rounded-3xl p-6 text-center text-base leading-7 ${glassCard}`}>
                    در حال بارگذاری وصیت‌نامه‌ها...
                  </div>
                ) : martyrWills.length ? (
                  martyrWills.map((item) => (
                    <article
                      key={item.id}
                      className={`rounded-3xl border p-4 sm:p-5 ${
                        isDayTheme
                          ? "border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 shadow-[0_20px_55px_rgba(34,197,94,0.18)]"
                          : "border-white/10 bg-[#08121b] shadow-[0_18px_55px_rgba(0,0,0,0.65)]"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className={`text-xs ${subtleText}`}>{item.context}</p>
                          <h3 className={`mt-1 text-xl font-bold ${baseText}`}>{item.name}</h3>
                        </div>
                        <span className={`text-xs ${subtleText}`}>
                          {new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(item.updatedAt || item.createdAt))}
                        </span>
                      </div>
                      <p className={`mt-4 text-base leading-7 ${subtleText}`}>{item.excerpt}</p>
                      <div className="mt-4 flex gap-3 text-sm">
                        <button
                          onClick={() => handleMartyrWillEdit(item)}
                          className={`rounded-2xl border px-4 py-1 transition ${
                            isDayTheme ? "border-emerald-200 text-emerald-700 hover:border-emerald-300" : "border-emerald-300/40 text-emerald-200 hover:border-emerald-200"
                          }`}
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleMartyrWillDelete(item.id)}
                          className={`rounded-2xl border px-4 py-1 transition ${
                            isDayTheme ? "border-red-200 text-red-500 hover:border-red-300" : "border-red-400/30 text-red-200 hover:border-red-200"
                          }`}
                        >
                          حذف
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className={`rounded-3xl p-6 text-base leading-7 ${glassCard} ${subtleText}`}>
                    هنوز وصیت‌نامه‌ای ثبت نشده است.
                  </div>
                )}
              </div>

              <form onSubmit={handleMartyrWillSubmit} className={`rounded-[32px] border p-5 sm:p-6 ${panelSoft}`}>
                <h3 className={`mt-3 text-xl font-bold sm:text-2xl ${baseText}`}>
                  {martyrWillFormMode === "create" ? "افزودن وصیت‌نامه تازه" : "ویرایش وصیت‌نامه انتخابی"}
                </h3>
                <div className="mt-4 space-y-4 text-sm sm:text-base">
                  <label className={`block ${baseText}`}>
                    نام شهید
                    <input
                      value={martyrWillFormValues.name}
                      onChange={(e) => setMartyrWillFormValues((prev) => ({ ...prev, name: e.target.value }))}
                      className={`mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-emerald-300 ${
                        isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                      }`}
                      required
                      suppressHydrationWarning
                    />
                  </label>
                  <label className={`block ${baseText}`}>
                    زمینه عملیات / شهر
                    <input
                      value={martyrWillFormValues.context}
                      onChange={(e) => setMartyrWillFormValues((prev) => ({ ...prev, context: e.target.value }))}
                      className={`mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-emerald-300 ${
                        isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                      }`}
                      required
                      suppressHydrationWarning
                    />
                  </label>
                  <label className={`block ${baseText}`}>
                    گزیده وصیت‌نامه
                    <textarea
                      value={martyrWillFormValues.excerpt}
                      onChange={(e) => setMartyrWillFormValues((prev) => ({ ...prev, excerpt: e.target.value }))}
                      className={`mt-2 h-40 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-emerald-300 ${
                        isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                      }`}
                      required
                      suppressHydrationWarning
                    />
                  </label>
                  {martyrWillError && !martyrWillExpanded && <p className="text-sm text-red-500">{martyrWillError}</p>}
                </div>
                <div className="mt-6 flex flex-wrap gap-3 text-base">
                  <button
                    type="submit"
                    disabled={martyrWillSubmitting}
                    className={`flex-1 rounded-2xl px-4 py-2 font-semibold transition disabled:opacity-40 ${
                      isDayTheme ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 text-white" : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 text-emerald-900"
                    }`}
                  >
                    {martyrWillSubmitting ? "در حال ذخیره..." : martyrWillFormMode === "create" ? "ثبت وصیت‌نامه" : "ذخیره تغییرات"}
                  </button>
                  {martyrWillFormMode === "edit" && (
                    <button
                      type="button"
                      onClick={resetMartyrWillForm}
                      className={`rounded-2xl border px-4 py-2 transition ${
                        isDayTheme ? "border-emerald-100 text-emerald-700 hover:border-emerald-300" : "border-white/25 text-white/80 hover:border-white"
                      }`}
                    >
                      انصراف
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </section>

        <section className={`mt-10 rounded-[36px] border p-8 ${managerAccessSection}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm font-semibold ${isDayTheme ? "text-emerald-700" : "text-emerald-200"}`}>مرکز اطلاعیه‌های مسجد</p>
              <h2 className={`mt-2 text-3xl font-bold ${baseText}`}>مدیریت اطلاعیه‌ها</h2>
              <p className={`mt-3 text-base leading-7 ${subtleText}`}>
                اطلاعیه‌های ثبت‌شده بلافاصله در باکس «اطلاعیه‌های مسجد و پایگاه» صفحه اصلی نمایش داده می‌شوند.
              </p>
              {announcementError && announcementExpanded && <p className="mt-3 text-sm text-red-400">{announcementError}</p>}
            </div>
            <div className="flex items-center gap-3">
              {announcementExpanded && (
                <button
                  onClick={fetchAnnouncements}
                  className={`rounded-2xl border px-5 py-2 text-base transition ${
                    isDayTheme ? "border-emerald-200 text-emerald-800 hover:border-emerald-300" : "border-white/20 text-white hover:border-emerald-300/50"
                  }`}
                >
                  بروزرسانی اطلاعیه‌ها
                </button>
              )}
              <button
                onClick={() => setAnnouncementExpanded((prev) => !prev)}
                aria-expanded={announcementExpanded}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  isDayTheme ? "border-emerald-200 text-emerald-800 hover:border-emerald-300" : "border-white/20 text-white hover:border-emerald-200"
                }`}
              >
                {announcementExpanded ? "بستن" : "ادامه"}
                <span className={`text-lg ${isDayTheme ? "text-emerald-600" : "text-emerald-200"}`}>
                  {announcementExpanded ? "▲" : "▼"}
                </span>
              </button>
            </div>
          </div>

          {announcementExpanded && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr,1fr]">
              <div className="space-y-4">
                {announcementLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-28 animate-pulse rounded-3xl ${isDayTheme ? "bg-emerald-50" : "bg-white/5"}`}
                      />
                    ))}
                  </div>
                ) : announcements.length ? (
                  announcements.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-3xl border p-5 ${
                        isDayTheme
                          ? "border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50 to-teal-50 shadow-[0_20px_55px_rgba(34,197,94,0.18)]"
                          : "border-white/10 bg-[#08121b] shadow-[0_18px_55px_rgba(0,0,0,0.6)]"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className={`text-xs ${subtleText}`}>{formatAnnDate(item.updatedAt || item.createdAt)}</p>
                          <h3 className={`mt-1 text-xl font-bold ${baseText}`}>{item.title}</h3>
                        </div>
                        {item.highlight && (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isDayTheme ? "bg-emerald-100 text-emerald-800" : "bg-white/15 text-emerald-100"
                            }`}
                          >
                            {item.highlight}
                          </span>
                        )}
                      </div>
                      <p className={`mt-4 text-base leading-7 ${subtleText}`}>{item.body}</p>
                      <div className="mt-4 flex gap-3 text-sm">
                        <button
                          onClick={() => handleAnnouncementEdit(item)}
                          className={`rounded-2xl border px-4 py-1 transition ${
                            isDayTheme ? "border-emerald-200 text-emerald-700 hover:border-emerald-300" : "border-emerald-300/40 text-emerald-200 hover:border-emerald-200"
                          }`}
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleAnnouncementDelete(item.id)}
                          className={`rounded-2xl border px-4 py-1 transition ${
                            isDayTheme ? "border-red-200 text-red-500 hover:border-red-300" : "border-red-400/30 text-red-200 hover:border-red-200"
                          }`}
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`rounded-3xl p-6 text-base leading-7 ${glassCard} ${subtleText}`}>
                    هنوز اطلاعیه‌ای ثبت نشده است.
                  </div>
                )}
              </div>

              <form onSubmit={handleAnnouncementSubmit} className={`rounded-[32px] border p-6 ${panelSoft}`}>
                <p className={`text-sm uppercase tracking-[0.4em] ${isDayTheme ? "text-emerald-700" : "text-emerald-200"}`}>
                  {announcementFormMode === "edit" ? "ویرایش اطلاعیه" : ""}
                </p>
                <h3 className={`mt-3 text-2xl font-bold ${baseText}`}>
                  {announcementFormMode === "create" ? "ثبت اطلاعیه تازه" : "ویرایش اطلاعیه انتخابی"}
                </h3>
                <div className="mt-5 space-y-5 text-base">
                  <label className={`block ${baseText}`}>
                    عنوان اطلاعیه
                    <input
                      value={announcementFormValues.title}
                      onChange={(e) => setAnnouncementFormValues((prev) => ({ ...prev, title: e.target.value }))}
                      className={`mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-emerald-300 ${
                        isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                      }`}
                      suppressHydrationWarning
                      required
                    />
                  </label>
                  <label className={`block ${baseText}`}>
                    متن اطلاعیه
                    <textarea
                      value={announcementFormValues.body}
                      onChange={(e) => setAnnouncementFormValues((prev) => ({ ...prev, body: e.target.value }))}
                      className={`mt-2 h-32 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-emerald-300 ${
                        isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                      }`}
                      suppressHydrationWarning
                      required
                    />
                  </label>
                </div>
                <div className="mt-6 flex flex-wrap gap-3 text-base">
                  <button
                    type="submit"
                    disabled={announcementSubmitting}
                    className={`flex-1 rounded-2xl px-4 py-2 font-semibold transition disabled:opacity-40 ${
                      isDayTheme ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 text-white" : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 text-emerald-900"
                    }`}
                  >
                    {announcementSubmitting ? "در حال ذخیره..." : announcementFormMode === "create" ? "ثبت اطلاعیه" : "ذخیره تغییرات"}
                  </button>
                  {announcementFormMode === "edit" && (
                    <button
                      type="button"
                      onClick={resetAnnouncementForm}
                      className={`rounded-2xl border px-4 py-2 transition ${
                        isDayTheme ? "border-emerald-100 text-emerald-700 hover:border-emerald-300" : "border-white/25 text-white/80 hover:border-white"
                      }`}
                    >
                      انصراف
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </section>

        <section className={`mt-10 rounded-[36px] border p-8 ${managerAccessSection}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm font-semibold ${isDayTheme ? "text-emerald-700" : "text-emerald-200"}`}>بانک حدیث روز</p>
              <h2 className={`mt-2 text-3xl font-bold ${baseText}`}>مدیریت احادیث</h2>
              <p className={`mt-3 text-base leading-7 ${subtleText}`}>
                {`تعداد ذخیره‌شده: ${sortedHadiths.length} / ${hadithLimit}`} · {"حداکثر ۱۰۰ حدیث قابل نگهداری است"}
              </p>
              {hadithError && hadithExpanded && <p className="mt-2 text-sm text-red-300">{hadithError}</p>}
            </div>
            <div className="flex items-center gap-3">
              {hadithExpanded && (
                <button
                  onClick={fetchHadiths}
                  className={`rounded-2xl border px-5 py-2 text-base transition ${
                    isDayTheme ? "border-emerald-200 text-emerald-800 hover:border-emerald-300" : "border-white/20 text-white hover:border-emerald-300/50"
                  }`}
                >
                  بروزرسانی داده‌ها
                </button>
              )}
              <button
                onClick={() => setHadithExpanded((prev) => !prev)}
                aria-expanded={hadithExpanded}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  isDayTheme ? "border-emerald-200 text-emerald-800 hover:border-emerald-300" : "border-white/20 text-white hover:border-emerald-200"
                }`}
              >
                {hadithExpanded ? "بستن" : "ادامه"}
                <span className={`text-lg ${isDayTheme ? "text-emerald-600" : "text-emerald-200"}`}>
                  {hadithExpanded ? "▲" : "▼"}
                </span>
              </button>
            </div>
          </div>

          {hadithExpanded && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr,1fr]">
              <div className="space-y-4">
                {hadithLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-32 animate-pulse rounded-3xl ${isDayTheme ? "bg-emerald-50" : "bg-white/5"}`}
                      />
                    ))}
                  </div>
                ) : sortedHadiths.length ? (
                  sortedHadiths.map((item, index) => (
                    <div
                      key={item.id}
                      className={`rounded-3xl border p-5 ${
                        isDayTheme
                          ? "border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 shadow-[0_20px_55px_rgba(34,197,94,0.18)]"
                          : "border-white/10 bg-[#0a1620] shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                      }`}
                    >
                      <div className={`flex items-center justify-between text-sm ${subtleText}`}>
                        <span>حدیث #{index + 1}</span>
                        <div className="flex gap-2 rtl:flex-row-reverse">
                          <button
                            onClick={() => handleReorder(item.id, "up")}
                            disabled={index === 0}
                            className={`rounded-full border px-3 py-1 text-sm disabled:opacity-30 ${
                              isDayTheme ? "border-emerald-100" : "border-white/20"
                            }`}
                          >
                            بالا
                          </button>
                          <button
                            onClick={() => handleReorder(item.id, "down")}
                            disabled={index === sortedHadiths.length - 1}
                            className={`rounded-full border px-3 py-1 text-sm disabled:opacity-30 ${
                              isDayTheme ? "border-emerald-100" : "border-white/20"
                            }`}
                          >
                            پایین
                          </button>
                        </div>
                      </div>
                      <p className={`mt-3 text-base font-semibold leading-7 ${baseText}`}>{item.text}</p>
                      <p className={`mt-2 text-sm ${isDayTheme ? "text-emerald-700" : "text-emerald-200"}`}>{item.translation}</p>
                      <p className={`mt-3 text-sm ${subtleText}`}>{item.source}</p>
                      <div className="mt-4 flex gap-3 text-sm">
                        <button
                          onClick={() => handleEdit(item)}
                          className={`rounded-2xl border px-4 py-1 transition ${
                            isDayTheme ? "border-emerald-200 text-emerald-700 hover:border-emerald-300" : "border-emerald-300/40 text-emerald-200 hover:border-emerald-200"
                          }`}
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className={`rounded-2xl border px-4 py-1 transition ${
                            isDayTheme ? "border-red-200 text-red-500 hover:border-red-300" : "border-red-400/30 text-red-200 hover:border-red-200"
                          }`}
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`rounded-3xl p-6 text-base leading-7 ${glassCard} ${subtleText}`}>
                    حدیثی ثبت نشده است.
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className={`rounded-[32px] border p-6 ${panelSoft}`}>
                <p className={`text-sm uppercase tracking-[0.4em] ${isDayTheme ? "text-emerald-700" : "text-emerald-200"}`}>
                  {formMode === "create" ? "ثبت جدید" : "ویرایش حدیث"}
                </p>
                <h3 className={`mt-3 text-2xl font-bold ${baseText}`}>
                  {formMode === "create" ? "افزودن حدیث تازه" : "ویرایش حدیث انتخابی"}
                </h3>
                <div className="mt-5 space-y-5 text-base">
                  <label className={`block ${baseText}`}>
                    متن عربی حدیث
                    <textarea
                      value={formValues.text}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, text: e.target.value }))}
                      className={`mt-2 h-24 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-emerald-300 ${
                        isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                      }`}
                      suppressHydrationWarning
                      required
                    />
                  </label>
                  <label className={`block ${baseText}`}>
                    ترجمه فارسی
                    <textarea
                      value={formValues.translation}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, translation: e.target.value }))}
                      className={`mt-2 h-24 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-emerald-300 ${
                        isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                      }`}
                      suppressHydrationWarning
                      required
                    />
                  </label>
                  <label className={`block ${baseText}`}>
                    منبع حدیث
                    <input
                      value={formValues.source}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, source: e.target.value }))}
                      className={`mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-emerald-300 ${
                        isDayTheme ? "border-emerald-100 bg-white text-[#0b1f33]" : "border-white/15 bg-[#0c1621] text-white"
                      }`}
                      suppressHydrationWarning
                      required
                    />
                  </label>
                  {formError && <p className="text-sm text-red-500">{formError}</p>}
                </div>
                <div className="mt-6 flex flex-wrap gap-3 text-base">
                  <button
                    type="submit"
                    disabled={submitting || (formMode === "create" && sortedHadiths.length >= hadithLimit)}
                    className={`flex-1 rounded-2xl px-4 py-2 font-semibold transition disabled:opacity-40 ${
                      isDayTheme ? "bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300 text-white" : "bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300 text-emerald-900"
                    }`}
                  >
                    {submitting ? "در حال ذخیره..." : formMode === "create" ? "ذخیره حدیث" : "ویرایش حدیث"}
                  </button>
                  {formMode === "edit" && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className={`rounded-2xl border px-4 py-2 transition ${
                        isDayTheme ? "border-emerald-100 text-emerald-700 hover:border-emerald-300" : "border-white/25 text-white/80 hover:border-white"
                      }`}
                    >
                      انصراف
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ManagerDeskPage;
