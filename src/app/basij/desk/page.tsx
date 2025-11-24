import { redirect } from "next/navigation";

import BasijQrCard from "./BasijQrCard";
import { getBasijMemberFromCookies } from "@/lib/basij-auth";
import { listMembers } from "@/lib/basij-store";
import { listScoreEntries } from "@/lib/basij-scores-store";

export const dynamic = "force-dynamic";

const formatDate = (value?: string) => {
  if (!value) return "زمان نامشخص";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
};

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
  const latestEntry = myEntries[0];

  return (
    <div className="min-h-screen bg-[#030d14] text-white" dir="rtl">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-3 py-8 sm:px-4 sm:py-10">
        <header className="rounded-[32px] border border-white/10 bg-gradient-to-br from-emerald-600/80 via-emerald-700 to-slate-900 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.65)] sm:p-8">
          <p className="text-xs font-semibold text-white/80">پایگاه امام جعفر صادق (ع)</p>
          <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">به میز کارت خوش اومدی!</h1>
          <p className="mt-3 text-sm leading-7 text-white/80">
            اینجا میز کار سادهٔ توست؛ برنامه‌های روزانه، وضعیت حضور و امتیازات شخصی‌ات را به سرعت بررسی کن و در جریان آخرین سیگنال‌های پایگاه بمان.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/75 sm:mt-6 sm:gap-4 sm:text-sm">
            <span className="rounded-2xl border border-white/30 px-3 py-1.5 sm:px-4">نام خانوادگی: {member?.lastName || "—"}</span>
            <span className="rounded-2xl border border-white/30 px-3 py-1.5 sm:px-4">نام پدر: {member?.fatherName || "—"}</span>
            <span className="rounded-2xl border border-white/30 px-3 py-1.5 sm:px-4">شماره همراه: {member?.phone || "ثبت نشده"}</span>
          </div>
        </header>

        <section className="grid gap-5 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_25px_70px_rgba(0,0,0,0.5)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-emerald-200 sm:text-xs">امتیازات من</p>
                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{totalScore} امتیاز</h2>
                <p className="mt-2 text-xs text-white/70 sm:text-sm">
                  {latestEntry ? `آخرین ثبت ${formatDate(latestEntry.createdAt)} · ${latestEntry.amount} امتیاز` : "هنوز امتیازی برای شما ثبت نشده است"}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                <p className="text-xs text-white/60">وضعیت</p>
                <p className="text-lg font-bold text-lime-300 sm:text-xl">فعال</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/70 sm:mt-5 sm:text-xs">
              <span>رتبه شما: {myRank} از {totalMembers}</span>
              <span>
                فاصله با رتبه اول: {scoreGap === 0 ? "بدون فاصله (رتبه اول)" : `${scoreGap} امتیاز`}
              </span>
            </div>

            <div className="mt-5 space-y-3 sm:space-y-4">
              {myEntries.length ? (
                myEntries.slice(0, 6).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80 sm:gap-3 sm:text-sm"
                  >
                    <div>
                      <p className="text-base font-semibold text-white">{entry.amount} امتیاز</p>
                      {entry.note && <p className="text-[11px] text-white/70 sm:text-xs">{entry.note}</p>}
                    </div>
                    <span className="text-[11px] text-white/60 sm:text-xs">{formatDate(entry.createdAt)}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-6 text-center text-xs text-white/70 sm:text-sm">
                  هنوز امتیازی برای شما ثبت نشده است. مأموریت‌های آینده، فرصت‌های خوبی برای جمع‌آوری امتیاز هستند.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
              <h3 className="text-base font-semibold text-white sm:text-lg">برنامه امروز</h3>
              <p className="mt-2 text-xs text-white/70 sm:text-sm">در صورت تغییر برنامه، از طریق مسئول یگان اطلاع‌رسانی می‌شود.</p>
              <ul className="mt-4 space-y-2 text-xs text-white/80 sm:space-y-3 sm:text-sm">
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <span className="sr-only">فعلاً برنامه‌ای ثبت نشده است</span>
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <span className="sr-only">فعلاً برنامه‌ای ثبت نشده است</span>
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <span className="sr-only">فعلاً برنامه‌ای ثبت نشده است</span>
                </li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 backdrop-blur-xl sm:p-6">
              <h3 className="text-base font-semibold text-white sm:text-lg">راهنمای سریع</h3>
              <ul className="mt-4 space-y-2 text-xs text-white/80 sm:text-sm">
                <li>• در صورت تغییر شماره، حتماً به مدیر اطلاع دهید.</li>
                <li>• قبل از هر مأموریت، وضعیت تجهیزات را بررسی کنید.</li>
                <li>• امتیازات بر اساس ثبت خدمت و حضور منظم به‌روز می‌شوند.</li>
              </ul>
            </div>
            <BasijQrCard token={currentMember.qrToken} />
          </div>
        </section>
      </div>
    </div>
  );
}
