import { NextResponse } from "next/server";
import { createInspiringStory, getInspiringStories, InspiringStoryPayload } from "@/lib/inspiring-stories";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET() {
  try {
    const stories = getInspiringStories();
    return NextResponse.json({ ok: true, stories });
  } catch (error: any) {
    return jsonError(error?.message || "internal_error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload: InspiringStoryPayload = {
      title: body?.title ?? "",
      excerpt: body?.excerpt ?? "",
    };
    const story = createInspiringStory(payload);
    return NextResponse.json({ ok: true, story });
  } catch (error: any) {
    const message = error?.message || "internal_error";
    const status = message === "limit_reached" ? 429 : message.startsWith("empty") ? 422 : 500;
    return jsonError(message, status);
  }
}
