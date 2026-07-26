"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageview, trackEvent } from "@/lib/analytics-client";
import { gaPageview } from "@/lib/gtag";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageview(pathname);
    gaPageview(pathname);
  }, [pathname]);

  // Tracks any click on a link pointing to a different domain — this is
  // the "Clicks" data shown in the analytics dashboard (outbound clicks:
  // promo cards, YouTube, social shares, external references in articles).
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const link = (e.target as HTMLElement)?.closest("a");
      if (!link || !link.href) return;

      try {
        const linkHost = new URL(link.href).hostname;
        if (linkHost && linkHost !== window.location.hostname) {
          trackEvent("outbound_click", "engagement", link.href, window.location.pathname);
        }
      } catch {
        // ignore malformed hrefs (mailto:, tel:, javascript:, etc.)
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
}
