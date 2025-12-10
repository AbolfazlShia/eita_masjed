import { NextResponse } from "next/server";

import { createMartyrWill, getMartyrWills, MartyrWillPayload } from "@/lib/martyr-wills";
import { getErrorMessage } from "@/lib/errors";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET() {
  try {
    const wills = getMartyrWills();
    return NextResponse.json({ ok: true, wills });
  } catch (error: unknown) {
    return jsonError(getErrorMessage(error), 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload: MartyrWillPayload = {
      name: body?.name ?? "",
      context: body?.context ?? "",
      excerpt: body?.excerpt ?? "",
    };
    const will = createMartyrWill(payload);
    return NextResponse.json({ ok: true, will });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status =
      message === "limit_reached" ? 429 : message.startsWith("empty") ? 422 : 500;
    return jsonError(message, status);
  }
}
