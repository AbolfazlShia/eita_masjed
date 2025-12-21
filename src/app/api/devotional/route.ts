import { NextRequest, NextResponse } from "next/server";

import { devotionalSchedule, type DevotionalType } from "@/lib/devotional-data";

const ALLOWED_TYPES: DevotionalType[] = ["dua", "ziyarat"];

const jsonError = (message: string, status = 400) =>
  NextResponse.json({ ok: false, error: message }, { status });

const normalizeDayIndex = (rawDay?: string | null) => {
  if (rawDay === null || rawDay === undefined) {
    return new Date().getDay();
  }
  const parsed = parseInt(rawDay, 10);
  if (Number.isNaN(parsed)) {
    return new Date().getDay();
  }
  // ensure 0-6 range even if caller sends negative or >= 7
  return ((parsed % 7) + 7) % 7;
};

const normalizeType = (rawType?: string | null): DevotionalType =>
  ALLOWED_TYPES.includes(rawType as DevotionalType) ? (rawType as DevotionalType) : "dua";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = normalizeType(searchParams.get("type"));
    const dayIndex = normalizeDayIndex(searchParams.get("day"));

    const entry = devotionalSchedule[dayIndex];
    if (!entry) {
      return jsonError("devotional_not_found", 404);
    }

    const title = type === "dua" ? entry.duaTitle : entry.ziyaratTitle;
    const content = type === "dua" ? entry.duaContent : entry.ziyaratContent;

    return NextResponse.json({
      ok: true,
      type,
      dayIndex,
      dayLabel: entry.dayLabel,
      title,
      content,
      entry,
    });
  } catch (error) {
    console.error("devotional_api_error", error);
    return jsonError("devotional_internal_error", 500);
  }
}
