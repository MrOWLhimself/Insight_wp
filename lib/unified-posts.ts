// lib/unified-posts.ts
//
// Merges WordPress posts and Supabase (insight_posts) posts into a single
// list, all in the same WPPost shape (via adaptInsightPost), sorted by
// real publish time (getComparableDate). This is what makes "Recent Posts"
// / "More Like This" identical everywhere, regardless of which post is
// being viewed or where the recommended posts actually live.

import { getPosts, getComparableDate, type WPPost } from '@/lib/wordpress';
import { getAllPublishedPosts } from '@/lib/supabase-public';
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
