// app/newsroom/page.tsx
//
// Newsroom is the general landing page for everything published to Supabase
// (insight_posts) across ALL categories — not filtered to one category.
// Layout: a "News" list on the left, one big featured story in the center,
// and a "Recent Posts" panel on the right — same idea as your homepage's
// hero section, but sourced from Supabase instead of WordPress.

import Link from 'next/link';
import Image from 'next/image';
import { getAllPublishedPosts, type PublishedPost } from '@/lib/supabase-public';
import { getSiteChrome } from '@/lib/site-chrome';
import Masthead from '@/components/Masthead';
import SideRailAds from '@/components/SideRailAds';
import FeaturedPlaces from '@/components/FeaturedPlaces';
import Footer from '@/components/Footer';

export const revalidate = 60;

export const metadata = {
  title: 'Newsroom | Insight',
  description: 'The latest news and features from Insight.',
};

function timeAgo(dateStr: string | null) {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function NewsListItem({ post }: { post: PublishedPost }) {
  return (
    <Link href={`/newsroom/${post.slug}`} className="group flex gap-3 py-3">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
        {post.cover_image_url && (
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
          {post.insight_categories?.name ?? 'News'} <span className="text-gray-400">/ {timeAgo(post.published_at)}</span>
        </p>
        <h3 className="mt-1 text-sm font-semibold leading-snug group-hover:underline">{post.title}</h3>
      </div>
    </Link>
  );
}

export default async function NewsroomPage() {
  const [posts, chrome] = await Promise.all([getAllPublishedPosts(20), getSiteChrome()]);

  const [featured, ...rest] = posts;
  const leftList = rest.slice(0, 6);
  const rightList = rest.slice(6, 12);
  const gridPosts = rest.slice(12);

  return (
    <>
      <Masthead navItems={chrome.navItems} siteSettings={chrome.siteSettings} />
      <SideRailAds />
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Newsroom</h1>

      {featured && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1 divide-y divide-gray-100">
            {leftList.map((post) => (
              <NewsListItem key={post.id} post={post} />
            ))}
          </div>

          <div className="lg:col-span-2">
            <Link href={`/newsroom/${featured.slug}`} className="group block">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100">
                {featured.cover_image_url && (
                  <Image
                    src={featured.cover_image_url}
                    alt={featured.title}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-orange-600">
                {featured.insight_categories?.name ?? 'News'} <span className="text-gray-400">/ {timeAgo(featured.published_at)}</span>
              </p>
              <h2 className="mt-1 text-2xl font-bold leading-tight group-hover:underline">
                {featured.title}
              </h2>
              {featured.excerpt && <p className="mt-2 text-gray-600">{featured.excerpt}</p>}
            </Link>
          </div>

          <div className="lg:col-span-1">
            <h2 className="mb-3 border-b-2 border-orange-500 pb-2 text-sm font-bold uppercase tracking-wide">
              Recent Posts
            </h2>
            <div className="divide-y divide-gray-100">
              {rightList.map((post) => (
                <NewsListItem key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
      )}

      {gridPosts.length > 0 && (
        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {gridPosts.map((post) => (
            <Link key={post.id} href={`/newsroom/${post.slug}`} className="group block">
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
          ))}
        </div>
      )}

      {posts.length === 0 && (
        <p className="text-gray-500">No articles published yet — check back soon.</p>
      )}
      </main>

      <FeaturedPlaces title="Featured Places" places={chrome.featuredPlaces} />
      <Footer />
    </>
  );
}
