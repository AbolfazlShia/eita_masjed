import { NextRequest, NextResponse } from "next/server";
import { updateAnnouncement, deleteAnnouncement } from "@/lib/announcements";
import { getErrorMessage } from "@/lib/errors";

type AnnouncementRouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

const resolveId = async (req: NextRequest, context: AnnouncementRouteContext) => {
  const params = await context.params;
  if (params?.id && params.id !== "undefined") return params.id;
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1];
  } catch {
    return undefined;
  }
};

export async function PUT(req: NextRequest, context: AnnouncementRouteContext) {
  try {
    const id = await resolveId(req, context);
    if (!id) {
      return jsonError("missing_id", 400);
    }
    const payload = await req.json();
    const { title, body, highlight } = payload ?? {};
    const announcement = updateAnnouncement(id, { title, body, highlight });
    return NextResponse.json({ ok: true, announcement });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status = message === "not_found" ? 404 : message.startsWith("empty") ? 422 : 400;
    return jsonError(message, status);
  }
}

export async function DELETE(req: NextRequest, context: AnnouncementRouteContext) {
  try {
    const id = await resolveId(req, context);
    if (!id) {
      return jsonError("missing_id", 400);
    }
    const removed = deleteAnnouncement(id);
    if (!removed) {
      return jsonError(`not_found:${id}`, 404);
    }
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status = message === "not_found" ? 404 : 400;
    return jsonError(message, status);
  }
}
