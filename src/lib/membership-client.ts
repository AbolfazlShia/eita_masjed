"use client";

export type MembershipRole = "guest" | "active" | "manager";

export const MEMBERSHIP_STORAGE_KEY = "masjed-membership-role";

export function readStoredMembership(): MembershipRole {
  if (typeof window === "undefined") return "guest";
  try {
    const raw = window.localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
    if (!raw) return "guest";
    const value = JSON.parse(raw);
    if (value === "manager" || value === "active") return value;
    return "guest";
  } catch {
    return "guest";
  }
}

export function writeStoredMembership(role: MembershipRole) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify(role));
  } catch {
    // ignore storage issues
  }
}

export function clearStoredMembership() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(MEMBERSHIP_STORAGE_KEY);
  } catch {
    // ignore
  }
}
