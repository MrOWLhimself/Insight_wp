// app/news-sitemap.xml/route.ts
//
// A dedicated Google News sitemap - separate from the regular sitemap.ts.
// Google News requires its own format (the news: namespace) and, unlike a
// normal sitemap, should ONLY list articles published in roughly the last
// 48 hours - that's the convention Google's crawler expects, and keeping
// it small/fresh is part of staying in good standing once approved in
// Google Publisher Center.
//
// This pulls from the same unified WordPress + Supabase post list used
// everywhere else on the site, so nothing here needs separate upkeep.

import { getUnifiedRecentPosts } from "@/lib/unified-posts";
import { getComparableDate, decodeEntities } from "@/lib/wordpress";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300; // regenerate every 5 minutes

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  // Pull a generous batch (recent posts across both sources), then filter
  // down to just the last 48 hours - Google News doesn't want a full
  // archive here, only what's genuinely fresh.
  const posts = await getUnifiedRecentPosts(50);
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const recentPosts = posts.filter((p) => getComparableDate(p) >= cutoff);

  const urlEntries = recentPosts
    .map((post) => {
      const title = escapeXml(decodeEntities(post.title.rendered));
      const pubDate = new Date(getComparableDate(post)).toISOString();
      return `  <url>
    <loc>${SITE_URL}/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Insight Magazine</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
