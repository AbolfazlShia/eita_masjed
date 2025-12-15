"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type QrPreviewProps = {
  value: string;
  label?: string;
  size?: number;
  description?: string;
  minimal?: boolean;
  allowDownload?: boolean;
  downloadFileName?: string;
  downloadLabel?: string;
  downloadButtonClassName?: string;
  frameClassName?: string;
  fgColor?: string;
  bgColor?: string;
  copyButtonLabel?: string;
  copiedButtonLabel?: string;
};

export default function QrPreview({
  value,
  label,
  size = 180,
  description,
  minimal = false,
  allowDownload = false,
  downloadFileName,
  downloadLabel = "دانلود QR",
  downloadButtonClassName = "rounded-2xl border border-white/20 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-white/60",
  frameClassName = "rounded-[28px] border border-white/15 bg-white/5 p-4 shadow-[0_15px_45px_rgba(0,0,0,0.45)]",
  fgColor = "#ffffff",
  bgColor = "transparent",
  copyButtonLabel = "کپی لینک",
  copiedButtonLabel = "کپی شد",
}: QrPreviewProps) {
  const [copied, setCopied] = useState(false);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const showMeta = !minimal;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }
  };

  const handleDownload = () => {
    try {
      const canvas = canvasHostRef.current?.querySelector("canvas");
      if (!(canvas instanceof HTMLCanvasElement)) throw new Error("missing_canvas");
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeFile = (downloadFileName?.trim() || "qr-code").replace(/[^a-zA-Z0-9\u0600-\u06FF_-]+/g, "-");
      link.href = dataUrl;
      link.download = `${safeFile || "qr-code"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("QR download failed", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {showMeta && label && <p className="text-sm font-semibold text-white/80">{label}</p>}
      <div ref={canvasHostRef} className={frameClassName}>
        <QRCodeCanvas value={value} size={size} bgColor={bgColor} fgColor={fgColor} />
      </div>
      {showMeta && description && <p className="text-xs text-white/70">{description}</p>}
      {showMeta && (
        <>
          <code className="max-w-full truncate rounded-2xl border border-white/15 px-3 py-1 text-xs text-white/70">{value}</code>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-2xl border border-emerald-300/40 bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-1.5 text-xs font-semibold text-emerald-950 transition hover:scale-[1.02]"
          >
            {copied ? copiedButtonLabel : copyButtonLabel}
          </button>
        </>
      )}
      {allowDownload && (
        <button type="button" onClick={handleDownload} className={downloadButtonClassName}>
          {downloadLabel}
        </button>
      )}
    </div>
  );
}
