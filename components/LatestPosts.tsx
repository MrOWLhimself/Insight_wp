import Link from "next/link";
import Image from "next/image";
import { WPPost, featuredImage, decodeEntities } from "@/lib/wordpress";
import AdSlot from "./AdSlot";
import LatestPostsList from "./LatestPostsList";

export default function LatestPosts({ posts }: { posts: WPPost[] }) {
  return (
    <section className="max-w-7xl mx-auto px-6 my-16">
      <h2 className="font-display font-extrabold text-4xl text-ink border-b border-rule pb-4 mb-10">
        New Posts
      </h2>

      <div className="grid md:grid-cols-[1fr_300px] gap-12 items-start">
        <LatestPostsList initialPosts={posts} />

        <aside className="flex flex-col gap-8 sticky top-6">
          <div>
            <h3 className="eyebrow text-orange border-b-2 border-ink pb-2.5 mb-4">Recent Comments</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Comment feed connects once Discussion is enabled in WordPress —
              placeholder until wired to a real endpoint.
            </p>
          </div>

          <div>
            <h3 className="eyebrow text-orange border-b-2 border-ink pb-2.5 mb-4">Star Features</h3>
            {posts.slice(0, 10).map((post) => {
              const img = featuredImage(post);
              return (
                <Link key={post.id} href={`/${post.slug}`} className="flex gap-3 mb-3.5 story-link">
                  <div className="relative w-14 h-14 flex-shrink-0 bg-ink/5">
                    {img && <Image src={img.url} alt={img.alt} fill className="object-cover" />}
                  </div>
                  <h4 className="story-title font-display font-bold text-[13px] leading-snug">
                    {decodeEntities(post.title.rendered)}
                  </h4>
                </Link>
              );
            })}
          </div>

          <AdSlot slotKey="insight_sidebar_1" size="300×250" className="h-[250px]" />
        </aside>
      </div>
    </section>
  );
}
