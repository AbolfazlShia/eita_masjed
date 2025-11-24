import { NextResponse } from "next/server";
import { deleteBasijSession, getBasijSessionCookieName, getBasijSession } from "@/lib/basij-session";

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim().split("=") as [string, string])
      .filter(([key]) => key)
  );
  const sessionId = cookies[getBasijSessionCookieName()];
  if (sessionId) {
    const session = getBasijSession(sessionId);
    if (session) deleteBasijSession(sessionId);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(getBasijSessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date(0),
  });
  return res;
}
