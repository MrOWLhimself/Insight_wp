"use client";

import { useEffect, useState } from "react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("pwa_install_dismissed")) setDismissed(true);
    } catch {}

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function handleInstall() {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem("pwa_install_dismissed", "1");
    } catch {}
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-ink text-paper p-4 flex items-center gap-3 shadow-lg z-50">
      <div className="flex-1">
        <p className="font-display font-bold text-sm">Install Insight Magazine</p>
        <p className="text-xs text-[#C7C7CC] mt-0.5">Quick access from your home screen.</p>
      </div>
      <button
        onClick={handleInstall}
        className="bg-orange text-white px-3 py-2 text-xs font-semibold whitespace-nowrap"
      >
        Install
      </button>
      <button onClick={handleDismiss} aria-label="Dismiss" className="text-[#9A9AA0] text-lg leading-none">
        ×
      </button>
    </div>
  );
}
