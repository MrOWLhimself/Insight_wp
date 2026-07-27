// app/newsroom/[slug]/page.tsx
//
// Two-column article layout: wide main content on the left (cover image,
// italic deck/excerpt, share bar, ad slot, article body split around a
// mid-article ad slot, gallery, and a Recent Posts strip after the article),
// plus a sidebar on the right (ad slot, Recent Posts list, ad slot).

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug, getAllPublishedPosts, type PublishedPost } from '@/lib/supabase-public';
import ShareBar from '@/components/ShareBar';
import Gallery from '@/components/Gallery';
import { getSiteChrome } from '@/lib/site-chrome';
import Masthead from '@/components/Masthead';
import SideRailAds from '@/components/SideRailAds';
import FeaturedPlaces from '@/components/FeaturedPlaces';
import Footer from '@/components/Footer';
import AdSlot from '@/components/AdSlot';

type ArticleContent = {
  body?: { type: string; text: string }[];
  gallery?: string[];
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    alternates: post.canonical_url ? { canonical: post.canonical_url } : undefined,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
      url: post.canonical_url || undefined,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

function RecentPostRow({ post }: { post: PublishedPost }) {
  return (
    <Link href={`/newsroom/${post.slug}`} className="group flex gap-3 py-3">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
        {post.cover_image_url && (
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
          {post.insight_categories?.name ?? 'News'}
        </p>
        <h3 className="mt-1 text-sm font-semibold leading-snug group-hover:underline">{post.title}</h3>
      </div>
    </Link>
  );
}

function RecentPostCard({ post }: { post: PublishedPost }) {
  return (
    <Link href={`/newsroom/${post.slug}`} className="group block">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
        {post.cover_image_url && (
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
        )}
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-orange-600">
        {post.insight_categories?.name ?? 'News'}
      </p>
      <h3 className="font-semibold group-hover:underline">{post.title}</h3>
    </Link>
  );
}

export default async function NewsroomArticlePage({ params }: Props) {
  const { slug } = await params;
  const [post, chrome, recentAll] = await Promise.all([
    getPostBySlug(slug),
    getSiteChrome(),
    getAllPublishedPosts(10),
  ]);
  if (!post) notFound();

  const body = post.content?.body ?? [];
  const gallery = (post.content as ArticleContent)?.gallery ?? [];
  const midpoint = Math.ceil(body.length / 2);
  const firstHalf = body.slice(0, midpoint);
  const secondHalf = body.slice(midpoint);

  const recentPosts = recentAll.filter((p) => p.slug !== post.slug).slice(0, 6);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    image: post.cover_image_url || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.published_at || undefined,
    mainEntityOfPage: post.canonical_url || undefined,
    author: { '@type': 'Organization', name: 'Insight Magazine' },
    publisher: { '@type': 'Organization', name: 'Insight Magazine' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Masthead navItems={chrome.navItems} siteSettings={chrome.siteSettings} />
      <SideRailAds />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

          {/* Main content column — takes 2 of 3 grid columns, wider than before */}
          <div className="lg:col-span-2">
            {post.cover_image_url && (
              <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
                <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" priority />
              </div>
            )}

            <h1 className="text-3xl font-extrabold tracking-tight">{post.title}</h1>
            {post.excerpt && <p className="mt-3 text-lg italic text-gray-600">{post.excerpt}</p>}

            <ShareBar
              url={post.canonical_url || `https://magazine.citiplug.com/newsroom/${post.slug}`}
              title={post.title}
            />

            <AdSlot slotKey="insight_newsroom_article_mid" size="728×90" className="my-6 h-[90px] w-full" />

            <article className="mt-2 max-w-none text-gray-700">
              {firstHalf.map((block: any, i) =>
                block.type === 'image' ? (
                  <div key={i} className="relative my-6 aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100">
                    <Image src={block.url} alt={block.alt || post.title} fill className="object-cover" />
                  </div>
                ) : block.type === 'heading' ? (
                  <h3 key={i} className="mt-8 mb-3 text-xl font-bold">{block.text}</h3>
                ) : block.type === 'list' ? (
                  <ol key={i} className="mb-4 list-decimal pl-6 space-y-1">
                    {(block.items || []).map((item: string, k: number) => (
                      <li key={k}>{item}</li>
                    ))}
                  </ol>
                ) : block.type === 'paragraph' ? (
                  <p key={i} className="mb-4 leading-relaxed">{block.text}</p>
                ) : null
              )}
            </article>

            {secondHalf.length > 0 && (
              <>
                <AdSlot slotKey="insight_newsroom_article_mid" size="728×90" className="my-6 h-[90px] w-full" />
                <article className="max-w-none text-gray-700">
                  {secondHalf.map((block: any, i) =>
                    block.type === 'image' ? (
                      <div key={i} className="relative my-6 aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100">
                        <Image src={block.url} alt={block.alt || post.title} fill className="object-cover" />
                      </div>
                    ) : block.type === 'heading' ? (
                      <h3 key={`b-${i}`} className="mt-8 mb-3 text-xl font-bold">{block.text}</h3>
                    ) : block.type === 'list' ? (
                      <ol key={`b-${i}`} className="mb-4 list-decimal pl-6 space-y-1">
                        {(block.items || []).map((item: string, k: number) => (
                          <li key={k}>{item}</li>
                        ))}
                      </ol>
                    ) : block.type === 'paragraph' ? (
                      <p key={`b-${i}`} className="mb-4 leading-relaxed">{block.text}</p>
                    ) : null
                  )}
                </article>
              </>
            )}

            {gallery.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-4 text-xl font-bold">Gallery</h2>
                <Gallery images={gallery} title={post.title} />
              </section>
            )}

            {recentPosts.length > 0 && (
              <section className="mt-14 border-t border-gray-200 pt-8">
                <h2 className="mb-6 text-xl font-bold">Recent Posts</h2>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                  {recentPosts.slice(0, 3).map((p) => (
                    <RecentPostCard key={p.id} post={p} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar — 1 of 3 grid columns */}
          <aside className="lg:col-span-1">
            <AdSlot slotKey="insight_newsroom_sidebar_top" size="300×250" className="mb-8 h-[250px] w-full" />

            <h2 className="mb-2 border-b-2 border-orange-500 pb-2 text-sm font-bold uppercase tracking-wide">
              Recent Posts
            </h2>
            <div className="divide-y divide-gray-100">
              {recentPosts.map((p) => (
                <RecentPostRow key={p.id} post={p} />
              ))}
            </div>

            <AdSlot slotKey="insight_newsroom_sidebar_bottom" size="300×250" className="mt-8 h-[250px] w-full" />
          </aside>
        </div>
      </main>

      <FeaturedPlaces title="Featured Places" places={chrome.featuredPlaces} />
      <Footer />
    </>
  );
}
