// app/newsroom/[slug]/page.tsx
//
// Generic article page. Unlike the BBNaija profile page, this doesn't
// assume a "housemate" shape in content — it just renders whatever body
// paragraphs exist, plus SEO metadata, cover image, and share buttons.
// Works for any future article regardless of topic.

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPostBySlug } from '@/lib/supabase-public';
import ShareBar from '@/components/ShareBar';
import { getSiteChrome } from '@/lib/site-chrome';
import Masthead from '@/components/Masthead';
import SideRailAds from '@/components/SideRailAds';
import FeaturedPlaces from '@/components/FeaturedPlaces';
import Footer from '@/components/Footer';

export const revalidate = 60;

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

export default async function NewsroomArticlePage({ params }: Props) {
  const { slug } = await params;
  const [post, chrome] = await Promise.all([getPostBySlug(slug), getSiteChrome()]);
  if (!post) notFound();

  const body = post.content?.body ?? [];

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
    <main className="mx-auto max-w-2xl px-4 py-10">
      {post.cover_image_url && (
        <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="text-3xl font-extrabold tracking-tight">{post.title}</h1>
      {post.excerpt && <p className="mt-3 text-lg text-gray-600">{post.excerpt}</p>}

      <ShareBar
        url={post.canonical_url || `https://magazine.citiplug.com/newsroom/${post.slug}`}
        title={post.title}
      />

      <article className="mt-6 max-w-none text-gray-700">
        {body.map((block, i) =>
          block.type === 'paragraph' ? <p key={i} className="mb-4 leading-relaxed">{block.text}</p> : null
        )}
      </article>
      </main>

      <FeaturedPlaces title="Featured Places" places={chrome.featuredPlaces} />
      <Footer />
    </>
  );
}
