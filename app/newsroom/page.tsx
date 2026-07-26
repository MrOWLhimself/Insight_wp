// app/newsroom/page.tsx
//
// General landing page for any future article published to Supabase
// (insight_posts, category = "newsroom"), independent of WordPress.
// Reuses the same getCategoryPosts helper already built for BBNaija —
// works for any category slug, so new topics don't need new lib code.

import Link from 'next/link';
import Image from 'next/image';
import { getCategoryPosts } from '@/lib/supabase-public';

export const revalidate = 60;

export const metadata = {
  title: 'Newsroom | Insight',
  description: 'The latest news and features from Insight.',
};

export default async function NewsroomPage() {
  const posts = await getCategoryPosts('newsroom');

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Newsroom</h1>
        <p className="mt-2 text-gray-600">The latest, as it happens.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/newsroom/${post.slug}`}
            className="group block overflow-hidden rounded-lg border border-gray-200 transition hover:shadow-md"
          >
            <div className="relative aspect-[16/9] w-full bg-gray-100">
              {post.cover_image_url && (
                <Image
                  src={post.cover_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold group-hover:underline">{post.title}</h2>
              {post.excerpt && <p className="mt-1 text-sm text-gray-600">{post.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-gray-500">No articles published yet — check back soon.</p>
      )}
    </main>
  );
}
