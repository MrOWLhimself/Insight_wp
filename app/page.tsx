import { getPosts, getCategories } from "@/lib/wordpress";
import {
  getHomepageSections,
  getNavMenu,
  getSiteSettings,
  getPromoCards,
  getFeaturedPlaces,
  type HomepageSection,
  type NavMenuItem,
} from "@/lib/supabase";
import {
  getCategoryPosts,
  getAllPublishedPosts,
  type PublishedPost,
} from "@/lib/supabase-public";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import CategorySpotlight from "@/components/CategorySpotlight";
import YouTubeConnect from "@/components/YouTubeConnect";
import PromoSection from "@/components/PromoSection";
import FeaturedPlaces from "@/components/FeaturedPlaces";
import TrendingNow from "@/components/TrendingNow";
import SideRailAds from "@/components/SideRailAds";
import { HeroStory, HeroSideCard, StoryCard } from "@/components/StoryCard";
import LatestPosts from "@/components/LatestPosts";
import Link from "next/link";
import Image from "next/image";
import { SITE_URL } from "@/lib/config";
import { adaptInsightPost } from "@/lib/insight-wp-adapter";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Insight Magazine — by CitiPlug",
    description:
      "Culture, city, and campus life from Ijebu Ode and beyond — Insight Magazine by CitiPlug.",
    alternates: { canonical: SITE_URL },
    openGraph: {
      title: "Insight Magazine — by CitiPlug",
      description:
        "Culture, city, and campus life from Ijebu Ode and beyond — Insight Magazine by CitiPlug.",
      url: SITE_URL,
      // No images[] here — app/opengraph-image.tsx generates a branded
      // image automatically and Next.js wires it up on its own.
    },
  };
}

async function postsFor(section: HomepageSection | undefined, count: number) {
  if (!section?.category_id) return getPosts({ perPage: count });
  const posts = await getPosts({ category: section.category_id, perPage: count });
  return posts.length > 0 ? posts : getPosts({ perPage: count });
}

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

export default async function HomePage() {
  const [categories, sections, navItems, siteSettings, promoCards, featuredPlaces, bbnaijaPosts, allRecentPosts] =
    await Promise.all([
      getCategories(),
      getHomepageSections(),
      getNavMenu(),
      getSiteSettings(),
      getPromoCards(),
      getFeaturedPlaces(),
      getCategoryPosts("bbnaija-s11"),
      getAllPublishedPosts(20),
    ]);

  const hero = sections.find((s) => s.display_type === "hero" && s.enabled);
  const spotlight = sections.find((s) => s.display_type === "spotlight" && s.enabled);
  const latest = sections.find((s) => s.display_type === "latest" && s.enabled);

  // Show the 4 most recently published BBNaija profiles on the homepage.
  const bbnaijaHomepagePosts = bbnaijaPosts.slice(0, 4);

  // Newsroom section: latest posts across all categories EXCEPT bbnaija-s11
  // (that has its own dedicated section right above this one already).
  const newsroomHomepagePosts = allRecentPosts
    .filter((p) => p.insight_categories?.slug !== "bbnaija-s11")
    .slice(0, 4);

  // "Flexible" sections render in the middle of the page, in whatever
  // order they're arranged in the CitiPlug admin's Insight → Sections tab —
  // WordPress posts, promo sections show the curated cross-promo cards.
  const flexibleSections = sections
    .filter((s) => (s.display_type === "grid" || s.display_type === "promo" || s.display_type === "places") && s.enabled)
    .sort((a, b) => a.sort_order - b.sort_order);

  const [heroPostsWP, spotlightPosts, latestPostsWP, flexiblePostsBySection] = await Promise.all([
    postsFor(hero, 5),
    postsFor(spotlight, 4),
    getPosts({ perPage: 10 }),
    Promise.all(
      flexibleSections.map((s) => (s.display_type === "grid" ? postsFor(s, 4) : Promise.resolve([])))
    ),
  ]);

  // Adapt a few of the most recent Supabase-authored posts (Newsroom,
  // BBNaija S11, any future insight_posts content) into the same shape as
  // a WordPress post, then merge them in by publish date — so a post I
  // publish can genuinely lead the homepage hero or show up in Latest
  // Posts, not just live in its own separate section.
  const adaptedInsightPosts = allRecentPosts.map(adaptInsightPost);

  const heroPosts = [...heroPostsWP, ...adaptedInsightPosts.slice(0, 3)]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const latestPosts = [...adaptedInsightPosts.slice(0, 5), ...latestPostsWP]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const [lead, ...sideStories] = heroPosts;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Insight Magazine",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`, // swap for the real uploaded logo path once branding is set to an image
      sameAs: [
        // Add your real social profile URLs here once decided — helps
        // Google connect this site to your social presence (the
        // "knowledge panel" effect), currently empty placeholders.
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Insight Magazine",
      url: SITE_URL,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Masthead
        navItems={navItems.length > 0 ? navItems : navFallback(categories)}
        siteSettings={siteSettings}
      />

      <SideRailAds />

      <main>
        <div className="max-w-7xl mx-auto px-6 py-10">
          {lead && (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14 items-start">
              <div className="flex flex-col gap-10">
                {sideStories.slice(0, 2).map((post) => (
                  <HeroSideCard key={post.id} post={post} />
                ))}
              </div>
              <div className="col-span-2">
                <HeroStory post={lead} />
              </div>
              <div className="flex flex-col gap-10">
                {sideStories.slice(2, 4).map((post) => (
                  <HeroSideCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </div>

        <AdSlot slotKey="insight_home_leaderboard_top" size="970×90" className="max-w-7xl mx-4 md:mx-auto my-9 h-[90px]" />

        {spotlight && (
          <CategorySpotlight
            categoryName={spotlight.category_name ?? "Featured"}
            posts={spotlightPosts}
          />
        )}

        <YouTubeConnect
          channelUrl={siteSettings.youtube_url}
          title={siteSettings.youtube_title}
          description={siteSettings.youtube_description}
        />

        <TrendingNow />

        <AdSlot slotKey="insight_home_bbnaija_promo" size="728×90" className="max-w-7xl mx-4 md:mx-auto my-9 h-[120px]" />

        {bbnaijaHomepagePosts.length > 0 && (
          <div className="max-w-7xl mx-auto px-6">
            <section className="my-14">
              <div className="flex items-center justify-between border-b border-rule pb-3 mb-8">
                <h2 className="font-display font-extrabold text-3xl text-ink">
                  BBNaija Season 11
                </h2>
                <Link href="/bbnaija-s11" className="text-sm font-semibold underline">
                  Meet every housemate →
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
                {bbnaijaHomepagePosts.map((post) => {
                  const h = post.content?.housemate;
                  return (
                    <Link key={post.id} href={`/bbnaija-s11/${post.slug}`} className="group block">
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100">
                        {post.cover_image_url && (
                          <Image
                            src={post.cover_image_url}
                            alt={h?.known_as ?? post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        )}
                      </div>
                      <h3 className="mt-2 font-semibold group-hover:underline">
                        {h?.known_as ?? post.title}
                      </h3>
                      {h?.state_of_origin && (
                        <p className="text-sm text-gray-500">{h.state_of_origin}</p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {newsroomHomepagePosts.length > 0 && (
          <div className="max-w-7xl mx-auto px-6">
            <section className="my-14">
              <div className="flex items-center justify-between border-b border-rule pb-3 mb-8">
                <h2 className="font-display font-extrabold text-3xl text-ink">
                  Newsroom
                </h2>
                <Link href="/newsroom" className="text-sm font-semibold underline">
                  See all →
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
                {newsroomHomepagePosts.map((post) => (
                  <Link key={post.id} href={`/newsroom/${post.slug}`} className="group block">
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
                      {post.cover_image_url && (
                        <Image
                          src={post.cover_image_url}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      )}
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-orange-600">
                      {post.insight_categories?.name ?? "News"}
                    </p>
                    <h3 className="font-semibold group-hover:underline">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}

        {flexibleSections.map((section, i) => (
          <div key={section.section_key}>
            {section.display_type === "grid" ? (
              <div className="max-w-7xl mx-auto px-6">
                <section className="my-14">
                  <h2 className="font-display font-extrabold text-3xl text-ink border-b border-rule pb-3 mb-8">
                    {section.label}
                  </h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
                    {flexiblePostsBySection[i].map((post) => (
                      <StoryCard key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              </div>
            ) : section.display_type === "places" ? (
              <FeaturedPlaces title={section.label} places={featuredPlaces} />
            ) : (
              <div className="my-14">
                <PromoSection title={section.label} cards={promoCards} />
              </div>
            )}

            {i < flexibleSections.length - 1 && (
              <AdSlot
                slotKey="insight_home_leaderboard_mid"
                size="728×90"
                className="max-w-7xl mx-4 md:mx-auto my-14 h-[120px]"
              />
            )}
          </div>
        ))}

        {latest && <LatestPosts posts={latestPosts} />}

        <AdSlot slotKey="insight_home_responsive_bottom" size="Responsive" className="max-w-7xl mx-4 md:mx-auto my-9 h-[120px]" />
      </main>

      <Footer />
    </>
  );
}
