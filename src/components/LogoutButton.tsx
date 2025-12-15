"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearAndroidDeskState, exitAndroidApp } from "@/lib/android";
import { writeStoredMembership, type MembershipRole } from "@/lib/membership-client";

type LogoutButtonProps = {
  endpoint: string;
  redirectTo: string;
  label?: string;
  loadingLabel?: string;
  className?: string;
  clearAndroidState?: boolean;
  resetMembershipTo?: MembershipRole;
};

export default function LogoutButton({
  endpoint,
  redirectTo,
  label = "خروج",
  loadingLabel = "در حال خروج...",
  className = "",
  clearAndroidState = false,
  resetMembershipTo = "guest",
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch(endpoint, { method: "POST" });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      if (resetMembershipTo) {
        writeStoredMembership(resetMembershipTo);
      }
      if (clearAndroidState) {
        clearAndroidDeskState();
      }
      router.replace(redirectTo);
      router.refresh();
      if (clearAndroidState) {
        setTimeout(() => {
          exitAndroidApp();
        }, 600);
        return;
      }
      setTimeout(() => setLoading(false), 400);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-40 ${className}`}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
