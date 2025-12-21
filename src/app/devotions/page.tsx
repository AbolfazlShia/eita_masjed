import { Suspense } from "react";
import DevotionsClient from "./devotions-client";

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#030d14] text-white">
    در حال بارگذاری کتابخانه ادعیه...
  </div>
);

export default function DevotionsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DevotionsClient />
    </Suspense>
  );
}
