import { NextResponse } from "next/server";
import { deleteMartyrWill, MartyrWillPayload, updateMartyrWill } from "@/lib/martyr-wills";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const payload: MartyrWillPayload = {
      name: body?.name ?? "",
      context: body?.context ?? "",
      excerpt: body?.excerpt ?? "",
    };
    const { id } = await context.params;
    const will = updateMartyrWill(id, payload);
    return NextResponse.json({ ok: true, will });
  } catch (error: any) {
    const message = error?.message || "internal_error";
    const status =
      message === "not_found" ? 404 : message.startsWith("empty") ? 422 : 500;
    return jsonError(message, status);
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const removed = deleteMartyrWill(id);
    if (!removed) {
      return jsonError("not_found", 404);
    }
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return jsonError(error?.message || "internal_error", 500);
  }
}
