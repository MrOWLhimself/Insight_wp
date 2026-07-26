// app/bbnaija-s11/page.tsx
//
// "Meet Every Housemate" — lists all published BBNaija S11 profiles straight
// from Supabase (insight_posts), independent of the WordPress content stream.
// Drop this folder into your existing app/ directory alongside your other routes.

import Link from 'next/link';
import Image from 'next/image';
import { getCategoryPosts } from '@/lib/supabase-public';

export const revalidate = 60; // re-check for new/updated profiles every 60s

export const metadata = {
  title: 'Meet Every BBNaija Season 11 Housemate | Insight',
  description:
    'Every housemate profile from BBNaija Season 11 — name, age, state, personality, and what they said walking through the door.',
};

export default async function BBNaijaS11Page() {
  const posts = await getCategoryPosts('bbnaija-s11');

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Meet Every BBNaija Season 11 Housemate
        </h1>
        <p className="mt-2 text-gray-600">
          Updated live as each housemate profile goes up — {posts.length} revealed so far.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {posts.map((post) => {
          const h = post.content?.housemate;
          return (
            <Link
              key={post.id}
              href={`/bbnaija-s11/${post.slug}`}
              className="group block overflow-hidden rounded-lg border border-gray-200 transition hover:shadow-md"
            >
              <div className="relative aspect-[3/4] w-full bg-gray-100">
                {post.cover_image_url ? (
                  <Image
                    src={post.cover_image_url}
                    alt={h?.known_as ?? post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    Photo pending
                  </div>
                )}
              </div>
              <div className="p-3">
                <h2 className="font-semibold group-hover:underline">
                  {h?.known_as ?? post.title}
                </h2>
                {h?.state_of_origin && (
                  <p className="text-sm text-gray-500">{h.state_of_origin}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {posts.length === 0 && (
        <p className="text-gray-500">No housemate profiles published yet — check back soon.</p>
      )}
    </main>
  );
}
