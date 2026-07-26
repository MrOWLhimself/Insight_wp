import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getTagBySlug,
  getCategories,
  decodeEntities,
} from "@/lib/wordpress";
import { getNavMenu, getSiteSettings, type NavMenuItem } from "@/lib/supabase";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { StoryCard } from "@/components/StoryCard";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

function navFallback(categories: { id: number; name: string; slug: string }[]): NavMenuItem[] {
  return categories.map((c, i) => ({
    category_id: c.id,
    category_slug: c.slug,
    link_type: "category" as const,
    custom_url: null,
    label: c.name,
    sort_order: i,
    visible: true,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return {};

  return {
    title: `#${tag.name}`,
    description: `Stories tagged "${tag.name}" on Insight Magazine.`,
    alternates: { canonical: `${SITE_URL}/tag/${tag.slug}` },
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const [posts, categories, navItems, siteSettings] = await Promise.all([
    // WP REST API supports filtering posts by tag ID directly.
    fetch(
      `${process.env.WP_API_URL ?? "https://cms.citiplug.com/wp-json"}/wp/v2/posts?tags=${tag.id}&_embed=true&per_page=20`,
      { next: { revalidate: 300 } }
    ).then((r) => r.json()),
    getCategories(),
    getNavMenu(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Masthead
        navItems={navItems.length > 0 ? navItems : navFallback(categories)}
        siteSettings={siteSettings}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: `#${tag.name}` }]} />

      <main className="max-w-7xl mx-auto px-6 py-14">
        <h1 className="font-display font-extrabold text-4xl text-ink mb-2">
          #{decodeEntities(tag.name)}
        </h1>
        <p className="eyebrow border-b border-rule pb-8 mb-10 block">{posts.length} stories</p>

        {posts.length === 0 ? (
          <p className="text-ink-soft">No stories tagged with this yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
            {posts.map((post: any) => (
              <StoryCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
