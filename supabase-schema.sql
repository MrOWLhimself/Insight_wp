-- Run this once in your Supabase project's SQL editor.

-- ============================================================
-- 1. Homepage sections — an ordered, editable list of content
--    blocks. Editors can add/remove/reorder grid-type sections
--    from /admin/layout-manager; hero/spotlight/latest are fixed
--    in position but still let you pick their category.
-- ============================================================
create table if not exists homepage_sections (
  id bigint generated always as identity primary key,
  section_key text unique not null,
  label text not null,
  display_type text not null check (display_type in ('hero','spotlight','grid','latest','promo')),
  category_id integer,
  category_name text,
  sort_order integer not null default 0,
  enabled boolean not null default true,
  is_removable boolean not null default true,
  updated_at timestamptz default now()
);

insert into homepage_sections (section_key, label, display_type, sort_order, is_removable) values
  ('hero', 'Hero', 'hero', 0, false),
  ('spotlight', 'Category Spotlight', 'spotlight', 1, false),
  ('trending', 'Trending Now', 'grid', 2, true),
  ('editors_picks', 'Editor''s Picks', 'grid', 3, true),
  ('promotions', 'Need More Fun Stuff?', 'promo', 4, true),
  ('latest', 'Latest Posts', 'latest', 5, false)
on conflict (section_key) do nothing;

-- ============================================================
-- 1b. Promo cards — the individual cards inside a "promo" section.
--     Manually curated: sponsored placements, cross-promotion of
--     your other 1105 Media brands, or featured external links.
--     Not tied to WordPress at all, since these often point offsite.
-- ============================================================
create table if not exists promo_cards (
  id bigint generated always as identity primary key,
  badge_label text not null,
  title text not null,
  image_url text,
  link_url text not null,
  sort_order integer not null default 0,
  enabled boolean not null default true,
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. Header nav menu — which categories show in the masthead,
--    in what order, under what label.
-- ============================================================
create table if not exists nav_menu (
  id bigint generated always as identity primary key,
  category_id integer not null,
  category_slug text not null default '',
  label text not null,
  sort_order integer not null default 0,
  visible boolean not null default true,
  updated_at timestamptz default now()
);

-- ============================================================
-- 3. Site branding — text wordmark vs. uploaded logo image.
-- ============================================================
create table if not exists site_settings (
  key text primary key,
  value text
);

insert into site_settings (key, value) values
  ('logo_type', 'text'),
  ('logo_text', 'Insight Magazine'),
  ('logo_image_url', '')
on conflict (key) do nothing;

alter table homepage_sections enable row level security;
alter table nav_menu enable row level security;
alter table site_settings enable row level security;
alter table promo_cards enable row level security;

create policy "Service role full access sections" on homepage_sections for all using (auth.role() = 'service_role');
create policy "Service role full access nav" on nav_menu for all using (auth.role() = 'service_role');
create policy "Service role full access settings" on site_settings for all using (auth.role() = 'service_role');
create policy "Service role full access promo" on promo_cards for all using (auth.role() = 'service_role');

-- ============================================================
-- 5. Newsletter subscribers — NOT created here. This project already
--    has a `subscribers` table (email, is_active, created_at) from
--    earlier work. The app's code reuses it as-is; nothing to run.
-- ============================================================

-- ============================================================
-- 6. Storage bucket for the uploaded logo image.
--    Run this too, or create the bucket manually in
--    Supabase → Storage → New bucket → name it "site-assets",
--    mark it Public.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "Public read site-assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "Service role write site-assets"
  on storage.objects for insert
  with check (bucket_id = 'site-assets' and auth.role() = 'service_role');
