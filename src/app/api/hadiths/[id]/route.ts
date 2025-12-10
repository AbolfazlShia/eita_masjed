import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteHadith, updateHadith } from "@/lib/hadiths";
import { getErrorMessage } from "@/lib/errors";

type HadithRouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function PUT(req: NextRequest, context: HadithRouteContext) {
  try {
    await requireAdmin();
    const params = await context.params;
    const body = await req.json();
    const { text, translation, source } = body ?? {};
    const hadith = updateHadith(params.id, { text, translation, source });
    return NextResponse.json({ ok: true, hadith });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status =
      message === "not_found"
        ? 404
        : message.startsWith("empty")
        ? 400
        : message === "unauthorized"
        ? 401
        : 500;
    return jsonError(message, status);
  }
}

export async function DELETE(_req: NextRequest, context: HadithRouteContext) {
  try {
    await requireAdmin();
    const params = await context.params;
    deleteHadith(params.id);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status = message === "not_found" ? 404 : message === "unauthorized" ? 401 : 500;
    return jsonError(message, status);
  }
}
