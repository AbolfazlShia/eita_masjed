import { NextResponse } from "next/server";
import { verifyMember, safeMember } from "@/lib/basij-store";
import { createBasijSession, getBasijSessionCookieName } from "@/lib/basij-session";
import { getErrorMessage } from "@/lib/errors";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, password, remember = false } = body ?? {};
    if (!phone?.trim() || !password?.trim()) {
      return jsonError("missing_fields");
    }
    const member = verifyMember(phone, password);
    const session = createBasijSession(member.id, remember);
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
    const message = getErrorMessage(error);
    const status =
      message === "not_found"
        ? 404
        : message === "invalid_password"
        ? 401
        : message === "unauthorized"
        ? 401
        : 500;
    return jsonError(message, status);
  }
}
