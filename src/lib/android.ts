export const ANDROID_DESK_REMEMBER_KEY = "masjed-android-desk-remember";
const ANDROID_EXIT_ACK_KEYS = {
  manager: "masjed-android-manager-exit-ack",
  basij: "masjed-android-basij-exit-ack",
} as const;

type AndroidDeskOrigin = keyof typeof ANDROID_EXIT_ACK_KEYS;

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
    Object.values(ANDROID_EXIT_ACK_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
    (window as any).MasjedBridge?.postMessage?.(
      JSON.stringify({ type: "clearDeskShortcut" })
    );
  } catch {
    // ignore errors
  }
}

export function exitAndroidApp() {
  if (typeof window === "undefined") return;
  try {
    (window as any).MasjedBridge?.postMessage?.(
      JSON.stringify({ type: "exitApp" })
    );
  } catch {
    // ignore errors
  }
}

export function isAndroidInAppContext(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("inApp") === "1" && params.get("source") === "android";
  } catch {
    return false;
  }
}

function exitAckKey(origin: AndroidDeskOrigin): string {
  return ANDROID_EXIT_ACK_KEYS[origin];
}

export function hasAndroidExitAck(origin: AndroidDeskOrigin): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(exitAckKey(origin)) === "ack";
  } catch {
    return false;
  }
}

export function markAndroidExitAck(origin: AndroidDeskOrigin) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(exitAckKey(origin), "ack");
    (window as any).MasjedBridge?.postMessage?.(
      JSON.stringify({ type: "ackDeskExit", origin })
    );
  } catch {
    // ignore errors
  }
}
