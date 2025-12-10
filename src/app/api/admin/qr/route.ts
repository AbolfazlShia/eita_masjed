import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { getOrCreateManagerQrToken } from "@/lib/manager-qr";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET() {
  try {
    const user = await requireAdmin();
    const qrToken = getOrCreateManagerQrToken(user.id);
    return NextResponse.json({ ok: true, qrToken });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return jsonError(message, message === "unauthorized" ? 401 : 500);
  }
}

