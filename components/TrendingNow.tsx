import Link from "next/link";
import Image from "next/image";
import { getTrendingSlugs } from "@/lib/supabase";
import { getPostBySlug, featuredImage, decodeEntities } from "@/lib/wordpress";
import { getPostBySlug as getInsightPostBySlug } from "@/lib/supabase-public";
import { adaptInsightPost } from "@/lib/insight-wp-adapter";

export default async function TrendingNow() {
  const trending = await getTrendingSlugs(7, 6);
  if (trending.length === 0) return null;

  const posts = await Promise.all(
    trending.map(async (t) => {
      // Try WordPress first (most posts still live there)...
      const wpPost = await getPostBySlug(t.slug);
      if (wpPost) return wpPost;

      // ...and fall back to Supabase (Newsroom, BBNaija S11, any future
      // insight_posts content) if it's not a WordPress post. Without this
      // fallback, a trending Supabase-authored page would silently vanish
      // here even while genuinely getting real views.
      const insightPost = await getInsightPostBySlug(t.slug);
      if (insightPost) return adaptInsightPost(insightPost);

      return null;
    })
  );

  const valid = posts.filter(Boolean) as NonNullable<(typeof posts)[number]>[];
  if (valid.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 my-16">
      <h2 className="font-display font-extrabold text-3xl text-ink border-b border-rule pb-3 mb-8">
        Trending Now
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {valid.map((post, i) => {
          const img = featuredImage(post);
          return (
            <Link key={post.id} href={`/${post.slug}`} className="story-link group flex gap-4">
              <span className="font-script text-4xl text-orange leading-none flex-shrink-0 w-8">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="relative w-full aspect-video bg-ink/5 mb-3">
                  {img && (
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <h3 className="story-title font-display font-bold text-base leading-snug">
                  {decodeEntities(post.title.rendered)}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
