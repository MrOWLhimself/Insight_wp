// lib/supabase-public.ts
//
// A second, read-only Supabase client for pulling content that lives in the
// database (insight_posts) rather than WordPress. Safe to use in Server
// Components since it only ever reads publicly-published rows — RLS on
// insight_posts already restricts anonymous access to status = 'published'.
//
// Add these two values to your Vercel project's Environment Variables
// (Settings → Environment Variables) for Production, Preview, and Development:
//
//   NEXT_PUBLIC_SUPABASE_URL=https://uysipsegizbixwgvwdzl.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon/publishable key from your Supabase project settings>
//
// Don't hardcode the key directly in source — even though it's a public-safe
// anon key, env vars keep it swappable if you ever rotate it.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

/**
 * Kept for backward compatibility — components/AnalyticsTracker.tsx (and
 * possibly other existing files) import this function name from this file.
 * Do not remove; it just returns the same client instance above.
 */
export function getSupabasePublic() {
  return supabasePublic;
}

export type HousemateProfile = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: {
    post_type: string;
    housemate: {
      known_as: string;
      age?: number;
      state_of_origin?: string;
      occupation?: string;
      personality_tags?: string[];
      entry_quote?: string;
      why_they_entered?: string;
      first_impression?: string;
      reveal_order?: number;
    };
    body: { type: string; text: string }[];
  };
  cover_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  published_at: string | null;
};

/** Fetch all published posts in a category, ordered by reveal_order. */
export async function getCategoryPosts(categorySlug: string) {
  const { data: category } = await supabasePublic
    .from('insight_categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) return [];

  const { data, error } = await supabasePublic
    .from('insight_posts')
    .select(
      'id, title, slug, excerpt, content, cover_image_url, seo_title, seo_description, canonical_url, published_at'
    )
    .eq('category', category.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('getCategoryPosts error:', error.message);
    return [];
  }

  // Sort by reveal_order when present (falls back to published_at order otherwise)
  return (data as HousemateProfile[]).sort((a, b) => {
    const ra = a.content?.housemate?.reveal_order ?? 999;
    const rb = b.content?.housemate?.reveal_order ?? 999;
    return ra - rb;
  });
}

/** Fetch a single published post by slug. */
export async function getPostBySlug(slug: string) {
  const { data, error } = await supabasePublic
    .from('insight_posts')
    .select(
      'id, title, slug, excerpt, content, cover_image_url, seo_title, seo_description, canonical_url, published_at'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) return null;
  return data as HousemateProfile;
}
