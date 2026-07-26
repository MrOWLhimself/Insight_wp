import Link from "next/link";
import Image from "next/image";
import { getPosts, getCategories, featuredImage, decodeEntities } from "@/lib/wordpress";
import { getNavMenu, getSiteSettings, type NavMenuItem } from "@/lib/supabase";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";

function navFallback(categories: { id: number; name: string; slug: string }[]): NavMenuItem[] {
  return categories.map((c, i) => ({
    category_id: c.id,
    category_slug: c.slug,
    link_type: "category" as const,
    custom_url: null,
    label: c.name,
    sort_order: i,
    visible: true,
  }));
}

export default async function NotFound() {
  const [categories, navItems, siteSettings, recentPosts] = await Promise.all([
    getCategories(),
    getNavMenu(),
    getSiteSettings(),
    getPosts({ perPage: 4 }),
  ]);

  return (
    <>
      <Masthead
        navItems={navItems.length > 0 ? navItems : navFallback(categories)}
        siteSettings={siteSettings}
      />

      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <span className="font-script text-3xl text-orange">Page not found</span>
        <h1 className="font-display font-extrabold text-5xl md:text-6xl text-ink mt-4 mb-6">
          404
        </h1>
        <p className="text-ink-soft text-lg max-w-md mx-auto mb-10">
          This page doesn't exist — it may have moved, or the link might be
          out of date. Here's what's happening on Insight Magazine right now.
        </p>
        <Link
          href="/"
          className="inline-block bg-ink text-paper px-8 py-3 font-semibold text-sm mb-16"
        >
          Back to Homepage
        </Link>
      </main>

      {recentPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="font-display font-extrabold text-2xl text-ink border-b border-rule pb-3 mb-8 text-center">
            Latest Stories
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recentPosts.map((post) => {
              const img = featuredImage(post);
              return (
                <Link key={post.id} href={`/${post.slug}`} className="story-link group block">
                  <div className="relative w-full aspect-square overflow-hidden bg-ink/5 mb-3">
                    {img && (
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h3 className="story-title font-display font-bold text-sm leading-snug text-ink">
                    {decodeEntities(post.title.rendered)}
                  </h3>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
