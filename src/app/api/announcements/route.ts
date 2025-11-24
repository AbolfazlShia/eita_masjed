import { NextResponse } from "next/server";
import { getAnnouncements, createAnnouncement } from "@/lib/announcements";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET() {
  try {
    const announcements = getAnnouncements();
    return NextResponse.json({ ok: true, announcements });
  } catch (error: any) {
    return jsonError(error?.message || "internal_error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { title, body, highlight } = payload ?? {};
    const announcement = createAnnouncement({ title, body, highlight });
    return NextResponse.json({ ok: true, announcement });
  } catch (error: any) {
    const message = error?.message || "internal_error";
    const status = message.startsWith("empty") ? 422 : 400;
    return jsonError(message, status);
  }
}
