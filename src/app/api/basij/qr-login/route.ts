import { NextResponse } from "next/server";

import { getMemberByQrToken, safeMember } from "@/lib/basij-store";
import { createBasijSession, getBasijSessionCookieName } from "@/lib/basij-session";
import { getErrorMessage } from "@/lib/errors";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    if (!token) {
      return jsonError("missing_token");
    }
    const member = getMemberByQrToken(token);
    if (!member) {
      return jsonError("invalid_token", 404);
    }
    const session = createBasijSession(member.id, true);
    const secureCookie = process.env.NODE_ENV === "production";
    const res = NextResponse.json({ ok: true, member: safeMember(member) });
    res.cookies.set(getBasijSessionCookieName(), session.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie,
      path: "/",
      expires: new Date(session.expiresAt),
    });
    return res;
  } catch (error: unknown) {
    return jsonError(getErrorMessage(error), 500);
  }
}
