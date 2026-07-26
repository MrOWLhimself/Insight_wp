"use client";

// Mirrors citiplug.com's src/lib/analytics.js exactly (same tables, same
// session/device/source-parsing logic), just running in Next.js and
// writing platform: 'insight' instead of 'citiplug' — so both sites'
// data lands in the same analytics_pageviews/sessions/events tables and
// can be compared side by side in the CitiPlug admin's Analytics page.

import { getSupabasePublic } from "./supabase-public";

const PLATFORM = "insight";
const SESSION_KEY = "insight_session";

type Session = { id: string; startedAt: number; pageCount: number };

function getOrCreateSession(): Session {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) return JSON.parse(stored);
    const session: Session = {
      id: `ins_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      startedAt: Date.now(),
      pageCount: 0,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch {
    return { id: `ins_anon_${Date.now()}`, startedAt: Date.now(), pageCount: 0 };
  }
}

function updateSession(updates: Partial<Session>) {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const session = { ...JSON.parse(stored), ...updates };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {}
}

function parseSource(referrer: string) {
  if (!referrer) return { source: "direct", medium: "direct" };
  const url = referrer.toLowerCase();
  if (url.includes("google")) return { source: "google", medium: "organic" };
  if (url.includes("facebook") || url.includes("fb.com")) return { source: "facebook", medium: "social" };
  if (url.includes("twitter") || url.includes("x.com")) return { source: "twitter", medium: "social" };
  if (url.includes("instagram")) return { source: "instagram", medium: "social" };
  if (url.includes("whatsapp")) return { source: "whatsapp", medium: "social" };
  if (url.includes("tiktok")) return { source: "tiktok", medium: "social" };
  if (url.includes("linkedin")) return { source: "linkedin", medium: "social" };
  if (url.includes("youtube")) return { source: "youtube", medium: "social" };
  try {
    return { source: new URL(referrer).hostname, medium: "referral" };
  } catch {
    return { source: "unknown", medium: "referral" };
  }
}

function getDevice() {
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/.test(ua)) return "mobile";
  return "desktop";
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Chromium") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  return "Other";
}

function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  return "Other";
}

// Free-tier IP geolocation lookup, client-side. Best-effort only — if this
// fails (rate limit, network hiccup, ad-blocker), tracking still proceeds
// without location data rather than breaking the whole pageview.
const GEO_CACHE_KEY = "insight_geo_cache";

async function getGeography() {
  try {
    const cached = sessionStorage.getItem(GEO_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const geo = {
      country: data.country_name || null,
      countryCode: data.country_code || null,
      city: data.city || null,
    };
    try {
      sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geo));
    } catch {}
    return geo;
  } catch {
    return { country: null, countryCode: null, city: null };
  }
}

export async function trackPageview(page: string, pageTitle?: string) {
  const session = getOrCreateSession();
  const { source, medium } = parseSource(document.referrer);
  const isNew = session.pageCount === 0;

  updateSession({ pageCount: session.pageCount + 1 });

  // Session tracking is isolated in its own try/catch — a failure here
  // (geography lookup, a database error) must never prevent the pageview
  // itself from being recorded below.
  try {
    if (isNew) {
      const geo = await getGeography();
      const { error } = await getSupabasePublic().from("analytics_sessions").upsert(
        {
          id: session.id,
          platform: PLATFORM,
          started_at: new Date(session.startedAt).toISOString(),
          page_count: 1,
          device: getDevice(),
          browser: getBrowser(),
          os: getOS(),
          referrer: document.referrer || null,
          source,
          medium,
          is_bounce: true,
          country: geo.country,
          country_code: geo.countryCode,
          city: geo.city,
        },
        { onConflict: "id" }
      );
      if (error) console.error("Analytics session upsert error:", error);
    } else {
      const { error } = await getSupabasePublic()
        .from("analytics_sessions")
        .update({ page_count: session.pageCount + 1, is_bounce: false })
        .eq("id", session.id);
      if (error) console.error("Analytics session update error:", error);
    }
  } catch (err) {
    console.error("Analytics session tracking failed:", err);
  }

  try {
    const { error } = await getSupabasePublic().from("analytics_pageviews").insert({
      platform: PLATFORM,
      page,
      page_title: pageTitle || document.title,
      session_id: session.id,
      referrer: document.referrer || null,
      source,
      medium,
      device: getDevice(),
      browser: getBrowser(),
      os: getOS(),
    });
    if (error) console.error("Analytics pageview insert error:", error);
  } catch (err) {
    console.error("Analytics pageview tracking failed:", err);
  }
}

export async function trackEvent(eventName: string, eventCategory = "engagement", eventValue?: string, page?: string) {
  try {
    const session = getOrCreateSession();
    await getSupabasePublic().from("analytics_events").insert({
      platform: PLATFORM,
      event_name: eventName,
      event_category: eventCategory,
      event_value: eventValue ?? "",
      session_id: session.id,
      page: page ?? window.location.pathname,
    });
  } catch {}
}
