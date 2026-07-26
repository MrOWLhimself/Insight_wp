export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function gaPageview(url: string) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: url });
}

export function gaEvent(action: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", action, params);
}
