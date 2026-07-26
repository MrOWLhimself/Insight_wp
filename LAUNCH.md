# Going Live — final, simplified plan

Your actual situation:
- WordPress lives at `news.citiplug.com` and **stays there permanently** — no
  migration needed. This app only ever reads from it via the REST API,
  which needs zero changes on WordPress's end.
- The frontend lives at `magazine.citiplug.com` on Vercel (project
  `insight-wp`).
- Admin/editing happens entirely in the CitiPlug admin (Hostinger), under
  its "Insight Magazine" sidebar tab.
- Supabase (`CitiPlug` project) holds homepage layout, nav menu, branding,
  promo cards, and subscribers — already set up.

This is much simpler than the earlier plan, since WordPress never needs to
change its own site URL — that was only necessary if the frontend was
going to take over `news.citiplug.com` itself, which it isn't.

## 1. DNS — done or in progress

`magazine.citiplug.com` → CNAME → the target Vercel gave you, in
Hostinger's DNS panel. If you hit "record conflicts," check for and
remove any existing record (ALIAS, A, CNAME) already using that name
first — one name can only have one record.

## 2. Environment variables (Vercel → `insight-wp` → Settings → Environment Variables)

```
WP_API_URL=https://news.citiplug.com/wp-json
SUPABASE_URL=https://uysipsegizbixwgvwdzl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-real-service-role-key
NEXT_PUBLIC_SITE_URL=https://magazine.citiplug.com
```

## 3. Supabase Edge Function secrets (for the CitiPlug admin's "Write Post")

```bash
supabase secrets set WP_APP_USER=your-wp-username
supabase secrets set WP_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
supabase secrets set WP_API_URL=https://news.citiplug.com/wp-json
```
(Or via Supabase dashboard: Edge Functions → `insight-wp` → Secrets.)

## 4. WordPress — one setting, for comments to work

Settings → Discussion → **"Anyone can comment"** (not "must be
registered"), or the comment form on post pages will get rejected.

## 5. Final checks

- [ ] `magazine.citiplug.com` loads the homepage with real content
- [ ] `magazine.citiplug.com/sitemap.xml` and `/robots.txt` load
- [ ] A real post's link preview looks right in Facebook's/Twitter's
      debuggers (tests the branded OG images)
- [ ] Newsletter signup in the footer adds a row to `subscribers` in
      Supabase
- [ ] `/terms`, `/privacy`, `/copyright` all render
- [ ] CitiPlug admin's "Insight Magazine" tab loads all 5 sub-tabs, and
      "Write Post" successfully publishes a test draft to WordPress
- [ ] `news.citiplug.com/wp-admin` still works for editing content
      directly, unchanged

## What's still a placeholder after all this

- **Ad slots** (`components/AdSlot.tsx`) are visual placeholders. Your
  Supabase project already has a real `ad_slots` table from earlier
  CitiPlug work — wiring these up is a real next step, not done yet.
- **Newsletter sending** — collects emails into `subscribers`, but this
  codebase doesn't send campaigns. The CitiPlug admin's own Newsletter
  page already has real sending infrastructure — worth using that instead
  of building a second system.
