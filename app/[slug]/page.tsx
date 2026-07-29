import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import parse from "html-react-parser";
import {
  getPostBySlug,
  getPosts,
  getCategories,
  getComments,
  getTags,
  featuredImage,
  primaryCategoryName,
  authorName,
  stripHtml,
  decodeEntities,
  type WPPost,
} from "@/lib/wordpress";
import {
  getPostBySlug as getInsightPostBySlug,
} from "@/lib/supabase-public";
import { getNavMenu, getSiteSettings, type NavMenuItem } from "@/lib/supabase";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import ShareBar from "@/components/ShareBar";
import CategoryBadge from "@/components/CategoryBadge";
import { getUnifiedRecentPosts, getUnifiedCategory } from "@/lib/unified-posts";
import Comments from "@/components/Comments";
import Breadcrumbs from "@/components/Breadcrumbs";
import Gallery from "@/components/Gallery";
import PixiesetEmbed from "@/components/PixiesetEmbed";
import { HeroStory, StoryCard } from "@/components/StoryCard";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

// No "/posts/" or "/category/" prefix — a single flat namespace, same as
// WordPress's own default permalink style. A given slug is resolved as a
// WordPress post first (posts vastly outnumber categories, and this matches
// how WordPress itself prioritizes a matching post/page over a category
// archive when a slug could technically be either), then as a WordPress
// category, then as a Supabase-authored post (Newsroom / BBNaija S11 /
// any future insight_posts content), then 404.

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

  const post = await getPostBySlug(slug);
  if (post) {
    const yoast = post.yoast_head_json;
    const yoastImage = yoast?.og_image?.[0]?.url;
    return {
      title: yoast?.title ?? decodeEntities(post.title.rendered),
      description: yoast?.description,
      alternates: { canonical: `${SITE_URL}/${post.slug}` },
      openGraph: {
        title: yoast?.title ?? decodeEntities(post.title.rendered),
        description: yoast?.description,
        // Only set an explicit image if an editor picked a custom social
        // image in Yoast — otherwise the branded opengraph-image.tsx
        // template is the only image Next.js generates for this page.
        ...(yoastImage ? { images: [yoastImage] } : {}),
        type: "article",
      },
    };
  }

  const category = await getUnifiedCategory(slug);
  if (category) {
    return {
      title: category.name,
      description: `${category.name} coverage from Insight Magazine by CitiPlug.`,
      alternates: { canonical: `${SITE_URL}/${category.slug}` },
      openGraph: {
        title: category.name,
        description: `${category.name} coverage from Insight Magazine by CitiPlug.`,
        url: `${SITE_URL}/${category.slug}`,
      },
    };
  }

  const insightPost = await getInsightPostBySlug(slug);
  if (insightPost) {
    return {
      title: insightPost.seo_title || insightPost.title,
      description: insightPost.seo_description || insightPost.excerpt || undefined,
      alternates: { canonical: insightPost.canonical_url || `${SITE_URL}/${insightPost.slug}` },
      openGraph: {
        title: insightPost.seo_title || insightPost.title,
        description: insightPost.seo_description || insightPost.excerpt || undefined,
        images: insightPost.cover_image_url ? [insightPost.cover_image_url] : undefined,
        url: insightPost.canonical_url || `${SITE_URL}/${insightPost.slug}`,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: insightPost.seo_title || insightPost.title,
        description: insightPost.seo_description || insightPost.excerpt || undefined,
        images: insightPost.cover_image_url ? [insightPost.cover_image_url] : undefined,
      },
    };
  }

  return {};
}

// Splits the raw WP HTML into chunks of `perChunk` top-level paragraphs,
// so an <AdSlot> can be rendered between every N paragraphs of the body.
function chunkArticleByParagraphs(html: string, perChunk: number) {
  const nodes = parse(html) as React.ReactNode[];
  const nodeArray = Array.isArray(nodes) ? nodes : [nodes];

  const chunks: React.ReactNode[][] = [[]];
  let pCount = 0;

  for (const node of nodeArray) {
    chunks[chunks.length - 1].push(node);
    const isParagraph =
      typeof node === "object" && node !== null && (node as any).type === "p";
    if (isParagraph) {
      pCount++;
      if (pCount % perChunk === 0) chunks.push([]);
    }
  }

  return chunks.filter((c) => c.length > 0);
}

// Same idea for our own paragraph-array body format used by Supabase posts.
// Body blocks can be paragraphs or inline images now. This just splits the
// full ordered array roughly in half so an <AdSlot> can sit between them —
// it no longer filters out non-paragraph blocks like the old version did.
function splitBodyForAd(body: any[]): [any[], any[]] {
  const midpoint = Math.ceil(body.length / 2);
  return [body.slice(0, midpoint), body.slice(midpoint)];
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);
  if (post) return <PostView post={post} />;

  const category = await getUnifiedCategory(slug);
  if (category) return <CategoryView category={category} />;

  const insightPost = await getInsightPostBySlug(slug);
  if (insightPost) return <InsightPostView post={insightPost} />;

  notFound();
}

// ============================= WordPress Post View =============================
//
// Now matches InsightPostView's look exactly (full nav header, plain black
// title, italic deck, ShareBar, ad slots, two-column layout with sidebar
// Recent Posts) instead of the old dark-hero style. "Recent Posts" and
// the bottom "More Like This" grid both pull from getUnifiedRecentPosts,
// so WordPress and Supabase posts are mixed together identically here —
// same as on InsightPostView.

async function PostView({ post }: { post: Awaited<ReturnType<typeof getPostBySlug>> }) {
  if (!post) notFound();

  const [categories, recentAll, navItems, siteSettings, comments, tags] =
    await Promise.all([
      getCategories(),
      getUnifiedRecentPosts(10),
      getNavMenu(),
      getSiteSettings(),
      getComments(post.id),
      getTags(post.id),
    ]);

  const img = featuredImage(post);
  const bodyChunks = chunkArticleByParagraphs(post.content.rendered, 4);
  const recentPosts = recentAll.filter((p) => p.id !== post.id).slice(0, 6);
  const categoryName = primaryCategoryName(post);
  const deck = post.meta?.deck
    ? decodeEntities(post.meta.deck)
    : post.excerpt?.rendered
    ? stripHtml(post.excerpt.rendered)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: decodeEntities(post.title.rendered),
    datePublished: post.date,
    author: { "@type": "Person", name: authorName(post) },
    image: img ? [img.url] : [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Masthead
        navItems={navItems.length > 0 ? navItems : navFallback(categories)}
        siteSettings={siteSettings}
      />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

          <div className="lg:col-span-2">
            {img && (
              <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
                <Image src={img.url} alt={img.alt} fill className="object-cover" priority />
              </div>
            )}

            <CategoryBadge category={categoryName} className="mb-2" />
            <h1 className="text-3xl font-extrabold tracking-tight">{decodeEntities(post.title.rendered)}</h1>
            {deck && <p className="mt-3 text-lg italic text-gray-600">{deck}</p>}

            <ShareBar
              url={`https://magazine.citiplug.com/${post.slug}`}
              title={decodeEntities(post.title.rendered)}
            />

            <AdSlot slotKey="insight_article_inline" size="728×90" className="my-6 h-[90px] w-full" />

            <article>
              {bodyChunks.map((chunk, i) => (
                <div key={i}>
                  <div className="article-body">{chunk}</div>
                  {i < bodyChunks.length - 1 && (
                    <AdSlot
                      slotKey="insight_article_inline"
                      size="728×90"
                      className="h-[120px] my-2 mb-8"
                    />
                  )}
                </div>
              ))}
            </article>

            {tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600 hover:bg-gray-200"
                  >
                    #{decodeEntities(tag.name)}
                  </Link>
                ))}
              </div>
            )}

            {post.meta?.pixieset_url && (
              <PixiesetEmbed url={post.meta.pixieset_url} title={decodeEntities(post.title.rendered)} />
            )}

            {recentPosts.length > 0 && (
              <section className="mt-14 border-t border-gray-200 pt-8">
                <h2 className="mb-6 text-xl font-bold">More Like This</h2>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                  {recentPosts.slice(0, 3).map((p) => {
                    const pImg = featuredImage(p);
                    return (
                      <Link key={p.id} href={`/${p.slug}`} className="group block">
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
                          {pImg && (
                            <Image src={pImg.url} alt={pImg.alt} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                          )}
                        </div>
                        <CategoryBadge category={primaryCategoryName(p)} className="mt-2" />
                        <h3 className="font-semibold group-hover:underline">{decodeEntities(p.title.rendered)}</h3>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="mt-14 border-t border-gray-200 pt-8">
              <Comments postId={post.id} initialComments={comments} />
            </div>
          </div>

          <aside className="lg:col-span-1">
            <AdSlot slotKey="insight_article_sidebar_1" size="300×250" className="mb-8 h-[250px] w-full" />

            <h2 className="mb-2 border-b-2 border-orange-500 pb-2 text-sm font-bold uppercase tracking-wide">
              Recent Posts
            </h2>
            <div className="divide-y divide-gray-100">
              {recentPosts.map((p) => {
                const pImg = featuredImage(p);
                return (
                  <Link key={p.id} href={`/${p.slug}`} className="group flex gap-3 py-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      {pImg && (
                        <Image src={pImg.url} alt={pImg.alt} fill className="object-cover" />
                      )}
                    </div>
                    <div>
                        <CategoryBadge category={primaryCategoryName(p)} className="mt-2" />
                      <h3 className="mt-1 text-sm font-semibold leading-snug group-hover:underline">
                        {decodeEntities(p.title.rendered)}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>

            <AdSlot slotKey="insight_article_sidebar_2" size="300×250" className="mt-8 h-[250px] w-full" />
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}

// ============================= Insight (Supabase) Post View =============================
//
// Matches the Newsroom template's look exactly (full nav header, plain
// black title, italic deck, ShareBar with X/WhatsApp/Facebook/Copy link,
// ad slots, two-column layout with sidebar Recent Posts) rather than the
// WordPress-style dark hero — so every post, WordPress or Supabase, looks
// consistent when reached at its plain /slug URL (no folder prefix).

function InsightRecentPostRow({ post }: { post: WPPost }) {
  const img = featuredImage(post);
  return (
    <Link href={`/${post.slug}`} className="group flex gap-3 py-3">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
        {img && (
          <Image src={img.url} alt={img.alt} fill className="object-cover" />
        )}
      </div>
      <div>
                      <CategoryBadge category={primaryCategoryName(post)} />
        <h3 className="mt-1 text-sm font-semibold leading-snug group-hover:underline">
          {decodeEntities(post.title.rendered)}
        </h3>
      </div>
    </Link>
  );
}

function InsightRecentPostCard({ post }: { post: WPPost }) {
  const img = featuredImage(post);
  return (
    <Link href={`/${post.slug}`} className="group block">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
        {img && (
          <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
        )}
      </div>
      <CategoryBadge category={primaryCategoryName(post)} className="mt-2" />
      <h3 className="font-semibold group-hover:underline">{decodeEntities(post.title.rendered)}</h3>
    </Link>
  );
}

async function InsightPostView({
  post,
}: {
  post: NonNullable<Awaited<ReturnType<typeof getInsightPostBySlug>>>;
}) {
  const [categories, navItems, siteSettings, recentAll] = await Promise.all([
    getCategories(),
    getNavMenu(),
    getSiteSettings(),
    getUnifiedRecentPosts(10),
  ]);

  const body: any[] = (post.content as any)?.body ?? [];
  const gallery: string[] = (post.content as any)?.gallery ?? [];
  const pixiesetUrl: string | undefined = (post.content as any)?.pixieset_url;
  const [firstHalf, secondHalf] = splitBodyForAd(body);
  const recentPosts = recentAll.filter((p) => p.slug !== post.slug).slice(0, 6);
  const categoryName = post.insight_categories?.name ?? 'News';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    image: post.cover_image_url || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.published_at || undefined,
    mainEntityOfPage: post.canonical_url || undefined,
    author: { "@type": "Organization", name: "Insight Magazine" },
    publisher: { "@type": "Organization", name: "Insight Magazine" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Masthead
        navItems={navItems.length > 0 ? navItems : navFallback(categories)}
        siteSettings={siteSettings}
      />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

          <div className="lg:col-span-2">
            {post.cover_image_url && (
              <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100">
                <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" priority />
              </div>
            )}

            <CategoryBadge category={categoryName} className="mb-2" />
            <h1 className="text-3xl font-extrabold tracking-tight">{post.title}</h1>
            {post.excerpt && <p className="mt-3 text-lg italic text-gray-600">{post.excerpt}</p>}

            <ShareBar
              url={post.canonical_url || `https://magazine.citiplug.com/${post.slug}`}
              title={post.title}
            />

            <AdSlot slotKey="insight_article_inline" size="728×90" className="my-6 h-[90px] w-full" />

            <article className="mt-2 max-w-none text-gray-700">
              {firstHalf.map(function (block: any, j: number) {
                if (block.type === "image") {
                  return (
                    <div key={j} className="relative my-6 aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100">
                      <Image src={block.url} alt={block.alt || post.title} fill className="object-cover" />
                    </div>
                  );
                } else if (block.type === "heading") {
                  return <h3 key={j} className="mt-8 mb-3 text-xl font-bold">{block.text}</h3>;
                } else if (block.type === "list") {
                  return (
                    <ol key={j} className="mb-4 list-decimal pl-6 space-y-1">
                      {(block.items || []).map((item: string, k: number) => (
                        <li key={k}>{item}</li>
                      ))}
                    </ol>
                  );
                } else if (block.type === "paragraph") {
                  return <p key={j} className="mb-4 leading-relaxed">{block.text}</p>;
                }
                return null;
              })}
            </article>

            {secondHalf.length > 0 && (
              <>
                <AdSlot slotKey="insight_article_inline" size="728×90" className="my-6 h-[90px] w-full" />
                <article className="max-w-none text-gray-700">
                  {secondHalf.map(function (block: any, j: number) {
                    if (block.type === "image") {
                      return (
                        <div key={j} className="relative my-6 aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100">
                          <Image src={block.url} alt={block.alt || post.title} fill className="object-cover" />
                        </div>
                      );
                    } else if (block.type === "heading") {
                      return <h3 key={`b-${j}`} className="mt-8 mb-3 text-xl font-bold">{block.text}</h3>;
                    } else if (block.type === "list") {
                      return (
                        <ol key={`b-${j}`} className="mb-4 list-decimal pl-6 space-y-1">
                          {(block.items || []).map((item: string, k: number) => (
                            <li key={k}>{item}</li>
                          ))}
                        </ol>
                      );
                    } else if (block.type === "paragraph") {
                      return <p key={`b-${j}`} className="mb-4 leading-relaxed">{block.text}</p>;
                    }
                    return null;
                  })}
                </article>
              </>
            )}

            {gallery.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-4 text-xl font-bold">Gallery</h2>
                <Gallery images={gallery} title={post.title} />
              </section>
            )}

            {pixiesetUrl && (
              <PixiesetEmbed url={pixiesetUrl} title={post.title} />
            )}

            {recentPosts.length > 0 && (
              <section className="mt-14 border-t border-gray-200 pt-8">
                <h2 className="mb-6 text-xl font-bold">Recent Posts</h2>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                  {recentPosts.slice(0, 3).map((p) => (
                    <InsightRecentPostCard key={p.id} post={p} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-1">
            <AdSlot slotKey="insight_article_sidebar_1" size="300×250" className="mb-8 h-[250px] w-full" />

            <h2 className="mb-2 border-b-2 border-orange-500 pb-2 text-sm font-bold uppercase tracking-wide">
              Recent Posts
            </h2>
            <div className="divide-y divide-gray-100">
              {recentPosts.map((p) => (
                <InsightRecentPostRow key={p.id} post={p} />
              ))}
            </div>

            <AdSlot slotKey="insight_article_sidebar_2" size="300×250" className="mt-8 h-[250px] w-full" />
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}

async function CategoryView({
  category,
}: {
  category: NonNullable<Awaited<ReturnType<typeof getUnifiedCategory>>>;
}) {
  const [categories, navItems, siteSettings] = await Promise.all([
    getCategories(),
    getNavMenu(),
    getSiteSettings(),
  ]);

  const [lead, ...rest] = category.posts;

  return (
    <>
      <Masthead
        navItems={navItems.length > 0 ? navItems : navFallback(categories)}
        siteSettings={siteSettings}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: category.name }]} />

      <main>
        <div className="max-w-7xl mx-auto px-6 pt-10">
          <h1 className="font-display font-extrabold text-5xl text-ink mb-2">
            {category.name}
          </h1>
          <p className="eyebrow border-b border-rule pb-8 mb-10 block">
            {category.posts.length} stories
          </p>
        </div>

        {category.posts.length === 0 ? (
          <p className="text-ink-soft max-w-7xl mx-auto px-6 pb-16">
            No stories published in this section yet.
          </p>
        ) : (
          <>
            <div className="max-w-7xl mx-auto px-6 mb-14">
              <HeroStory post={lead} />
            </div>

            <AdSlot slotKey="insight_home_leaderboard_top" size="970×90" className="max-w-7xl mx-4 md:mx-auto my-9 h-[90px]" />

            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
                {rest.map((post) => (
                  <StoryCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
