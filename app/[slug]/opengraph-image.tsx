import { ImageResponse } from "next/og";
import {
  getPostBySlug,
  getCategoryBySlug,
  getPosts,
  featuredImage,
  primaryCategoryName,
  decodeEntities,
} from "@/lib/wordpress";
import { loadOgFonts } from "@/lib/og-fonts";

export const runtime = "edge";
export const alt = "Insight Magazine";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);
  if (post) return postImage(post);

  const category = await getCategoryBySlug(slug);
  if (category) return categoryImage(category);

  return fallbackImage();
}

async function postImage(post: Awaited<ReturnType<typeof getPostBySlug>>) {
  if (!post) return fallbackImage();

  const img = featuredImage(post);
  const category = primaryCategoryName(post);
  const title = decodeEntities(post.title.rendered);
  const fonts = await loadOgFonts(`Insight Magazine ${category} ${title}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          background: "#181D29",
        }}
      >
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            width={1200}
            height={630}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(24,29,41,0.96), rgba(24,29,41,0.25) 55%, rgba(24,29,41,0.05))",
          }}
        />
        <div style={{ position: "absolute", top: 40, left: 56, fontFamily: fonts.length ? "Tangerine" : "sans-serif", fontSize: 56, color: "#fff", display: "flex" }}>
          Insight Magazine
        </div>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", padding: 56 }}>
          <div style={{ fontFamily: fonts.length ? "Manrope" : "sans-serif", fontWeight: 800, fontSize: 20, textTransform: "uppercase", letterSpacing: 4, color: "#F97316", marginBottom: 20, display: "flex" }}>
            {category}
          </div>
          <div style={{ fontFamily: fonts.length ? "Manrope" : "sans-serif", fontWeight: 800, fontSize: 52, color: "#fff", lineHeight: 1.15, maxWidth: 1000, display: "flex" }}>
            {title}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}

async function categoryImage(category: Awaited<ReturnType<typeof getCategoryBySlug>>) {
  if (!category) return fallbackImage();

  const posts = await getPosts({ category: category.id, perPage: 1 });
  const img = posts[0] ? featuredImage(posts[0]) : null;
  const fonts = await loadOgFonts(`Insight Magazine ${decodeEntities(category.name)}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          background: "linear-gradient(135deg, #E8491C, #181D29)",
        }}
      >
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            width={1200}
            height={630}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(24,29,41,0.9), rgba(24,29,41,0.3))" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", padding: 64 }}>
          <div style={{ fontFamily: fonts.length ? "Tangerine" : "sans-serif", fontSize: 56, color: "#fff", marginBottom: 28, display: "flex" }}>
            Insight Magazine
          </div>
          <div style={{ fontFamily: fonts.length ? "Manrope" : "sans-serif", fontWeight: 800, fontSize: 72, color: "#fff", display: "flex" }}>
            {decodeEntities(category.name)}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}

async function fallbackImage() {
  const fonts = await loadOgFonts("Insight Magazine");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#181D29",
        }}
      >
        <div style={{ fontFamily: fonts.length ? "Tangerine" : "sans-serif", fontSize: 96, color: "#fff" }}>
          Insight Magazine
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
