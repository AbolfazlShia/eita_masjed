"use client";

import { useState } from "react";

type ScoreHistoryEntry = {
  id: string;
  amount: number;
  note?: string | null;
  dateLabel: string;
};

type ScoreHistoryProps = {
  entries: ScoreHistoryEntry[];
};

export default function ScoreHistory({ entries }: ScoreHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const hasEntries = entries.length > 0;

  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/60 sm:text-xs">
        <div className="flex items-center gap-2">
          <span>تاریخچه امتیازات اخیر</span>
          {hasEntries && <span className="text-white/40">({entries.length} مورد)</span>}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="rounded-2xl border border-white/20 px-3 py-1 text-[11px] font-semibold text-white/80 transition hover:border-white/60 hover:text-white sm:text-xs"
        >
          {expanded ? "بستن تاریخچه" : "نمایش تاریخچه"}
        </button>
      </div>

      {expanded ? (
        hasEntries ? (
          <div className="mt-4 space-y-3 sm:space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80 sm:gap-3 sm:text-sm"
              >
                <div>
                  <p className="text-base font-semibold text-white">{entry.amount} امتیاز</p>
                  {entry.note && <p className="text-[11px] text-white/70 sm:text-xs">{entry.note}</p>}
                </div>
                <span className="text-[11px] text-white/60 sm:text-xs">{entry.dateLabel}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-6 text-center text-xs text-white/70 sm:text-sm">
            هنوز امتیازی برای شما ثبت نشده است. مأموریت‌های آینده، فرصت‌های خوبی برای جمع‌آوری امتیاز هستند.
          </div>
        )
      ) : (
        <div className="mt-4 rounded-3xl border border-dashed border-white/15 bg-white/5 px-4 py-4 text-center text-xs text-white/60 sm:text-sm">
          برای مشاهده تاریخچه امتیازات، دکمه بالا را بزنید.
        </div>
      )}
    </div>
  );
}
