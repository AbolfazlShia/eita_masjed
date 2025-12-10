import { NextResponse } from "next/server";

import { listMembers, createMember, safeMember } from "@/lib/basij-store";
import { getErrorMessage } from "@/lib/errors";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function clean(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function GET() {
  const members = listMembers().map(safeMember);
  return NextResponse.json({ ok: true, members, version: "debug-fatherName" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const firstName = clean(body?.firstName);
    const lastName = clean(body?.lastName);
    const fatherName = clean(body?.fatherName);
    const phone = clean(body?.phone);
    const password = clean(body?.password);

    if (!firstName || !lastName || !fatherName || !password) {
      return jsonError("missing_fields");
    }

    const member = createMember({ firstName, lastName, fatherName, phone, password });
    return NextResponse.json({ ok: true, member: safeMember(member) });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status =
      message === "duplicate_phone"
        ? 409
        : message === "limit_reached"
        ? 403
        : 500;
    return jsonError(message, status);
  }
}
