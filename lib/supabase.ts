import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only client — this app only READS from these tables now.
// All writes (homepage sections, nav menu, branding, promo cards) happen
// from the CitiPlug admin's Insight tab, which talks to Supabase directly
// from the browser (with its own RLS policies gated on profiles.role =
// 'admin'). This file used to also contain write functions for a
// standalone Next.js admin UI — that's been removed in favor of the
// CitiPlug admin, so only reads (plus the public newsletter signup) live
// here now.
//
// The client is created lazily (only on first actual use), not at module
// load time. Next.js executes top-level module code during its build-time
// "Collecting page data" step for every route that imports this file — if
// createClient() ran eagerly there and env vars weren't in scope for that
// specific build phase, the whole build fails with "supabaseUrl is
// required" even though the app would work fine at runtime. Lazy init
// avoids that entirely: the client is only ever constructed when a
// request actually comes in.

let _client: SupabaseClient | null = null;

export function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (check Vercel's Environment Variables)."
    );
  }

  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

export type HomepageSection = {
  id: number;
  section_key: string;
  label: string;
  display_type: "hero" | "spotlight" | "grid" | "latest" | "promo" | "places";
  category_id: number | null;
  category_name: string | null;
  sort_order: number;
  enabled: boolean;
  is_removable: boolean;
};

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const { data, error } = await getClient()
    .from("homepage_sections")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export type NavMenuItem = {
  id?: number;
  category_id: number | null;
  category_slug: string | null;
  link_type: "category" | "custom";
  custom_url: string | null;
  label: string;
  sort_order: number;
  visible: boolean;
};

export async function getNavMenu(): Promise<NavMenuItem[]> {
  const { data, error } = await getClient()
    .from("nav_menu")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export type SiteSettings = {
  logo_type: "text" | "image";
  logo_text: string;
  logo_image_url: string;
  youtube_url: string;
  youtube_title: string;
  youtube_description: string;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await getClient().from("site_settings").select("key, value");
  if (error) throw error;

  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = row.value ?? "";

  return {
    logo_type: (map.logo_type as "text" | "image") || "text",
    logo_text: map.logo_text || "INSIGHT",
    logo_image_url: map.logo_image_url || "",
    youtube_url: map.youtube_url || "https://youtube.com/@tasuedfinest",
    youtube_title: map.youtube_title || "Subscribe to Tall Dreaded Guy on YouTube",
    youtube_description:
      map.youtube_description ||
      "Behind-the-scenes coverage, event recaps, and campus documentaries — before they hit the site.",
  };
}

export type PromoCard = {
  id: number;
  badge_label: string;
  title: string;
  image_url: string | null;
  link_url: string;
  sort_order: number;
  enabled: boolean;
};

export async function getPromoCards(): Promise<PromoCard[]> {
  const { data, error } = await getClient()
    .from("promo_cards")
    .select("*")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ================= Featured CitiPlug places =================
// Curated cross-promotion of real CitiPlug listings, distinct from the
// "Need More Fun Stuff" promo cards — these link to real, live place pages
// on citiplug.com rather than arbitrary external URLs.

export type FeaturedPlace = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  category: string | null;
  image_url: string | null;
  rating_average: number | null;
  area: string | null;
};

export async function getFeaturedPlaces(): Promise<FeaturedPlace[]> {
  const { data, error } = await getClient()
    .from("featured_places")
    .select(
      `sort_order, places ( id, name, slug, short_description, category, cover_image, image_url, rating_average, area )`
    )
    .eq("enabled", true)
    .order("sort_order", { ascending: true })
    .limit(5);

  if (error) throw error;

  return (data ?? [])
    .map((row: any) => row.places)
    .filter(Boolean)
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      short_description: p.short_description,
      category: p.category,
      image_url: p.cover_image || p.image_url || null,
      rating_average: p.rating_average,
      area: p.area,
    }));
}

export type TrendingSlug = { slug: string; views: number };

// Real "Most Read" data — pulls from the analytics_pageviews table this
// site is already writing to, no separate tracking needed.
export async function getTrendingSlugs(days = 7, limit = 6): Promise<TrendingSlug[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await getClient()
    .from("analytics_pageviews")
    .select("page")
    .eq("platform", "insight")
    .gte("created_at", since);

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const slug = (row.page || "").replace(/^\//, "");
    if (!slug || slug === "search") continue;
    counts[slug] = (counts[slug] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([slug, views]) => ({ slug, views }));
}

// ================= Shared About / Team content =================
// Same content, read by both magazine.citiplug.com and citiplug.com.

export type TeamMember = {
  id: number;
  name: string;
  role: string | null;
  bio: string | null;
  photo_url: string | null;
};

export async function getAboutContent(): Promise<{ title: string; body: string }> {
  const { data, error } = await getClient().from("site_about").select("title, body").eq("id", 1).single();
  if (error) throw error;
  return data;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await getClient()
    .from("team_members")
    .select("id, name, role, bio, photo_url")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ================= Ad slots (real campaign system) =================
// ad_slots defines each placement's mode (manual/automatic/both) — this
// project already has a full campaign system built for citiplug.com;
// these rows extend the same system to Insight Magazine. A sold manual
// campaign takes priority; Google (AdSense) fills the gap when unsold.

export type AdCampaign = {
  id: string;
  name: string;
  image_url: string | null;
  destination_url: string | null;
  alt_text: string | null;
};

export type AdSlotConfig = {
  slot_key: string;
  ad_mode: "manual" | "automatic" | "both";
  network_code: string | null;
  active: boolean;
  campaign: AdCampaign | null;
};

export async function getAdSlotConfig(slotKey: string): Promise<AdSlotConfig | null> {
  const { data: slot, error } = await getClient()
    .from("ad_slots")
    .select("slot_key, ad_mode, network_code, active")
    .eq("slot_key", slotKey)
    .eq("platform", "insight")
    .eq("active", true)
    .maybeSingle();

  if (error || !slot) return null;

  let campaign: AdCampaign | null = null;

  if (slot.ad_mode === "manual" || slot.ad_mode === "both") {
    const now = new Date().toISOString();
    const { data: campaigns } = await getClient()
      .from("ad_campaigns")
      .select("id, name, image_url, destination_url, alt_text")
      .eq("slot", slotKey)
      .eq("platform", "insight")
      .eq("status", "active")
      .lte("starts_at", now)
      .gte("ends_at", now)
      .order("priority", { ascending: false })
      .limit(1)
      .maybeSingle();

    campaign = campaigns ?? null;

    // Fire-and-forget impression count — simplified (counts every render,
    // including bots); fine for now, a client-side beacon would be more
    // precise if this matters later.
    if (campaign) {
      getClient()
        .rpc("increment_ad_impression", { campaign_id: campaign.id })
        .then(
          () => {},
          () => {}
        );
    }
  }

  return { ...slot, campaign };
}
// The one write this app still does — public-facing (footer signup form),
// not an admin action.

// ================= Newsletter subscribers =================
// The one write this app still does — public-facing (footer signup form),
// not an admin action.

export async function addSubscriber(email: string) {
  const { error } = await getClient()
    .from("subscribers")
    .upsert({ email: email.toLowerCase().trim(), is_active: true }, { onConflict: "email" });
  if (error) throw error;
}
