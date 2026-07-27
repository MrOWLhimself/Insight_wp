// All content comes from WordPress's REST API. WordPress is never rendered
// directly to visitors — it only supplies JSON. Set WP_API_URL in your
// environment to your WordPress subdomain, e.g. https://news.citiplug.com/wp-json

const WP_API_URL = process.env.WP_API_URL ?? "https://news.citiplug.com/wp-json";

export type WPPost = {
  id: number;
  slug: string;
  date: string;
  date_gmt?: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
  meta?: { deck?: string };
  yoast_head_json?: {
    title?: string;
    description?: string;
    og_image?: { url: string }[];
    canonical?: string;
  };
  _embedded?: {
    "wp:featuredmedia"?: {
      source_url: string;
      media_details?: { width: number; height: number };
      alt_text?: string;
    }[];
    author?: { name: string }[];
    "wp:term"?: { id: number; name: string; slug: string }[][];
  };
};

export type WPCategory = {
  id: number;
  slug: string;
  name: string;
  count: number;
};

async function wpFetch<T>(path: string, revalidateSeconds = 300): Promise<T> {
  const res = await fetch(`${WP_API_URL}${path}`, {
    next: { revalidate: revalidateSeconds }, // ISR: rebuilds this data in the background
  });

  if (!res.ok) {
    throw new Error(`WordPress API error ${res.status} on ${path}`);
  }

  return res.json();
}

export async function getPosts(params?: {
  category?: number;
  perPage?: number;
  page?: number;
}): Promise<WPPost[]> {
  const search = new URLSearchParams({
    _embed: "true",
    per_page: String(params?.perPage ?? 12),
    page: String(params?.page ?? 1),
  });
  if (params?.category) search.set("categories", String(params.category));

  return wpFetch<WPPost[]>(`/wp/v2/posts?${search.toString()}`);
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>(
    `/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=true`
  );
  return posts[0] ?? null;
}

export async function getCategories(): Promise<WPCategory[]> {
  return wpFetch<WPCategory[]>(`/wp/v2/categories?per_page=50&hide_empty=true`);
}

export async function getCategoryBySlug(
  slug: string
): Promise<WPCategory | null> {
  const cats = await wpFetch<WPCategory[]>(
    `/wp/v2/categories?slug=${encodeURIComponent(slug)}`
  );
  return cats[0] ?? null;
}

// --- Small helpers used across pages ---

export function featuredImage(post: WPPost) {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  return media
    ? {
        url: media.source_url,
        alt: media.alt_text || post.title.rendered,
        width: media.media_details?.width || 1600,
        height: media.media_details?.height || 900,
      }
    : null;
}

export function primaryCategoryName(post: WPPost) {
  const terms = post._embedded?.["wp:term"]?.[0];
  return terms?.[0]?.name ?? "Feature";
}

export function authorName(post: WPPost) {
  return post._embedded?.author?.[0]?.name ?? "Insight Editorial";
}

// Reliable UTC timestamp for sorting/comparing posts across sources.
// WordPress's `date` field is site-local time with no timezone marker,
// which can throw off direct comparisons against true UTC timestamps
// (like Supabase's published_at). `date_gmt` is always UTC — use this
// wherever posts from different sources need to be sorted together.
export function getComparableDate(post: WPPost): number {
  const raw = post.date_gmt ?? post.date;
  // Only append "Z" if the string has no timezone marker at all — some
  // sources (Supabase) already include a proper offset like "+00:00",
  // and blindly appending "Z" to those would produce an invalid date.
  const hasTimezone = /(Z|[+-]\d{2}:?\d{2})$/.test(raw);
  const iso = hasTimezone ? raw : `${raw}Z`;
  return new Date(iso).getTime();
}

// WordPress's "wptexturize" feature encodes smart quotes/dashes as HTML
// entities (&#8217; for a curly apostrophe, etc.) even in fields like
// title.rendered that have no actual HTML tags. Since we render these as
// plain React text (not parsed HTML), the entities show up as literal
// text unless decoded here first.
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
};

export function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (match, name) => NAMED_ENTITIES[name] ?? match);
}

export function stripHtml(html: string) {
  return decodeEntities(html.replace(/<[^>]+>/g, "").trim());
}

export type WPTag = {
  id: number;
  slug: string;
  name: string;
  count: number;
};

export async function getTags(postId?: number): Promise<WPTag[]> {
  if (postId) {
    // Tags actually attached to a specific post — used for the chip row
    // under an article.
    const post = await wpFetch<WPPost[]>(`/wp/v2/posts?include=${postId}&_embed=true`);
    const termGroups = post[0]?._embedded?.["wp:term"] ?? [];
    // WordPress groups terms by taxonomy in wp:term — categories are index
    // 0, tags are index 1, by default core taxonomy registration order.
    const tagGroup = termGroups[1] ?? [];
    return tagGroup as unknown as WPTag[];
  }
  return wpFetch<WPTag[]>(`/wp/v2/tags?per_page=100&hide_empty=true`);
}

export async function getTagBySlug(slug: string): Promise<WPTag | null> {
  const tags = await wpFetch<WPTag[]>(`/wp/v2/tags?slug=${encodeURIComponent(slug)}`);
  return tags[0] ?? null;
}

export type WPComment = {
  id: number;
  author_name: string;
  date: string;
  content: { rendered: string };
  status?: string;
};

export async function getComments(postId: number): Promise<WPComment[]> {
  return wpFetch<WPComment[]>(`/wp/v2/comments?post=${postId}&order=asc&per_page=100`, 60);
}

export async function searchPosts(query: string, perPage = 12): Promise<WPPost[]> {
  if (!query.trim()) return [];
  return wpFetch<WPPost[]>(
    `/wp/v2/posts?search=${encodeURIComponent(query)}&_embed=true&per_page=${perPage}`,
    60
  );
}

export function formatIssueDate(date = new Date()) {
  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
}
