// app/bbnaija-s11/[slug]/page.tsx
//
// Single housemate profile page. Reads seo_title / seo_description /
// canonical_url straight from the row so the SEO work already done in
// Supabase carries through to real <head> tags — no duplicate SEO effort.

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPostBySlug } from '@/lib/supabase-public';

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    alternates: post.canonical_url ? { canonical: post.canonical_url } : undefined,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function HousemateProfilePage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const h = post.content?.housemate;
  const body = post.content?.body ?? [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="relative mb-6 aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100">
        {post.cover_image_url && (
          <Image
            src={post.cover_image_url}
            alt={h?.known_as ?? post.title}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight">{h?.known_as ?? post.title}</h1>

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
        {h?.age && (
          <div><dt className="inline font-medium">Age: </dt><dd className="inline">{h.age}</dd></div>
        )}
        {h?.state_of_origin && (
          <div><dt className="inline font-medium">From: </dt><dd className="inline">{h.state_of_origin}</dd></div>
        )}
        {h?.occupation && (
          <div><dt className="inline font-medium">Occupation: </dt><dd className="inline">{h.occupation}</dd></div>
        )}
      </dl>

      {h?.personality_tags && h.personality_tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {h.personality_tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {h?.entry_quote && (
        <blockquote className="mt-6 border-l-4 border-gray-300 pl-4 italic text-gray-700">
          &ldquo;{h.entry_quote}&rdquo;
        </blockquote>
      )}

      <article className="prose mt-6 max-w-none">
        {body.map((block, i) =>
          block.type === 'paragraph' ? <p key={i}>{block.text}</p> : null
        )}
      </article>
    </main>
  );
}
