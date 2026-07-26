// The site's public domain. Every canonical URL, sitemap entry, and Open
// Graph tag reads from here. Set NEXT_PUBLIC_SITE_URL in .env.local /
// Vercel — this is permanently magazine.citiplug.com now that the domain
// is decided.
//
// This lives in its own file, not app/layout.tsx, because Next.js's App
// Router only allows specific known exports (default, metadata,
// generateMetadata, viewport...) from layout/page files — any other named
// export fails the build with "X is not a valid Layout export field".
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citiplug.com";
