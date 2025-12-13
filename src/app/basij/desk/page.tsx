import { redirect } from "next/navigation";

import BasijQrCard from "./BasijQrCard";
import ScoreHistory from "./ScoreHistory";
import LogoutButton from "@/components/LogoutButton";
import DeskBridge from "@/components/DeskBridge";
import { getBasijMemberFromCookies } from "@/lib/basij-auth";
import { listMembers } from "@/lib/basij-store";
import { listScoreEntries } from "@/lib/basij-scores-store";

export const dynamic = "force-dynamic";

const formatDate = (value?: string) => {
  if (!value) return "زمان نامشخص";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
};

const formatNumber = (value: number) => new Intl.NumberFormat("fa-IR").format(value);

type ScheduleStatus = "قطعی" | "در انتظار تایید" | "آزاد";

type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  location: string;
  note: string;
  status: ScheduleStatus;
};

const todaysSchedule: ScheduleItem[] = [];

const scheduleStatusTone: Record<ScheduleStatus, string> = {
  قطعی: "bg-emerald-500/20 text-emerald-100 border-emerald-400/40",
  "در انتظار تایید": "bg-amber-500/20 text-amber-100 border-amber-400/40",
  آزاد: "bg-sky-500/15 text-sky-100 border-sky-400/30",
};

const getScheduleStatusClass = (status: ScheduleStatus) => scheduleStatusTone[status];

export default async function BasijDeskPage() {
  const member = await getBasijMemberFromCookies();
  if (!member) {
    redirect("/basij/login");
  }

  const currentMember = member;

  const allEntries = await listScoreEntries();
  const allMembers = listMembers();
  const scoreTotals = allEntries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.memberId] = (acc[entry.memberId] ?? 0) + entry.amount;
    return acc;
  }, {});
  allMembers.forEach((record) => {
    if (typeof scoreTotals[record.id] === "undefined") {
      scoreTotals[record.id] = 0;
    }
  });
  const ranking = allMembers
    .slice()
    .sort((a, b) => {
      const diff = (scoreTotals[b.id] ?? 0) - (scoreTotals[a.id] ?? 0);
      if (diff !== 0) return diff;
      const bCreated = new Date(b.createdAt || 0).getTime();
      const aCreated = new Date(a.createdAt || 0).getTime();
      return bCreated - aCreated;
    })
    .map((record, index) => ({
      id: record.id,
      total: scoreTotals[record.id] ?? 0,
      order: index + 1,
    }));
  const totalMembers = ranking.length || 1;
  const myRankEntry = ranking.find((entry) => entry.id === currentMember.id);
  const myRank = myRankEntry?.order ?? totalMembers;
  const topScore = ranking[0]?.total ?? 0;
  const myScore = scoreTotals[currentMember.id] ?? 0;
  const scoreGap = Math.max(0, topScore - myScore);

  const myEntries = allEntries.filter((entry) => entry.memberId === currentMember.id);
  myEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalScore = myScore;
  const scoreHistoryEntries = myEntries.slice(0, 6).map((entry) => ({
    id: entry.id,
    amount: entry.amount,
    note: entry.note,
    dateLabel: formatDate(entry.createdAt),
  }));
  const latestEntry = myEntries[0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020914] text-white" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.85),_transparent_72%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(40,53,147,0.88),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(91,33,182,0.68),_transparent_80%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.35),_transparent_78%)]" />
      <DeskBridge title="میز بسیج" origin="basij" />
      <div className="relative z-10 px-3 py-6 sm:px-6 lg:px-10 lg:py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
          <header className="rounded-[32px] border border-white/15 bg-gradient-to-br from-[#051126] via-[#0a1a33] to-[#04070f] p-5 text-white shadow-[0_35px_140px_rgba(2,6,23,0.85)] sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest text-emerald-300/80">پایگاه امام جعفر صادق (ع)</p>
                <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">میز کار شخصی تو</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                  پیگیری امتیازات، برنامه‌های روز، وضعیت فعالیت و کد اختصاصی فقط در یک نگاه. طراحی تازهٔ میز بسیج روی هر نمایشگری کامل دیده می‌شود.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-200">فعالیت جاری</span>
                <LogoutButton
                  endpoint="/api/basij/logout"
                  redirectTo="/basij/login"
                  label="خروج از میز کار"
                  loadingLabel="در حال خروج..."
                  className="rounded-2xl border border-white/40 bg-white/10 px-4 py-2 text-xs.font-semibold text-white transition hover:border-white/80 hover:bg-white/20 sm:px-5 sm:py-2.5 sm:text-sm"
                  clearAndroidState
                />
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-[13px] text-white/80 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">نام خانوادگی: {member?.lastName || "—"}</div>
              <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">نام پدر: {member?.fatherName || "—"}</div>
              <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">شماره همراه: {member?.phone || "ثبت نشده"}</div>
            </div>
          </header>

          <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-12">
            <section className="flex w-full flex-col gap-5 rounded-[32px] border border-white/12 bg-gradient-to-b from-[#061226] via-[#050c17] to-[#02060d] p-5 sm:p-6 lg:col-span-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-emerald-300/70">امتیازات من</p>
                  <p className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{formatNumber(totalScore)} امتیاز</p>
                  <p className="mt-1 text-sm text-white/70">
                    {latestEntry ? `آخرین ثبت ${formatDate(latestEntry.createdAt)} · ${formatNumber(latestEntry.amount)} امتیاز` : "هنوز امتیازی برای شما ثبت نشده است."}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/5 px-4 py-3 text-center sm:px-5">
                  <p className="text-xs text-white/60">وضعیت فعالیت</p>
                  <p className="mt-1 text-lg font-semibold text-lime-300">فعال</p>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-white/60">رتبه شما</p>
                  <p className="mt-2 text-2xl font-black text-white">
                    {formatNumber(myRank)} <span className="text-base font-semibold text-white/60">/ {formatNumber(totalMembers)}</span>
                  </p>
                  <p className="mt-1 text-white/60">در جدول فعلی</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-white/60">فاصله با رتبه اول</p>
                  <p className="mt-2 text-2xl font-black text-white">{scoreGap === 0 ? "۰" : formatNumber(scoreGap)}</p>
                  <p className="mt-1 text-white/60">{scoreGap === 0 ? "شما در صدر هستید" : "امتیاز تا رتبه اول"}</p>
                </div>
              </div>

              <ScoreHistory entries={scoreHistoryEntries} />
            </section>

            <aside className="flex w-full flex-col gap-4 lg:col-span-6">
              <div className="w-full rounded-[32px] border border-white/12 bg-gradient-to-b from-[#061226] via-[#050c17] to-[#02060d] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-white">برنامه امروز</h3>
                  <span className="rounded-2xl border border-white/20 px-3 py-1 text-xs text-white/70">
                    {new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
                  </span>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-white/80">
                  {todaysSchedule.length ? (
                    todaysSchedule.map((item) => (
                      <li key={item.id} className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#071524] via-[#050d18] to-[#03070d] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{item.title}</p>
                            <p className="mt-0.5 text-xs text-white/60">{item.location}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-lg font-black text-white">{item.time}</p>
                            <span className={`mt-2 inline-flex items-center rounded-2xl border px-3 py-1 text-xs font-semibold ${getScheduleStatusClass(item.status)}`}>{item.status}</span>
                          </div>
                        </div>
                        <p className="mt-3 text-xs leading-6 text-white/70">{item.note}</p>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-3xl border border-dashed border-white/25 bg-gradient-to-b from-[#071524] via-[#050d18] to-[#03070d] px-4 py-6 text-center text-xs text-white/70">
                      فعلاً برنامه‌ای ثبت نشده است. به محض اضافه شدن مأموریت، اینجا مطلع می‌شوی.
                    </li>
                  )}
                </ul>
              </div>

              <div className="w-full rounded-[32px] border border-white/12 bg-gradient-to-b from-[#061226] via-[#050c17] to-[#02060d] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:p-6">
                <h3 className="text-base font-semibold text-white">راهنمای سریع</h3>
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  <li>• اطلاعات تماس خود را به‌روز نگه دار.</li>
                  <li>• حضور منظم سریع‌ترین راه برای افزایش امتیاز است.</li>
                  <li>• برای ثبت مأموریت‌های ویژه مستقیماً با مدیر هماهنگ کن.</li>
                </ul>
              </div>

              <BasijQrCard token={currentMember.qrToken} />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
