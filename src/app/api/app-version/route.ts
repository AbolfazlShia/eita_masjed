import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

type VersionConfig = {
  latestVersionCode: number;
  latestVersionName: string;
  minVersionCode: number;
  apkUrl: string;
  changelog?: string;
};

async function loadVersionConfig(): Promise<Partial<VersionConfig> | null> {
  try {
    const filePath = path.join(process.cwd(), "data", "app-version.json");
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as VersionConfig;
  } catch (error) {
    console.warn("app-version config not found, falling back to env", error);
    return null;
  }
}

export async function GET() {
  const fileConfig = await loadVersionConfig();

  const latestCode = fileConfig?.latestVersionCode ?? parseInt(process.env.NEXT_PUBLIC_APP_VERSION_CODE || "2", 10);
  const latestName = fileConfig?.latestVersionName ?? process.env.NEXT_PUBLIC_APP_VERSION ?? "1.1";
  const minRequiredCode = fileConfig?.minVersionCode ?? parseInt(process.env.NEXT_PUBLIC_APP_MIN_VERSION_CODE || "2", 10);
  const apkUrl = fileConfig?.apkUrl ?? process.env.NEXT_PUBLIC_APP_APK_URL ?? "https://masjed-app.onrender.com/masjed-app.apk";
  const changelog = fileConfig?.changelog ?? process.env.NEXT_PUBLIC_APP_CHANGELOG ?? "UI به‌روزرسانی شده";

  return NextResponse.json({
    latestVersionCode: latestCode,
    latestVersionName: latestName,
    minVersionCode: minRequiredCode,
    apkUrl,
    changelog,
  });
}
