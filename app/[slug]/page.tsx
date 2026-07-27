import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import parse from "html-react-parser";
import {
  getPostBySlug,
  getCategoryBySlug,
  getPosts,
  getCategories,
  getComments,
  getTags,
  featuredImage,
  primaryCategoryName,
  authorName,
  stripHtml,
  decodeEntities,
} from "@/lib/wordpress";
import {
  getPostBySlug as getInsightPostBySlug,
  getAllPublishedPosts,
} from "@/lib/supabase-public";
import { getNavMenu, getSiteSettings, type NavMenuItem } from "@/lib/supabase";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import ShareCard from "@/components/ShareCard";
import ShareBar from "@/components/ShareBar";
import Comments from "@/components/Comments";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedPosts from "@/components/RelatedPosts";
import Gallery from "@/components/Gallery";
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

  const category = await getCategoryBySlug(slug);
  if (category) {
    return {
      title: decodeEntities(category.name),
      description: `${decodeEntities(category.name)} coverage from Insight Magazine by CitiPlug.`,
      alternates: { canonical: `${SITE_URL}/${category.slug}` },
      openGraph: {
        title: decodeEntities(category.name),
        description: `${decodeEntities(category.name)} coverage from Insight Magazine by CitiPlug.`,
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

  const category = await getCategoryBySlug(slug);
  if (category) return <CategoryView category={category} />;

  const insightPost = await getInsightPostBySlug(slug);
  if (insightPost) return <InsightPostView post={insightPost} />;

  notFound();
}

async function PostView({ post }: { post: Awaited<ReturnType<typeof getPostBySlug>> }) {
  if (!post) notFound();

  const [categories, recentPosts, navItems, siteSettings, comments, relatedPosts, tags] =
    await Promise.all([
      getCategories(),
      getPosts({ perPage: 7 }),
      getNavMenu(),
      getSiteSettings(),
      getComments(post.id),
      post.categories?.[0]
        ? getPosts({ category: post.categories[0], perPage: 5 })
        : Promise.resolve([]),
      getTags(post.id),
    ]);

  const img = featuredImage(post);
  const bodyChunks = chunkArticleByParagraphs(post.content.rendered, 4);

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
      <Masthead
        navItems={navItems.length > 0 ? navItems : navFallback(categories)}
        siteSettings={siteSettings}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: primaryCategoryName(post) },
          { label: decodeEntities(post.title.rendered) },
        ]}
      />

      <div className="bg-charcoal text-center py-16 px-6">
        <Link href="/" className="eyebrow">
          {primaryCategoryName(post)}
        </Link>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl leading-[1.1] text-white mt-4 mb-5 max-w-4xl mx-auto">
          {decodeEntities(post.title.rendered)}
        </h1>
        {(post.meta?.deck || (post.excerpt?.rendered && stripHtml(post.excerpt.rendered))) && (
          <p className="italic text-lg md:text-xl leading-relaxed text-[#C7C7CC] max-w-2xl mx-auto mb-6">
            {post.meta?.deck ? decodeEntities(post.meta.deck) : stripHtml(post.excerpt.rendered)}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono uppercase text-xs tracking-eyebrow text-[#9A9AA0]">
            {authorName(post)}
          </span>
          <span className="text-[#9A9AA0]">·</span>
          <span className="font-mono uppercase text-xs tracking-eyebrow text-[#9A9AA0]">
            {new Date(post.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {img && (
        <div
          className="relative w-full max-w-7xl mx-auto"
          style={{ aspectRatio: `${img.width} / ${img.height}` }}
        >
          <Image src={img.url} alt={img.alt} fill priority className="object-cover" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-[1fr_300px] gap-14 items-start">
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

        <aside className="flex flex-col gap-8 sticky top-6">
          <AdSlot slotKey="insight_article_sidebar_1" size="300×250" className="h-[250px]" />

          <div>
            <h3 className="text-xs uppercase tracking-eyebrow text-ink-soft border-b border-rule pb-2.5 mb-4">
              Recent Posts
            </h3>
            <div className="flex flex-col gap-4">
              {recentPosts
                .filter((p) => p.id !== post.id)
                .slice(0, 5)
                .map((p) => {
                  const rImg = featuredImage(p);
                  return (
                    <Link key={p.id} href={`/${p.slug}`} className="flex gap-3 story-link">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-ink/5">
                        {rImg && (
                          <Image src={rImg.url} alt={rImg.alt} fill className="object-cover" />
                        )}
                      </div>
                      <h4 className="story-title font-display font-bold text-sm leading-snug">
                        {decodeEntities(p.title.rendered)}
                      </h4>
                    </Link>
                  );
                })}
            </div>
          </div>

          <AdSlot slotKey="insight_article_sidebar_2" size="300×250" className="h-[250px]" />
        </aside>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="text-xs font-semibold uppercase tracking-wide border border-rule px-3 py-1.5 text-ink-soft hover:text-orange hover:border-orange transition-colors"
              >
                #{decodeEntities(tag.name)}
              </Link>
            ))}
          </div>
        )}

        <ShareCard
          title={decodeEntities(post.title.rendered)}
          imageUrl={img?.url}
          imageAlt={img?.alt}
          path={`/${post.slug}`}
        />
      </div>

      <RelatedPosts posts={relatedPosts.filter((p) => p.id !== post.id)} />

      <Comments postId={post.id} initialComments={comments} />

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

function InsightRecentPostRow({ post }: { post: any }) {
  return (
    <Link href={`/${post.slug}`} className="group flex gap-3 py-3">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
        {post.cover_image_url && (
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
          {post.insight_categories?.name ?? 'News'}
        </p>
        <h3 className="mt-1 text-sm font-semibold leading-snug group-hover:underline">{post.title}</h3>
      </div>
    </Link>
  );
}

function InsightRecentPostCard({ post }: { post: any }) {
  return (
    <Link href={`/${post.slug}`} className="group block">
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
    getAllPublishedPosts(10),
  ]);

  const body: any[] = (post.content as any)?.body ?? [];
  const gallery: string[] = (post.content as any)?.gallery ?? [];
  const [firstHalf, secondHalf] = splitBodyForAd(body);
  const recentPosts = recentAll.filter((p) => p.slug !== post.slug).slice(0, 6);
  const categoryName = post.insight_categories?.name ?? 'News';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
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

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-600">{categoryName}</p>
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
  category: Awaited<ReturnType<typeof getCategoryBySlug>>;
}) {
  if (!category) notFound();

  const [posts, categories, navItems, siteSettings] = await Promise.all([
    getPosts({ category: category.id, perPage: 13 }),
    getCategories(),
    getNavMenu(),
    getSiteSettings(),
  ]);

  const [lead, ...rest] = posts;

  return (
    <>
      <Masthead
        navItems={navItems.length > 0 ? navItems : navFallback(categories)}
        siteSettings={siteSettings}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: decodeEntities(category.name) }]} />

      <main>
        <div className="max-w-7xl mx-auto px-6 pt-10">
          <h1 className="font-display font-extrabold text-5xl text-ink mb-2">
            {decodeEntities(category.name)}
          </h1>
          <p className="eyebrow border-b border-rule pb-8 mb-10 block">
            {category.count} stories
          </p>
        </div>

        {posts.length === 0 ? (
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
