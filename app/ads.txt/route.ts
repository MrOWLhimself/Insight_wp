export async function GET() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  if (!publisherId) {
    return new Response("", { headers: { "Content-Type": "text/plain" } });
  }

  // publisherId looks like "ca-pub-1234567890123456" — ads.txt wants just
  // the numeric part.
  const pubId = publisherId.replace("ca-pub-", "pub-");

  return new Response(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0`, {
    headers: { "Content-Type": "text/plain" },
  });
}
