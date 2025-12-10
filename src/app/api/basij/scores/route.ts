import { NextResponse } from "next/server";

import { addScoreEntry, listScoreEntries } from "@/lib/basij-scores-store";
import { getErrorMessage } from "@/lib/errors";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET() {
  const entries = listScoreEntries();
  return NextResponse.json({ ok: true, entries });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const memberId = typeof body?.memberId === "string" ? body.memberId.trim() : "";
    const note = typeof body?.note === "string" ? body.note : "";
    const amount = Number(body?.amount);
    if (!memberId) {
      return jsonError("member_required", 422);
    }
    if (!Number.isFinite(amount)) {
      return jsonError("invalid_amount", 422);
    }
    const entry = addScoreEntry(memberId, amount, note);
    return NextResponse.json({ ok: true, entry });
  } catch (error: unknown) {
    return jsonError(getErrorMessage(error), 500);
  }
}
