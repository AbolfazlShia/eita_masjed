"use client";

import { useEffect, useState } from "react";
import { ANDROID_DESK_REMEMBER_KEY } from "@/lib/android";

type DeskBridgeProps = {
  title: string;
  path?: string;
  origin: "basij" | "admin";
};

type DeskBridgeStatus = "idle" | "pending" | "success" | "error" | "skipped";

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
  const [status, setStatus] = useState<{ state: DeskBridgeStatus; message: string }>({
    state: "idle",
    message: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAndroidInApp()) {
      setStatus({ state: "skipped", message: "" });
      return;
    }

    setStatus({ state: "pending", message: "در حال همگام‌سازی میانبر میز کار..." });
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
      const bridge = (window as any).MasjedBridge;
      if (!bridge || typeof bridge.postMessage !== "function") {
        throw new Error("MasjedBridge.postMessage در دسترس نیست");
      }
      bridge.postMessage(JSON.stringify(payload));
      setStatus({ state: "success", message: "میانبر میز کار در اپ اندروید به‌روزرسانی شد." });
      console.info("DeskBridge payload sent", payload);
    } catch (error) {
      console.error("DeskBridge postMessage failed", error);
      setStatus({ state: "error", message: "اتصال به اپ اندروید برقرار نشد." });
    }
  }, [title, path, origin]);

  if (status.state === "skipped" || !status.message) {
    return null;
  }

  return (
    <span aria-live="polite" className="sr-only" data-deskbridge-status={status.state}>
      {status.message}
    </span>
  );
}
