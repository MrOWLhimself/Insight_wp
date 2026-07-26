# Insight by CitiPlug — headless frontend

Next.js frontend that reads content from your existing WordPress install via
its REST API, and reads homepage layout / nav menu / branding / promo cards
from your CitiPlug Supabase project. WordPress and the CitiPlug admin do all
the writing; this app only reads and renders. It is deliberately a pure
frontend now — no admin UI lives here.

## Where admin/editing actually happens

**Everything editorial and configuration-related lives in the CitiPlug
admin** (the separate React/Vite app, `citiplug-updated` repo), under its
new **Insight** section in the sidebar:

- **Write Post** — publishes directly to WordPress (via the `insight-wp`
  Supabase Edge Function, so WordPress credentials never touch the browser)
- **Sections** — arrange which WordPress category feeds each homepage
  section, reorder them, add new ones
- **Menu** — header nav categories, order, and custom labels
- **Promotions** — the "Need More Fun Stuff?" cross-promo cards
- **Branding** — text wordmark vs. uploaded logo image

This app used to have its own `/admin/editor` and `/admin/layout-manager`
routes — those are gone now. If you're looking for them, they've moved into
the CitiPlug admin's **Insight** tab instead.

## 1. WordPress-side setup (one-time)

Install and activate **Yoast SEO** if not already active — this app reads
`yoast_head_json` per post for the meta title/description/OG image your
editors fill in on wp-admin. No theme changes needed on the WP side.

Confirm your REST API is reachable:
`https://news.citiplug.com/wp-json/wp/v2/posts?_embed`
should return JSON, not a 404.

## 2. Configure this app

```
cp .env.local.example .env.local
```
Set `WP_API_URL` to your WordPress subdomain's `/wp-json` root, and
`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` to the same CitiPlug Supabase
project the admin writes to.

## 3. Run locally

```
npm install
npm run dev
```

## 4. Deploy

Push to GitHub, import into Vercel, set the two env vars above in Vercel's
project settings, deploy.

## Comments

Comments are **WordPress-native**, not a separate system — one source of
truth, moderated in wp-admin like any other WP comment. Since WordPress's
comment form requires a real email address, every commenter is also added
to the `subscribers` table (same newsletter list the footer signup feeds).

**Requires one WordPress setting**: Settings → Discussion → "Anyone can
comment" (not "Users must be registered and logged in"), or anonymous
comment submission via the REST API will be rejected.

## Sharing

Every post has a `ShareCard` (image + title + share buttons) at the end of
the article, and `ShareButtons` (Facebook/X/WhatsApp/LinkedIn/copy-link)
embedded in it. These resolve the share URL from the browser's own origin
at render time, so they work correctly regardless of which domain this
ends up deployed to.

## Load More

The homepage's "New Posts" section loads 10 posts initially and lets
readers load up to 20 total via `/api/posts` (a public, read-only
pagination endpoint — not an admin route).

## What's wired up

- ISR: pages revalidate every 5 minutes, so a new WP post or a config
  change made in the CitiPlug admin appears without a full rebuild
- Yoast metadata → Next `generateMetadata()` on every post and category page
- Dynamic `sitemap.xml` and `robots.txt` generated from live WP content
- NewsArticle structured data (JSON-LD) on post pages
- Homepage sections, nav menu, branding, and promo cards all read from
  Supabase, configured via the CitiPlug admin

## Newsletter signup

The one API route still in this app, `/api/subscribe`, is public-facing
(not admin) — it's what the footer's newsletter form calls, writing to the
existing `subscribers` table in Supabase.
