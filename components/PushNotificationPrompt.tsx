"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function PushNotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "default") return;

    try {
      if (sessionStorage.getItem("push_prompt_dismissed")) return;
    } catch {}

    navigator.serviceWorker.register("/sw.js").catch(() => {});

    // Give the reader a moment on the page before asking — asking
    // instantly on page load has a much lower opt-in rate.
    const timer = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  async function handleEnable() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setShow(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setShow(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await fetch("/api/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
    } catch {
      // Not fatal — reader just won't get push notifications this session
    }
    setShow(false);
  }

  function handleDismiss() {
    setShow(false);
    try {
      sessionStorage.setItem("push_prompt_dismissed", "1");
    } catch {}
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-80 bg-white border border-rule p-4 flex items-center gap-3 shadow-lg z-50">
      <div className="flex-1">
        <p className="font-display font-bold text-sm text-ink">Get notified of new stories?</p>
        <p className="text-xs text-ink-soft mt-0.5">We'll only ping you when something's published.</p>
      </div>
      <button
        onClick={handleEnable}
        className="bg-orange text-white px-3 py-2 text-xs font-semibold whitespace-nowrap"
      >
        Enable
      </button>
      <button onClick={handleDismiss} aria-label="Dismiss" className="text-ink-soft text-lg leading-none">
        ×
      </button>
    </div>
  );
}
