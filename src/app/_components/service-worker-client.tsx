"use client";

import { useEffect } from "react";

export function ServiceWorkerClient() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let unmounted = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        if (unmounted) return;

        if (registration.navigationPreload) {
          await registration.navigationPreload.enable();
        }

        // Auto-activate updated service workers
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      } catch (error) {
        console.error("[PWA] Service worker registration failed", error);
      }
    };

    register();

    return () => {
      unmounted = true;
    };
  }, []);

  return null;
}
