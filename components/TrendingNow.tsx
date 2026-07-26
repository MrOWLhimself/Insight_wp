import Link from "next/link";
import Image from "next/image";
import { getTrendingSlugs } from "@/lib/supabase";
import { getPostBySlug, featuredImage, decodeEntities } from "@/lib/wordpress";

export default async function TrendingNow() {
  const trending = await getTrendingSlugs(7, 6);
  if (trending.length === 0) return null;

  const posts = await Promise.all(trending.map((t) => getPostBySlug(t.slug)));
  const valid = posts
    .map((post, i) => (post ? { post, views: trending[i].views } : null))
    .filter(Boolean) as { post: NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>; views: number }[];

  if (valid.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 my-16">
      <h2 className="font-display font-extrabold text-3xl text-ink border-b border-rule pb-3 mb-8">
        Trending Now
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {valid.map(({ post, views }, i) => {
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
                <span className="eyebrow block mt-1">{views} views this week</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
