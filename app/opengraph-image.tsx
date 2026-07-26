import { ImageResponse } from "next/og";
import { getPosts, featuredImage, decodeEntities } from "@/lib/wordpress";
import { loadOgFonts } from "@/lib/og-fonts";

export const runtime = "edge";
export const alt = "Insight Magazine — by CitiPlug";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [lead] = await getPosts({ perPage: 1 });
  const img = lead ? featuredImage(lead) : null;
  const fonts = await loadOgFonts(`Insight Magazine ${lead ? decodeEntities(lead.title.rendered) : ""}`);

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
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.55,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(24,29,41,0.95), rgba(24,29,41,0.4) 60%, rgba(24,29,41,0.75))",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", padding: 64 }}>
          <div
            style={{
              fontFamily: fonts.length ? "Tangerine" : "sans-serif",
              fontSize: 96,
              color: "#fff",
              lineHeight: 1,
              marginBottom: 24,
            }}
          >
            Insight Magazine
          </div>
          {lead && (
            <div
              style={{
                fontFamily: fonts.length ? "Manrope" : "sans-serif",
                fontWeight: 800,
                fontSize: 40,
                color: "#fff",
                lineHeight: 1.2,
                maxWidth: 950,
              }}
            >
              {decodeEntities(lead.title.rendered)}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
