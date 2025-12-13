"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

type BasijQrCardProps = {
  token?: string;
};

export default function BasijQrCard({ token }: BasijQrCardProps) {
  const [copied, setCopied] = useState(false);
  const fallbackBase = useMemo(() => (process.env.NEXT_PUBLIC_APP_URL ?? "https://masjed.local").replace(/\/$/, ""), []);
  const [qrLink, setQrLink] = useState(() => {
    if (!token) return "";
    const normalizedToken = token.trim();
    return `${fallbackBase}/basij/scan?token=${normalizedToken}`;
  });
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!token) {
      setQrLink("");
      return;
    }
    const normalizedToken = token.trim();
    if (typeof window !== "undefined" && window.location?.origin) {
      setQrLink(`${window.location.origin.replace(/\/$/, "")}/basij/scan?token=${normalizedToken}`);
    } else {
      setQrLink(`${fallbackBase}/basij/scan?token=${normalizedToken}`);
    }
  }, [token, fallbackBase]);

  const handleCopy = useCallback(async () => {
    if (!qrLink) return;
    const performFallbackCopy = () => {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = qrLink;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch (fallbackError) {
        console.error("Fallback clipboard copy failed", fallbackError);
      }
    };
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(qrLink);
      } else {
        performFallbackCopy();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Failed to copy QR link", error);
      performFallbackCopy();
    }
  }, [qrLink]);

  const handleDownloadQr = useCallback(() => {
    try {
      const canvas = qrCanvasRef.current;
      if (!canvas) throw new Error("missing_canvas");
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeFile = (`basij-qr-${token?.slice(0, 6) ?? "code"}`).replace(/[^a-zA-Z0-9\u0600-\u06FF_-]+/g, "-");
      link.href = dataUrl;
      link.download = `${safeFile || "basij-qr"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("QR download failed", error);
    }
  }, [token]);

  return (
    <div className="rounded-[32px] border border-white/12 bg-gradient-to-b from-[#061226] via-[#050c17] to-[#02060d] p-4 text-white shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold sm:text-base">کد اختصاصی بسیجی</h3>
          <p className="mt-1 text-[11px] text-white/70 sm:text-xs">برای ورود سریع، حضور یا تایید هویت در پایگاه.</p>
        </div>
      </div>

      {token ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_0.55fr] sm:items-center">
            <div className="rounded-[24px] border border-white/20 bg-white/10 p-3.5 text-center shadow-inner">
              <p className="text-[11px] font-semibold text-white/70 sm:text-xs">لینک فعال</p>
              <p className="mt-1.5 break-words text-[11px] font-bold leading-5 text-white sm:text-sm">{qrLink.replace(/^https?:\/\//, "")}</p>
            </div>
            <div className="flex justify-center rounded-[24px] p-2">
              <QRCodeCanvas ref={qrCanvasRef} value={qrLink} size={160} bgColor="transparent" fgColor="#ffffff" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 rounded-2xl border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:border-white/50 hover:bg-white/20 sm:text-sm"
            >
              {copied ? "کپی شد" : "کپی لینک"}
            </button>
            <button
              type="button"
              onClick={handleDownloadQr}
              className="flex-1 rounded-2xl border border-white/25 bg-white/10 px-3.5 py-2 text-center text-xs font-semibold text-white transition hover:border-white/50 hover:bg-white/20 sm:text-sm"
            >
              دانلود QR
            </button>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-3xl border border-dashed border-white/25 bg-white/5 px-4 py-6 text-center text-xs text-white/70 sm:text-sm">
          هنوز توکن QR برای شما ثبت نشده است. برای صدور کد، از طریق مسئول پایگاه درخواست دهید.
        </div>
      )}
    </div>
  );
}
