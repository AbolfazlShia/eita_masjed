import { NextResponse } from "next/server";
import { createHadith, getHadiths, MAX_HADITHS } from "@/lib/hadiths";
import { requireAdmin } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET() {
  try {
    const hadiths = getHadiths();
    return NextResponse.json({ ok: true, hadiths, limit: MAX_HADITHS });
  } catch (error: unknown) {
    return jsonError(getErrorMessage(error), 500);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { text, translation, source } = body ?? {};
    const hadith = createHadith({ text, translation, source });
    return NextResponse.json({ ok: true, hadith });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status =
      message === "limit_reached" || message.startsWith("empty") ? 400 : message === "unauthorized" ? 401 : 500;
    return jsonError(message, status);
  }
}
