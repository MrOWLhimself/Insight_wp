import { getPosts, stripHtml } from "@/lib/wordpress";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300;

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getPosts({ perPage: 30 });

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/${post.slug}`;
      const description = stripHtml(post.excerpt.rendered).slice(0, 400);
      return `
    <item>
      <title>${escapeXml(stripHtml(post.title.rendered))}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Insight Magazine — by CitiPlug</title>
    <link>${SITE_URL}</link>
    <description>Culture, city, and campus life from Ijebu Ode and beyond.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
