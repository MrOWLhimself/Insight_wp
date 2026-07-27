import { MetadataRoute } from "next";
import { getPosts, getCategories, getTags } from "@/lib/wordpress";
import { getAllPublishedPosts } from "@/lib/supabase-public";
import { SITE_URL } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, tags, insightPosts] = await Promise.all([
    getPosts({ perPage: 100 }),
    getCategories(),
    getTags(),
    getAllPublishedPosts(200),
  ]);

  const postEntries = posts.map((post) => ({
    url: `${SITE_URL}/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryEntries = categories.map((cat) => ({
    url: `${SITE_URL}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const tagEntries = tags.map((tag) => ({
    url: `${SITE_URL}/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Supabase-authored posts (BBNaija S11 profiles, Newsroom articles, and
  // any future content published straight to insight_posts). These resolve
  // through the same /[slug] fallback as WordPress posts, so the URL shape
  // matches exactly — no separate /newsroom or /bbnaija-s11 prefix needed.
  const insightEntries = insightPosts.map((post) => ({
    url: `${SITE_URL}/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // The two Supabase-backed landing pages themselves.
  const insightLandingEntries = [
    {
      url: `${SITE_URL}/bbnaija-s11`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/newsroom`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
  ];

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    ...categoryEntries,
    ...tagEntries,
    ...postEntries,
    ...insightEntries,
    ...insightLandingEntries,
  ];
}
