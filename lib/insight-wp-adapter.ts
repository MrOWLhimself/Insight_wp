// lib/insight-wp-adapter.ts
//
// Your Hero, HeroSideCard, LatestPosts, LatestPostsList, and StoryCard
// components all expect a WPPost-shaped object (post.title.rendered,
// featuredImage(post), primaryCategoryName(post), etc.). Rather than
// touching any of those components, this adapter reshapes a Supabase
// insight_posts row into that exact same shape, so it can be dropped
// straight into the same arrays as real WordPress posts with zero
// changes anywhere else.

import type { WPPost } from '@/lib/wordpress';
import type { PublishedPost } from '@/lib/supabase-public';

// Turns a UUID into a stable numeric hash — only used to satisfy WPPost's
// `id: number` type for React keys; never sent to any real WordPress API.
function hashToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function adaptInsightPost(post: PublishedPost): WPPost {
  const categoryName = post.insight_categories?.name ?? 'News';
  const categorySlug = post.insight_categories?.slug ?? 'news';

  return {
    id: hashToNumber(post.id),
    slug: post.slug,
    date: post.published_at ?? new Date().toISOString(),
    title: { rendered: post.title },
    excerpt: { rendered: post.excerpt ?? '' },
    content: { rendered: '' }, // never read on homepage cards/lists
    categories: [],
    _embedded: {
      'wp:featuredmedia': post.cover_image_url
        ? [
            {
              source_url: post.cover_image_url,
              media_details: { width: 1600, height: 900 },
              alt_text: post.title,
            },
          ]
        : undefined,
      author: [{ name: 'Insight Editorial' }],
      'wp:term': [[{ id: 0, name: categoryName, slug: categorySlug }]],
    },
  } as unknown as WPPost;
}
