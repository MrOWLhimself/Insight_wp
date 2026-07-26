/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // WordPress's permanent home going forward.
        hostname: "cms.citiplug.com",
      },
      {
        protocol: "https",
        // Still allowed during the migration window, in case any already
        // published post content references the old media URLs directly.
        hostname: "news.citiplug.com",
      },
      {
        protocol: "https",
        // Supabase Storage — logo uploads, team photos, promo card images.
        hostname: "uysipsegizbixwgvwdzl.supabase.co",
      },
    ],
  },

  // news.citiplug.com used to serve WordPress directly, so old post links
  // (and anything Google already indexed) look like
  // news.citiplug.com/some-post-slug/ — WordPress's flat "post name"
  // permalink style, no /posts/ prefix. Once news.citiplug.com is
  // repointed at this same Vercel project instead of WordPress, these
  // rules 301-redirect those old URLs to the equivalent page on
  // magazine.citiplug.com, preserving SEO and not breaking shared links.
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "news.citiplug.com" }],
        destination: "https://magazine.citiplug.com",
        permanent: true,
      },
      {
        // Matches a single path segment, e.g. /some-post-slug
        // Covers the common case: a flat WordPress post permalink.
        // Doesn't disambiguate old category-archive URLs that happened to
        // also be a single segment — if you had those indexed too, add
        // specific redirects for those exact slugs above this one.
        source: "/:slug",
        has: [{ type: "host", value: "news.citiplug.com" }],
        destination: "https://magazine.citiplug.com/:slug",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
