import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

import { getErrorMessage } from "@/lib/errors";

const DATA_DIR = path.resolve(process.cwd(), "data");

function jsonError(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET() {
  try {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    const files = await fs.promises.readdir(DATA_DIR, { withFileTypes: true });
    const payload: Record<string, unknown> = {};

    for (const entry of files) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
      const key = entry.name.replace(/\.json$/i, "");
      const filePath = path.join(DATA_DIR, entry.name);
      try {
        const raw = await fs.promises.readFile(filePath, "utf8");
        payload[key] = JSON.parse(raw);
      } catch (error) {
        payload[key] = { error: "unreadable", message: (error as Error).message };
      }
    }

    const generatedAt = new Date().toISOString();
    const body = JSON.stringify({ ok: true, generatedAt, files: payload }, null, 2);
    const filename = `masjed-backup-${generatedAt.replace(/[:.]/g, "-")}.json`;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    return jsonError(getErrorMessage(error));
  }
}
