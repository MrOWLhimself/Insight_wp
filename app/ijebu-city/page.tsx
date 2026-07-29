// app/ijebu-city/page.tsx
//
// Dedicated Ijebu City landing page - deliberately different from Sports
// (dark/bold), Culture & Heritage (serif/editorial), and Events
// (photo-grid). This one is meant to feel like a genuine local civic hub:
// warm, community-focused, with a terracotta/green palette nodding to
// Ijebu's own visual identity.
//
// Chairman Spotlight and Business Spotlight pull posts tagged via
// secondary_categories (["chairman-spotlight"] / ["business-spotlight"]) -
// the same mechanism already built for the Ijebu tag itself. Tag a future
// post that way and it appears here automatically, no code changes needed.

import Link from "next/link";
import Image from "next/image";
import { getUnifiedCategory } from "@/lib/unified-posts";
import { getCategoryPosts } from "@/lib/supabase-public";
import { adaptInsightPost } from "@/lib/insight-wp-adapter";
import { getSiteChrome } from "@/lib/site-chrome";
import { featuredImage, decodeEntities, getComparableDate } from "@/lib/wordpress";
import Masthead from "@/components/Masthead";
import SideRailAds from "@/components/SideRailAds";
import FeaturedPlaces from "@/components/FeaturedPlaces";
import Footer from "@/components/Footer";
import CategoryBadge from "@/components/CategoryBadge";
import AdSlot from "@/components/AdSlot";
import type { WPPost } from "@/lib/wordpress";

export const revalidate = 120;

export const metadata = {
  title: "Ijebu City | Insight Magazine",
  description: "News, business, leadership, and the pulse of Ijebu, all in one place.",
};

async function getSpotlight(tag: string): Promise<WPPost | null> {
  const posts = await getCategoryPosts(tag);
  if (posts.length === 0) return null;
  return adaptInsightPost(posts[0]);
}

export default async function IjebuCityPage() {
  const [ijebu, chairmanSpotlight, businessSpotlight, chrome] = await Promise.all([
    getUnifiedCategory("ijebu"),
    getSpotlight("chairman-spotlight"),
    getSpotlight("business-spotlight"),
    getSiteChrome(),
  ]);

  const posts = ijebu?.posts ?? [];
  const [lead, ...rest] = posts;
  const trending = [...rest].sort((a, b) => getComparableDate(b) - getComparableDate(a)).slice(0, 5);
  const newsGrid = rest.slice(5);

  return (
    <>
      <Masthead navItems={chrome.navItems} siteSettings={chrome.siteSettings} />
      <SideRailAds />

      <div className="bg-[#fdf8f3]">
        {/* Hero */}
        <div className="relative w-full">
          <div className="relative mx-auto aspect-[16/6] w-full max-w-7xl overflow-hidden md:rounded-b-2xl">
            {lead && featuredImage(lead) && (
              <Image
                src={featuredImage(lead)!.url}
                alt={featuredImage(lead)!.alt}
                fill
                className="object-cover"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-start justify-end p-6 md:p-12">
              <span className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest text-white" style={{ backgroundColor: "#c2410c" }}>
                Ijebu City
              </span>
              <h1 className="max-w-2xl text-2xl font-extrabold leading-tight text-white md:text-4xl">
                The pulse of Ijebu, news, business and leadership, all in one place.
              </h1>
              {lead && (
                <Link href={`/${lead.slug}`} className="mt-3 text-sm font-semibold text-white underline underline-offset-4">
                  {decodeEntities(lead.title.rendered)} &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          {/* Chairman + Business Spotlight */}
          <section className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border-2" style={{ borderColor: "#166534" }}>
              <div className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-white" style={{ backgroundColor: "#166534" }}>
                Local Government Chairman Spotlight
              </div>
              {chairmanSpotlight ? (
                <Link href={`/${chairmanSpotlight.slug}`} className="group block">
                  <div className="relative aspect-[16/9] w-full bg-gray-100">
                    {featuredImage(chairmanSpotlight) && (
                      <Image src={featuredImage(chairmanSpotlight)!.url} alt={featuredImage(chairmanSpotlight)!.alt} fill className="object-cover" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold leading-snug group-hover:underline">
                      {decodeEntities(chairmanSpotlight.title.rendered)}
                    </h3>
                  </div>
                </Link>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center bg-gray-50 p-6 text-center text-sm text-gray-400">
                  Chairman spotlight coming soon - tag a post with the "chairman-spotlight" category to feature it here.
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border-2" style={{ borderColor: "#c2410c" }}>
              <div className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-white" style={{ backgroundColor: "#c2410c" }}>
                Business Spotlight
              </div>
              {businessSpotlight ? (
                <Link href={`/${businessSpotlight.slug}`} className="group block">
                  <div className="relative aspect-[16/9] w-full bg-gray-100">
                    {featuredImage(businessSpotlight) && (
                      <Image src={featuredImage(businessSpotlight)!.url} alt={featuredImage(businessSpotlight)!.alt} fill className="object-cover" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold leading-snug group-hover:underline">
                      {decodeEntities(businessSpotlight.title.rendered)}
                    </h3>
                  </div>
                </Link>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center bg-gray-50 p-6 text-center text-sm text-gray-400">
                  Business spotlight coming soon - tag a post with the "business-spotlight" category to feature it here.
                </div>
              )}
            </div>
          </section>

          <AdSlot slotKey="insight_home_leaderboard_mid" size="728×90" className="mx-auto mb-14 h-[120px] w-full max-w-3xl" />

          {/* Trending Topics */}
          {trending.length > 0 && (
            <section className="mb-14">
              <div className="mb-6 flex items-center gap-2 border-b-2 pb-3" style={{ borderColor: "#c2410c" }}>
                <span className="text-lg">&#128293;</span>
                <h2 className="text-xl font-extrabold tracking-tight">Trending in Ijebu</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {trending.map((post, i) => (
                  <Link key={post.id} href={`/${post.slug}`} className="group block">
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                      {featuredImage(post) && (
                        <Image src={featuredImage(post)!.url} alt={featuredImage(post)!.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                      <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold leading-snug group-hover:underline">
                      {decodeEntities(post.title.rendered)}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* General News Grid */}
          {newsGrid.length > 0 && (
            <section>
              <div className="mb-6 border-b-2 pb-3" style={{ borderColor: "#166534" }}>
                <h2 className="text-xl font-extrabold tracking-tight">More From Ijebu</h2>
              </div>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {newsGrid.map((post) => (
                  <Link key={post.id} href={`/${post.slug}`} className="group block">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                      {featuredImage(post) && (
                        <Image src={featuredImage(post)!.url} alt={featuredImage(post)!.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <CategoryBadge category="Ijebu" className="mt-2" />
                    <h3 className="mt-1 font-semibold group-hover:underline">{decodeEntities(post.title.rendered)}</h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {posts.length === 0 && (
            <p className="text-gray-500">No Ijebu City stories published yet - check back soon.</p>
          )}
        </main>
      </div>

      <FeaturedPlaces title="Featured Places" places={chrome.featuredPlaces} />
      <Footer />
    </>
  );
}
