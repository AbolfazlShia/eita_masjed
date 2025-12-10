import { NextResponse } from "next/server";
import { reorderHadiths } from "@/lib/hadiths";
import { requireAdmin } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const ids: string[] = body?.ids;
    if (!Array.isArray(ids) || !ids.length) {
      return jsonError("invalid_payload");
    }
    reorderHadiths(ids);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status =
      message === "length_mismatch" || message === "invalid_ids"
        ? 400
        : message === "unauthorized"
        ? 401
        : 500;
    return jsonError(message, status);
  }
}
