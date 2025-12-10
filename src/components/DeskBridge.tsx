"use client";

import { useEffect } from "react";
import { ANDROID_DESK_REMEMBER_KEY } from "@/lib/android";

type DeskBridgeProps = {
  title: string;
  path?: string;
  origin: "basij" | "admin";
};

function readRememberState(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(ANDROID_DESK_REMEMBER_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.persistent);
  } catch {
    return false;
  }
}

function isAndroidInApp(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("inApp") === "1" && params.get("source") === "android";
  } catch {
    return false;
  }
}

export default function DeskBridge({ title, path, origin }: DeskBridgeProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAndroidInApp()) return;
    const resolvedPath =
      path ??
      (() => {
        try {
          if (typeof window === "undefined") return "";
          const url = new URL(window.location.href);
          return `${url.pathname}${url.search}`;
        } catch {
          return "";
        }
      })();
    const isQrSession = resolvedPath.includes("login=qr");
    const persistent = !isQrSession && readRememberState();
    const payload = {
      type: "setDeskShortcut",
      shortcut: {
        title,
        path: resolvedPath,
        origin,
        persistent,
      },
    };
    try {
      (window as any).MasjedBridge?.postMessage?.(JSON.stringify(payload));
    } catch (error) {
      console.error("DeskBridge postMessage failed", error);
    }
  }, [title, path, origin]);

  return null;
}
