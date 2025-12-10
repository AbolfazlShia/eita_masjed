import { NextRequest, NextResponse } from "next/server";
import { deleteInspiringStory, InspiringStoryPayload, updateInspiringStory } from "@/lib/inspiring-stories";
import { getErrorMessage } from "@/lib/errors";

type InspiringStoryRouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function PUT(req: NextRequest, context: InspiringStoryRouteContext) {
  try {
    const params = await context.params;
    const body = await req.json();
    const payload: InspiringStoryPayload = {
      title: body?.title ?? "",
      excerpt: body?.excerpt ?? "",
    };
    const story = updateInspiringStory(params.id, payload);
    return NextResponse.json({ ok: true, story });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status = message === "not_found" ? 404 : message.startsWith("empty") ? 422 : 500;
    return jsonError(message, status);
  }
}

export async function DELETE(_req: NextRequest, context: InspiringStoryRouteContext) {
  try {
    const params = await context.params;
    const removed = deleteInspiringStory(params.id);
    if (!removed) {
      return jsonError("not_found", 404);
    }
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return jsonError(getErrorMessage(error), 500);
  }
}
