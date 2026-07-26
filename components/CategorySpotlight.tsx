import Link from "next/link";
import Image from "next/image";
import { WPPost, featuredImage, decodeEntities } from "@/lib/wordpress";

export default function CategorySpotlight({
  categoryName,
  posts,
}: {
  categoryName: string;
  posts: WPPost[];
}) {
  if (posts.length === 0) return null;

  return (
    <section
      className="py-11"
      style={{ background: "linear-gradient(135deg, #E8491C, #F97316)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end border-b border-white/30 pb-2.5 mb-6">
          <span className="eyebrow text-white">Category Spotlight</span>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full border border-white/50 text-white text-sm">
              ‹
            </button>
            <button className="w-8 h-8 rounded-full border border-white/50 text-white text-sm">
              ›
            </button>
          </div>
        </div>

        <h3 className="font-serif italic text-4xl text-white mb-6" style={{ fontFamily: "Georgia, serif" }}>
          {categoryName.toLowerCase()}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {posts.slice(0, 4).map((post) => {
            const img = featuredImage(post);
            return (
              <Link
                key={post.id}
                href={`/${post.slug}`}
                className="relative block aspect-[3/4] overflow-hidden border border-white/25 group"
              >
                {img && (
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white font-display font-extrabold text-[15px] leading-snug">
                  {decodeEntities(post.title.rendered)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
