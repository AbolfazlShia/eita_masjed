"use client";

import dynamic from "next/dynamic";

const LoginFormClient = dynamic(() => import("./LoginFormClient"), {
  ssr: false,
  loading: () => (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#030712] text-white">
      در حال بارگذاری فرم ورود...
    </div>
  ),
});

export default function LoginPage() {
  return <LoginFormClient />;
}
