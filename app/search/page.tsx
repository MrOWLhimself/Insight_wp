import Link from "next/link";
import Image from "next/image";
import {
  searchPosts,
  getCategories,
  featuredImage,
  primaryCategoryName,
  decodeEntities,
  stripHtml,
} from "@/lib/wordpress";
import { getNavMenu, getSiteSettings, type NavMenuItem } from "@/lib/supabase";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 60;

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

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q ?? "";

  const [results, categories, navItems, siteSettings] = await Promise.all([
    searchPosts(query),
    getCategories(),
    getNavMenu(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Masthead
        navItems={navItems.length > 0 ? navItems : navFallback(categories)}
        siteSettings={siteSettings}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />

      <main className="max-w-4xl mx-auto px-6 py-14">
        <form action="/search" method="GET" className="mb-10">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search Insight Magazine…"
            className="w-full border border-rule bg-paper px-5 py-4 text-lg font-display"
            autoFocus
          />
        </form>

        {query ? (
          <>
            <p className="eyebrow mb-8">
              {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
            </p>
            <div className="flex flex-col gap-8">
              {results.map((post) => {
                const img = featuredImage(post);
                return (
                  <Link
                    key={post.id}
                    href={`/${post.slug}`}
                    className="grid grid-cols-[140px_1fr] gap-5 items-start story-link"
                  >
                    <div className="relative w-full aspect-square bg-ink/5">
                      {img && (
                        <Image src={img.url} alt={img.alt} fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <span className="eyebrow block mb-1">{primaryCategoryName(post)}</span>
                      <h3 className="story-title font-display font-extrabold text-lg leading-snug mb-2">
                        {decodeEntities(post.title.rendered)}
                      </h3>
                      <p className="text-ink-soft text-sm leading-relaxed line-clamp-2">
                        {stripHtml(post.excerpt.rendered)}
                      </p>
                    </div>
                  </Link>
                );
              })}
              {results.length === 0 && (
                <p className="text-ink-soft">
                  No stories found for "{query}" — try a different search term.
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-ink-soft">Type something above to search Insight Magazine.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
