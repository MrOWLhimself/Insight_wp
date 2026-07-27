// app/culture/page.tsx
//
// Dedicated Culture & Heritage landing page - merges the "culture" and
// "heritage" categories (both WordPress and Supabase sides) into one
// editorial, magazine-style layout. Overrides the generic category view
// at this specific path, same pattern as /events and /bbnaija-s11.

import Link from "next/link";
import Image from "next/image";
import { getUnifiedCategory } from "@/lib/unified-posts";
import { getSiteChrome } from "@/lib/site-chrome";
import { getComparableDate, featuredImage, decodeEntities, primaryCategoryName } from "@/lib/wordpress";
import Masthead from "@/components/Masthead";
import SideRailAds from "@/components/SideRailAds";
import FeaturedPlaces from "@/components/FeaturedPlaces";
import Footer from "@/components/Footer";
import CategoryBadge from "@/components/CategoryBadge";

export const revalidate = 120;

export const metadata = {
  title: "Culture & Heritage | Insight Magazine",
  description: "Stories rooted in tradition - festivals, history, and the customs that shape identity across Ijebu and beyond.",
};

export default async function CultureHeritagePage() {
  // "culture-heritage" is the real, existing WordPress category slug
  // (your nav item already points here). Also merging in "culture" and
  // "heritage" as separate slugs in case any Supabase posts used those
  // simpler names instead - nothing gets missed either way.
  const [combined, culture, heritage, chrome] = await Promise.all([
    getUnifiedCategory("culture-heritage"),
    getUnifiedCategory("culture"),
    getUnifiedCategory("heritage"),
    getSiteChrome(),
  ]);

  const seen = new Set<string>();
  const posts = [...(combined?.posts ?? []), ...(culture?.posts ?? []), ...(heritage?.posts ?? [])]
    .filter((p) => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    })
    .sort((a, b) => getComparableDate(b) - getComparableDate(a));

  const [lead, second, third, ...rest] = posts;

  return (
    <>
      <Masthead navItems={chrome.navItems} siteSettings={chrome.siteSettings} />
      <SideRailAds />

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <header className="mb-10 border-b-4 border-double pb-6" style={{ borderColor: "#92400e" }}>
          <p className="mb-2 font-serif text-xs uppercase tracking-[0.3em] text-amber-800">Est. in the stories we keep</p>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Culture &amp; Heritage
          </h1>
          <p className="mt-3 max-w-2xl font-serif text-lg italic text-gray-600">
            Traditions, festivals, and the history that continues to shape who we are.
          </p>
        </header>

        {lead && (
          <section className="mb-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            <Link href={`/${lead.slug}`} className="group block md:col-span-2">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
                {featuredImage(lead) && (
                  <Image src={featuredImage(lead)!.url} alt={featuredImage(lead)!.alt} fill className="object-cover" priority />
                )}
              </div>
              <CategoryBadge category={primaryCategoryName(lead)} className="mt-4" />
              <h2 className="mt-2 font-serif text-3xl font-bold leading-tight group-hover:underline">
                {decodeEntities(lead.title.rendered)}
              </h2>
            </Link>

            <div className="flex flex-col gap-6 divide-y divide-gray-200">
              {[second, third].filter(Boolean).map((post) => (
                <Link key={post!.id} href={`/${post!.slug}`} className="group block pt-6 first:pt-0">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100">
                    {featuredImage(post!) && (
                      <Image src={featuredImage(post!)!.url} alt={featuredImage(post!)!.alt} fill className="object-cover" />
                    )}
                  </div>
                  <CategoryBadge category={primaryCategoryName(post!)} className="mt-3" />
                  <h3 className="mt-2 font-serif text-lg font-bold leading-snug group-hover:underline">
                    {decodeEntities(post!.title.rendered)}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {rest.length > 0 && (
          <section>
            <h2 className="mb-6 border-b border-gray-300 pb-3 font-serif text-2xl font-bold">
              More Stories
            </h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link key={post.id} href={`/${post.slug}`} className="group block">
                  <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-gray-100">
                    {featuredImage(post) && (
                      <Image src={featuredImage(post)!.url} alt={featuredImage(post)!.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <CategoryBadge category={primaryCategoryName(post)} className="mt-3" />
                  <h3 className="mt-2 font-serif text-xl font-bold leading-snug group-hover:underline">
                    {decodeEntities(post.title.rendered)}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {posts.length === 0 && (
          <p className="text-gray-500">No culture or heritage stories published yet - check back soon.</p>
        )}
      </main>

      <FeaturedPlaces title="Featured Places" places={chrome.featuredPlaces} />
      <Footer />
    </>
  );
}
