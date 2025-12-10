export const ANDROID_DESK_REMEMBER_KEY = "masjed-android-desk-remember";

export function writeAndroidDeskRememberState(persistent: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      ANDROID_DESK_REMEMBER_KEY,
      JSON.stringify({ persistent: Boolean(persistent) })
    );
  } catch {
    // ignore storage failures
  }
}

export function clearAndroidDeskState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ANDROID_DESK_REMEMBER_KEY);
    (window as any).MasjedBridge?.postMessage?.(
      JSON.stringify({ type: "clearDeskShortcut" })
    );
  } catch {
    // ignore errors
  }
}
