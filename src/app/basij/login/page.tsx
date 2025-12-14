import { Suspense } from "react";
import BasijLoginForm from "./BasijLoginForm";

export default function BasijLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030d14]" />}>
      <BasijLoginForm />
    </Suspense>
  );
}
