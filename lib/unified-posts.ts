// lib/unified-posts.ts
//
// Merges WordPress posts and Supabase (insight_posts) posts into a single
// list, all in the same WPPost shape (via adaptInsightPost), sorted by
// real publish time (getComparableDate). This is what makes "Recent Posts"
// / "More Like This" identical everywhere, regardless of which post is
// being viewed or where the recommended posts actually live.

import { getPosts, getCategoryBySlug, getComparableDate, type WPPost } from '@/lib/wordpress';
import { getAllPublishedPosts, getCategoryPosts, getCategoryInfo } from '@/lib/supabase-public';
import { adaptInsightPost } from '@/lib/insight-wp-adapter';

export async function getUnifiedRecentPosts(limit = 10): Promise<WPPost[]> {
  const [wpPosts, insightPosts] = await Promise.all([
    getPosts({ perPage: limit }),
    getAllPublishedPosts(limit),
  ]);

  const adapted = insightPosts.map(adaptInsightPost);

  return [...wpPosts, ...adapted]
    .sort((a, b) => getComparableDate(b) - getComparableDate(a))
    .slice(0, limit);
}

// Merges a category page across BOTH systems by matching URL slug — a
// WordPress category (e.g. "entertainment") and a Supabase insight_category
// with the same slug are treated as the same section. Returns null only if
// NEITHER system has a category at that slug (a real 404 case).
export async function getUnifiedCategory(slug: string) {
  const [wpCategory, insightCategory] = await Promise.all([
    getCategoryBySlug(slug),
    getCategoryInfo(slug),
  ]);

  if (!wpCategory && !insightCategory) return null;

  const [wpPosts, insightPostsRaw] = await Promise.all([
    wpCategory ? getPosts({ category: wpCategory.id, perPage: 20 }) : Promise.resolve([]),
    getCategoryPosts(slug),
  ]);

  const categoryLabel = wpCategory?.name ?? insightCategory?.name ?? slug;
  const adaptedInsight = insightPostsRaw.map((p) =>
    adaptInsightPost({ ...p, insight_categories: { name: categoryLabel, slug } } as any)
  );
  const posts = [...wpPosts, ...adaptedInsight].sort(
    (a, b) => getComparableDate(b) - getComparableDate(a)
  );

  return {
    name: categoryLabel,
    slug,
    posts,
  };
}
