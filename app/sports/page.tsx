// app/sports/page.tsx
//
// Dedicated Sports landing page - bold, dark, scoreboard-inspired design,
// deliberately different from the Culture (editorial/serif) and Events
// (photo-grid) pages so the site doesn't feel like the same template
// re-skinned three times. Overrides the generic category view at /sports.

import Link from "next/link";
import Image from "next/image";
import { getUnifiedCategory } from "@/lib/unified-posts";
import { getSiteChrome } from "@/lib/site-chrome";
import { featuredImage, decodeEntities } from "@/lib/wordpress";
import Masthead from "@/components/Masthead";
import SideRailAds from "@/components/SideRailAds";
import FeaturedPlaces from "@/components/FeaturedPlaces";
import Footer from "@/components/Footer";

export const revalidate = 120;

export const metadata = {
  title: "Sports | Insight Magazine",
  description: "Football, athletics, and every game that matters across Ijebu, Nigeria, and beyond.",
};

export default async function SportsPage() {
  const [sports, chrome] = await Promise.all([
    getUnifiedCategory("sports"),
    getSiteChrome(),
  ]);

  const posts = sports?.posts ?? [];
  const [lead, ...rest] = posts;
  const sideStories = rest.slice(0, 3);
  const gridStories = rest.slice(3);

  return (
    <>
      <Masthead navItems={chrome.navItems} siteSettings={chrome.siteSettings} />
      <SideRailAds />

      <div className="bg-[#0a0e14] text-white">
        <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <header className="mb-10 flex items-center gap-4 border-b-2 border-red-600 pb-4">
            <span className="rounded bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-widest">Live Coverage</span>
            <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Sports</h1>
          </header>

          {lead && (
            <Link href={`/${lead.slug}`} className="group mb-12 block">
              <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg bg-gray-900">
                {featuredImage(lead) && (
                  <Image src={featuredImage(lead)!.url} alt={featuredImage(lead)!.alt} fill className="object-cover" priority />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <span className="mb-3 inline-block rounded bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-widest">
                    Top Story
                  </span>
                  <h2 className="max-w-3xl text-2xl font-black leading-tight md:text-4xl">
                    {decodeEntities(lead.title.rendered)}
                  </h2>
                </div>
              </div>
            </Link>
          )}

          {sideStories.length > 0 && (
            <section className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {sideStories.map((post, i) => (
                <Link key={post.id} href={`/${post.slug}`} className="group block border-l-4 border-red-600 bg-white/5 p-4 transition-colors hover:bg-white/10">
                  <span className="font-mono text-3xl font-black text-red-600">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 text-sm font-bold leading-snug group-hover:underline">
                    {decodeEntities(post.title.rendered)}
                  </h3>
                </Link>
              ))}
            </section>
          )}

          {gridStories.length > 0 && (
            <section>
              <h2 className="mb-6 border-b border-white/20 pb-3 text-xl font-black uppercase tracking-wide">
                More In Sports
              </h2>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {gridStories.map((post) => (
                  <Link key={post.id} href={`/${post.slug}`} className="group block">
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-900">
                      {featuredImage(post) && (
                        <Image src={featuredImage(post)!.url} alt={featuredImage(post)!.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <h3 className="mt-2 text-sm font-bold leading-snug group-hover:underline">
                      {decodeEntities(post.title.rendered)}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {posts.length === 0 && (
            <p className="text-gray-400">No sports coverage published yet - check back soon.</p>
          )}
        </main>
      </div>

      <FeaturedPlaces title="Featured Places" places={chrome.featuredPlaces} />
      <Footer />
    </>
  );
}
