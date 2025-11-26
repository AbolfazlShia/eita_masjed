"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const statusMessages: Record<string, string> = {
  idle: "لطفاً QR را اسکن کنید یا توکن را دستی وارد نمایید.",
  checking: "در حال اعتبارسنجی کد QR...",
  success: "ورود موفق انجام شد. در حال انتقال...",
  error: "ورود انجام نشد. لطفاً دوباره تلاش کنید.",
};

type BasijScanClientProps = {
  initialToken?: string;
};

export default function BasijScanClient({ initialToken = "" }: BasijScanClientProps) {
  const router = useRouter();
  const [inputToken, setInputToken] = useState(initialToken);
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "error">(initialToken ? "checking" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoTokenRef = useRef<string | null>(null);

  const disabled = status === "checking" || status === "success";

  const extractToken = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const inlineMatch = trimmed.match(/(?:[?&]|^)token=([^&]+)/i);
    if (inlineMatch?.[1]) {
      try {
        return decodeURIComponent(inlineMatch[1]).trim();
      } catch {
        return inlineMatch[1].trim();
      }
    }

    const tryParse = (input: string) => {
      try {
        const parsed = new URL(input);
        const tokenFromUrl = parsed.searchParams.get("token");
        return tokenFromUrl?.trim() ?? "";
      } catch {
        return "";
      }
    };

    const absoluteToken = tryParse(trimmed);
    if (absoluteToken) return absoluteToken;

    if (typeof window !== "undefined" && trimmed.startsWith("/")) {
      const relativeToken = tryParse(new URL(trimmed, window.location.origin).toString());
      if (relativeToken) return relativeToken;
    }

    return trimmed;
  }, []);

  const attemptLogin = useCallback(
    async (value: string) => {
      const normalized = extractToken(value);
      if (!normalized) {
        setErrorMessage("کد دریافت‌شده معتبر نیست");
        setStatus("error");
        return;
      }
      try {
        setStatus("checking");
        setErrorMessage(null);
        const response = await fetch("/api/basij/qr-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: normalized }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.ok) {
          throw new Error(data?.error || "invalid_token");
        }
        setStatus("success");
        setTimeout(() => {
          router.replace("/basij/desk");
        }, 800);
      } catch (error: any) {
        const reason = error?.message || "invalid_token";
        const friendly =
          reason === "invalid_token"
            ? "کد QR معتبر نیست یا منقضی شده است."
            : reason === "missing_token"
            ? "کد QR دریافت نشد."
            : "خطای غیرمنتظره رخ داد.";
        setErrorMessage(friendly);
        setStatus("error");
      }
    },
    [router, extractToken]
  );

  useEffect(() => {
    let source = initialToken;
    if (!source && typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        source = params.get("token") || "";
      } catch {
        source = initialToken;
      }
    }

    if (source && autoTokenRef.current !== source) {
      autoTokenRef.current = source;
      setInputToken(source);
      attemptLogin(source);
    }
  }, [initialToken, attemptLogin]);

  const helperMessage = useMemo(() => {
    if (status === "error" && errorMessage) return errorMessage;
    return statusMessages[status];
  }, [status, errorMessage]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#020617] px-4 py-10 text-white" dir="rtl">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.3),_transparent_60%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(3,7,18,0.98))]" />

      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 p-6 text-center shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
        <h1 className="text-2xl font-black">ورود سریع بسیجی</h1>
        <p className="mt-2 text-sm text-white/70">با اسکن QR و بدون وارد کردن رمز وارد میز کار شو.</p>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 px-4 py-5 text-sm text-white/80">
          {helperMessage}
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            attemptLogin(inputToken);
          }}
        >
          <div className="text-right text-xs text-white/70">اگر QR به صورت لینک برایت ارسال شده، آن را اینجا الصاق کن.</div>
          <input
            value={inputToken}
            onChange={(event) => setInputToken(event.target.value)}
            placeholder="مثال: https://example.com/basij/scan?token=..."
            disabled={disabled}
            className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 py-3 text-sm font-semibold text-emerald-950 transition hover:scale-[1.01] disabled:opacity-60"
          >
            {status === "checking" ? "در حال بررسی..." : "استفاده از این کد"}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-right text-xs text-white/60">
          <p>راهنما:</p>
          <ul className="space-y-1 pr-4">
            <li>• از مدیر پایگاه بخواه QR مخصوص خودت را نشان دهد.</li>
            <li>• بعد از اسکن، این صفحه به طور خودکار وارد میز کار می‌شود.</li>
            <li>• اگر خطایی دیدی، دوباره اسکن کن یا به مدیر اطلاع بده.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
