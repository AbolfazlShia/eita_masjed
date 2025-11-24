import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: false, error: "registration_disabled" }, { status: 403 });
}
