import { NextResponse } from "next/server";

import { deleteMember, getMemberById, listMembers, safeMember, updateMember } from "@/lib/basij-store";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function clean(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const member = getMemberById(id);
    if (!member) return jsonError("not_found", 404);
    return NextResponse.json({ ok: true, member: safeMember(member) });
  } catch (error: any) {
    return jsonError(error?.message || "internal_error", 500);
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const updates = {
      firstName: clean(body?.firstName) || undefined,
      lastName: clean(body?.lastName) || undefined,
      fatherName: clean(body?.fatherName) || undefined,
      phone: clean(body?.phone) || undefined,
      password: clean(body?.password) || undefined,
    };

    const member = updateMember(id, updates);
    return NextResponse.json({ ok: true, member: safeMember(member) });
  } catch (error: any) {
    const message = error?.message || "internal_error";
    const status =
      message === "duplicate_phone"
        ? 409
        : message === "not_found"
        ? 404
        : 500;
    return jsonError(message, status);
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    deleteMember(id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    const message = error?.message || "internal_error";
    const status = message === "not_found" ? 404 : 500;
    return jsonError(message, status);
  }
}
