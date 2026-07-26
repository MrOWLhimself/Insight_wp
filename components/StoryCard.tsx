import Link from "next/link";
import Image from "next/image";
import {
  WPPost,
  featuredImage,
  primaryCategoryName,
  stripHtml,
  decodeEntities,
} from "@/lib/wordpress";

export function HeroStory({ post }: { post: WPPost }) {
  const img = featuredImage(post);
  return (
    <Link href={`/${post.slug}`} className="story-link group block text-center">
      <div className="relative w-full aspect-square overflow-hidden bg-ink/5 mb-5">
        {img && (
          <Image
            src={img.url}
            alt={img.alt}
            fill
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <span className="eyebrow">{primaryCategoryName(post)}</span>
      <h2 className="story-title font-display font-extrabold text-3xl md:text-4xl text-orange mt-3 leading-[1.1] max-w-md mx-auto">
        {decodeEntities(post.title.rendered)}
      </h2>
    </Link>
  );
}

export function HeroSideCard({ post }: { post: WPPost }) {
  const img = featuredImage(post);
  return (
    <Link href={`/${post.slug}`} className="story-link group block">
      <div className="relative w-full aspect-square overflow-hidden bg-ink/5 mb-3">
        {img && (
          <Image
            src={img.url}
            alt={img.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <span className="eyebrow">{primaryCategoryName(post)}</span>
      <h3 className="story-title font-display font-extrabold text-base leading-snug mt-1.5 text-ink">
        {decodeEntities(post.title.rendered)}
      </h3>
    </Link>
  );
}

export function StoryRow({ post }: { post: WPPost }) {
  const img = featuredImage(post);
  return (
    <Link href={`/${post.slug}`} className="story-link group flex gap-4">
      <div className="relative w-28 h-20 flex-shrink-0 overflow-hidden bg-ink/5">
        {img && (
          <Image
            src={img.url}
            alt={img.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div>
        <span className="eyebrow">{primaryCategoryName(post)}</span>
        <h3 className="story-title font-display font-bold text-lg leading-snug mt-1 text-ink">
          {decodeEntities(post.title.rendered)}
        </h3>
      </div>
    </Link>
  );
}

export function StoryCard({ post }: { post: WPPost }) {
  const img = featuredImage(post);
  return (
    <Link href={`/${post.slug}`} className="story-link group block">
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-ink/5 mb-4">
        {img && (
          <Image
            src={img.url}
            alt={img.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <span className="eyebrow">{primaryCategoryName(post)}</span>
      <h3 className="story-title font-display font-extrabold text-xl leading-snug mt-2 text-ink">
        {decodeEntities(post.title.rendered)}
      </h3>
      <p className="text-ink-soft text-sm mt-2 leading-relaxed line-clamp-2">
        {stripHtml(post.excerpt.rendered)}
      </p>
    </Link>
  );
}
