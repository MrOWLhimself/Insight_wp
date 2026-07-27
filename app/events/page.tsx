// app/events/page.tsx
//
// Dedicated Events landing page - overrides the generic category view
// (which still exists at /[slug] for every other category) with a richer,
// magazine-style layout: a hero, then four themed sub-sections (Red Carpet,
// Outdoor Event, Concert, Hangout), then a general "All Events" grid.
//
// Because this file exists as a real route, Next.js matches it before ever
// falling through to the dynamic /[slug] catch-all - same pattern as
// /bbnaija-s11 already uses.

import Link from "next/link";
import Image from "next/image";
import { getUnifiedCategory } from "@/lib/unified-posts";
import { getSiteChrome } from "@/lib/site-chrome";
import { featuredImage, decodeEntities } from "@/lib/wordpress";
import Masthead from "@/components/Masthead";
import SideRailAds from "@/components/SideRailAds";
import FeaturedPlaces from "@/components/FeaturedPlaces";
import Footer from "@/components/Footer";
import CategoryBadge from "@/components/CategoryBadge";
import type { WPPost } from "@/lib/wordpress";

export const revalidate = 120;

export const metadata = {
  title: "Events | Insight Magazine",
  description: "Live event coverage across Ijebu and beyond - red carpets, concerts, outdoor festivals, and hangouts, all in one place.",
};

const SUB_SECTIONS = [
  { slug: "red-carpet", label: "Red Carpet", blurb: "Arrivals, style, and the moments before the cameras turn away." },
  { slug: "outdoor-event", label: "Outdoor Event", blurb: "Festivals, ceremonies, and gatherings under the open sky." },
  { slug: "concert", label: "Concert", blurb: "Live performances, sets, and the nights the music took over." },
  { slug: "hangout", label: "Hangout", blurb: "The casual, unscripted moments in between the main event." },
];

function PhotoCard({ post, size = "normal" }: { post: WPPost; size?: "normal" | "large" }) {
  const img = featuredImage(post);
  return (
    <Link href={`/${post.slug}`} className="group block">
      <div
        className={`relative w-full overflow-hidden rounded-xl bg-gray-900 ${size === "large" ? "aspect-[4/3]" : "aspect-square"}`}
      >
        {img && (
          <Image
            src={img.url}
            alt={img.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-sm font-bold leading-snug text-white drop-shadow">
            {decodeEntities(post.title.rendered)}
          </h3>
        </div>
      </div>
    </Link>
  );
}

export default async function EventsPage() {
  const [mainEvents, chrome, ...subSectionData] = await Promise.all([
    getUnifiedCategory("events"),
    getSiteChrome(),
    ...SUB_SECTIONS.map((s) => getUnifiedCategory(s.slug)),
  ]);

  const posts = mainEvents?.posts ?? [];
  const [lead, ...rest] = posts;

  return (
    <>
      <Masthead navItems={chrome.navItems} siteSettings={chrome.siteSettings} />
      <SideRailAds />

      {/* Hero */}
      <div className="relative w-full bg-black">
        <div className="relative mx-auto max-w-7xl aspect-[21/9] w-full">
          {lead && featuredImage(lead) && (
            <Image
              src={featuredImage(lead)!.url}
              alt={featuredImage(lead)!.alt}
              fill
              className="object-cover opacity-70"
              priority
            />
          )}
          <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-black via-black/40 to-transparent p-8 md:p-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Events</p>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
              Where the cameras were, and the crowd showed up.
            </h1>
            {lead && (
              <Link href={`/${lead.slug}`} className="mt-4 text-sm font-semibold text-white underline underline-offset-4">
                {decodeEntities(lead.title.rendered)} &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        {/* Sub-section blocks */}
        {SUB_SECTIONS.map((section, i) => {
          const data = subSectionData[i];
          const sectionPosts = data?.posts?.slice(0, 6) ?? [];
          if (sectionPosts.length === 0) return null;

          return (
            <section key={section.slug} className="mb-16">
              <div className="mb-6 flex items-end justify-between border-b-4 pb-3" style={{ borderColor: "#f97316" }}>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{section.label}</h2>
                  <p className="mt-1 text-sm text-gray-500">{section.blurb}</p>
                </div>
                <Link href={`/${section.slug}`} className="whitespace-nowrap text-sm font-semibold underline">
                  See all &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {sectionPosts.map((post, j) => (
                  <PhotoCard key={post.id} post={post} size={j === 0 ? "large" : "normal"} />
                ))}
              </div>
            </section>
          );
        })}

        {/* All Events grid */}
        {rest.length > 0 && (
          <section>
            <h2 className="mb-6 border-b border-gray-200 pb-3 text-2xl font-extrabold tracking-tight">
              All Events
            </h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {rest.map((post) => {
                const img = featuredImage(post);
                return (
                  <Link key={post.id} href={`/${post.slug}`} className="group block">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                      {img && (
                        <Image src={img.url} alt={img.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <CategoryBadge category="Events" className="mt-2" />
                    <h3 className="mt-1 font-semibold group-hover:underline">{decodeEntities(post.title.rendered)}</h3>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {posts.length === 0 && (
          <p className="text-gray-500">No event coverage published yet - check back soon.</p>
        )}
      </main>

      <FeaturedPlaces title="Featured Places" places={chrome.featuredPlaces} />
      <Footer />
    </>
  );
}
