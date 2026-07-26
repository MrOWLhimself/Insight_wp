// lib/site-chrome.ts
//
// Fetches the same nav/settings/featured-places data your homepage uses for
// its Masthead, SideRailAds, and FeaturedPlaces sections — so any other page
// (bbnaija-s11, newsroom, and future ones) can render identical site chrome
// without duplicating the fetch logic in every file.

import { getCategories } from '@/lib/wordpress';
import { getNavMenu, getSiteSettings, getFeaturedPlaces, type NavMenuItem } from '@/lib/supabase';

function navFallback(categories: { id: number; name: string; slug: string }[]): NavMenuItem[] {
  return categories.map((c, i) => ({
    category_id: c.id,
    category_slug: c.slug,
    link_type: 'category' as const,
    custom_url: null,
    label: c.name,
    sort_order: i,
    visible: true,
  }));
}

export async function getSiteChrome() {
  const [categories, navItems, siteSettings, featuredPlaces] = await Promise.all([
    getCategories(),
    getNavMenu(),
    getSiteSettings(),
    getFeaturedPlaces(),
  ]);

  return {
    navItems: navItems.length > 0 ? navItems : navFallback(categories),
    siteSettings,
    featuredPlaces,
  };
}
