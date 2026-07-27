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
function splitBodyForAd<T>(body: T[]): [T[], T[]] {
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
// Same visual shell as PostView above (dark hero header, breadcrumbs, ad
// slots, sticky sidebar with Recent Posts, ShareCard, Footer) but sourced
// from Supabase (insight_posts) instead of WordPress, and rendering our
// paragraph-array body format instead of raw HTML. This is what makes
// /bbnaija-season-11-house-first-look (no folder prefix) work, alongside
// any future post I publish to Newsroom or BBNaija S11.

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

  const body = (post.content as any)?.body ?? [];
  const gallery: string[] = (post.content as any)?.gallery ?? [];
  const [firstHalf, secondHalf] = splitBodyForAd(body);
  const recentPosts = recentAll.filter((p) => p.slug !== post.slug).slice(0, 5);
  const categoryName = post.insight_categories?.name ?? "News";

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
          { label: categoryName },
          { label: post.title },
        ]}
      />

      <div className="bg-charcoal text-center py-16 px-6">
        <Link href="/" className="eyebrow">
          {categoryName}
        </Link>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl leading-[1.1] text-white mt-4 mb-5 max-w-4xl mx-auto">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="italic text-lg md:text-xl leading-relaxed text-[#C7C7CC] max-w-2xl mx-auto mb-6">
            {post.excerpt}
          </p>
        )}
        {post.published_at && (
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono uppercase text-xs tracking-eyebrow text-[#9A9AA0]">
              Insight Magazine
            </span>
            <span className="text-[#9A9AA0]">·</span>
            <span className="font-mono uppercase text-xs tracking-eyebrow text-[#9A9AA0]">
              {new Date(post.published_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {post.cover_image_url && (
        <div className="relative w-full max-w-7xl mx-auto aspect-[16/9]">
          <Image src={post.cover_image_url} alt={post.title} fill priority className="object-cover" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-[1fr_300px] gap-14 items-start">
        <article>
          <div className="article-body">
            {firstHalf.map((block, j) =>
              block.type === "image" ? (
                <div key={j} className="relative my-6 aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100">
                  <Image src={block.url} alt={block.alt || post.title} fill className="object-cover" />
                </div>
              ) : block.type === "heading" ? (
                <h3 key={j} className="mt-8 mb-3 text-xl font-bold">{block.text}</h3>
              ) : block.type === "list" ? (
                <ol key={j} className="mb-4 list-decimal pl-6 space-y-1">
                  {(block.items || []).map((item: string, k: number) => (
                    <li key={k}>{item}</li>
                  ))}
                </ol>
              ) : (
                <p key={j} className="mb-4 leading-relaxed">{block.text}</p>
              )
            )}
          </div>

          {secondHalf.length > 0 && (
            <>
              <AdSlot slotKey="insight_article_inline" size="728×90" className="h-[120px] my-2 mb-8" />
              <div className="article-body">
                {secondHalf.map((block, j) =>
                  block.type === "image" ? (
                    <div key={j} className="relative my-6 aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100">
                      <Image src={block.url} alt={block.alt || post.title} fill className="object-cover" />
                    </div>
                  ) : block.type === "heading" ? (
                    <h3 key={`b-${j}`} className="mt-8 mb-3 text-xl font-bold">{block.text}</h3>
                  ) : block.type === "list" ? (
                    <ol key={`b-${j}`} className="mb-4 list-decimal pl-6 space-y-1">
                      {(block.items || []).map((item: string, k: number) => (
                        <li key={k}>{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <p key={`b-${j}`} className="mb-4 leading-relaxed">{block.text}</p>
                  )
                )}
              </div>
            </>
          )}

          {gallery.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-xl font-bold">Gallery</h2>
              <Gallery images={gallery} title={post.title} />
            </section>
          )}
        </article>

        <aside className="flex flex-col gap-8 sticky top-6">
          <AdSlot slotKey="insight_article_sidebar_1" size="300×250" className="h-[250px]" />

          <div>
            <h3 className="text-xs uppercase tracking-eyebrow text-ink-soft border-b border-rule pb-2.5 mb-4">
              Recent Posts
            </h3>
            <div className="flex flex-col gap-4">
              {recentPosts.map((p) => (
                <Link key={p.id} href={`/${p.slug}`} className="flex gap-3 story-link">
                  <div className="relative w-16 h-16 flex-shrink-0 bg-ink/5">
                    {p.cover_image_url && (
                      <Image src={p.cover_image_url} alt={p.title} fill className="object-cover" />
                    )}
                  </div>
                  <h4 className="story-title font-display font-bold text-sm leading-snug">
                    {p.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>

          <AdSlot slotKey="insight_article_sidebar_2" size="300×250" className="h-[250px]" />
        </aside>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <ShareCard
          title={post.title}
          imageUrl={post.cover_image_url || undefined}
          imageAlt={post.title}
          path={`/${post.slug}`}
        />
      </div>

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
