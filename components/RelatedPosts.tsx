import Link from "next/link";
import Image from "next/image";
import { WPPost, featuredImage, authorName, decodeEntities } from "@/lib/wordpress";

export default function RelatedPosts({ posts }: { posts: WPPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 relative overflow-hidden">
      <div className="text-center mb-10 relative">
        <span
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 font-display font-extrabold text-ink/5 text-6xl md:text-8xl tracking-widest select-none pointer-events-none"
          aria-hidden
        >
          RELATED
        </span>
        <h2 className="relative font-display font-extrabold text-3xl text-ink">
          More like this
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {posts.slice(0, 4).map((post) => {
          const img = featuredImage(post);
          return (
            <Link key={post.id} href={`/${post.slug}`} className="story-link group block">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-ink/5 mb-3">
                {img && (
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <h3 className="story-title font-display font-bold text-sm leading-snug text-ink mb-2">
                {decodeEntities(post.title.rendered)}
              </h3>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-ink/10 flex-shrink-0" />
                <span className="text-xs text-ink-soft">
                  {authorName(post)} · {new Date(post.date).toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
