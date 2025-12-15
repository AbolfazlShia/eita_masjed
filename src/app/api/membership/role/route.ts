import { NextResponse } from "next/server";

import { getBasijMemberFromCookies } from "@/lib/basij-auth";
import { getUserFromCookies } from "@/lib/session";

export async function GET() {
  try {
    const admin = await getUserFromCookies();
    if (admin && (admin.role === "admin" || admin.role === "manager")) {
      return NextResponse.json({ ok: true, role: "manager" as const });
    }

    const basijMember = await getBasijMemberFromCookies();
    if (basijMember) {
      return NextResponse.json({ ok: true, role: "active" as const });
    }

    return NextResponse.json({ ok: true, role: "guest" as const });
  } catch (error) {
    console.error("[membership-role]", error);
    return NextResponse.json({ ok: false, role: "guest" as const }, { status: 500 });
  }
}
