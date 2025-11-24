"use client";

import QrPreview from "@/components/QrPreview";

type BasijQrCardProps = {
  token?: string;
};

export default function BasijQrCard({ token }: BasijQrCardProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
      <h3 className="text-base font-semibold text-white sm:text-lg">کد اختصاصی بسیجی</h3>
      <p className="mt-2 text-xs text-white/70 sm:text-sm">
        این QR برای ورود سریع یا ثبت حضور در پایگاه استفاده می‌شود. آن را فقط با مربی یا مسئول یگان به اشتراک بگذار.
      </p>
      {token ? (
        <div className="mt-4 flex justify-center">
          <QrPreview
            value={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://masjed.local"}/basij/scan?token=${token}`}
            minimal
          />
        </div>
      ) : (
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-6 text-center text-xs text-white/70 sm:text-sm">
          هنوز توکن QR برای شما ثبت نشده است.
        </div>
      )}
    </div>
  );
}
