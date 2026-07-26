// ImageResponse (used by every opengraph-image.tsx in this app) needs
// fonts as raw binary data, not CSS @font-face links — so we fetch the
// actual font file from Google Fonts at request time. This is the
// standard pattern for next/og; I can't test the live fetch from my own
// sandbox (Google Fonts isn't in my network allowlist), so verify this
// actually renders correctly once deployed to Vercel, which has open
// outbound network access.

async function fetchFont(fontFamily: string, weight: number, text: string) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    fontFamily
  )}:wght@${weight}&text=${encodeURIComponent(text)}`;

  const css = await fetch(cssUrl, {
    headers: {
      // Google Fonts serves woff2 to modern browsers but only TTF/OTF to
      // older user-agents — satori (which ImageResponse uses) can't parse
      // woff2, so we spoof an old UA to force a TTF response.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.7 Safari/534.34",
    },
  }).then((res) => res.text());

  const fontUrlMatch = css.match(/src: url\(([^)]+)\)/);
  if (!fontUrlMatch) throw new Error(`Could not resolve font URL for ${fontFamily}`);

  const fontRes = await fetch(fontUrlMatch[1]);
  return fontRes.arrayBuffer();
}

export async function loadOgFonts(text: string) {
  // Falls back to no custom fonts (satori's default sans) if either fetch
  // fails, so a font-loading hiccup never breaks the whole OG image.
  try {
    const [manropeBold, tangerineBold] = await Promise.all([
      fetchFont("Manrope", 800, text),
      fetchFont("Tangerine", 700, "Insight Magazine"),
    ]);

    return [
      { name: "Manrope", data: manropeBold, weight: 800 as const, style: "normal" as const },
      { name: "Tangerine", data: tangerineBold, weight: 700 as const, style: "normal" as const },
    ];
  } catch (err) {
    console.error("OG font load failed, falling back to default font:", err);
    return [];
  }
}
