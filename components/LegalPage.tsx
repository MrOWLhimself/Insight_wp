import { getCategories } from "@/lib/wordpress";
import { getNavMenu, getSiteSettings, type NavMenuItem } from "@/lib/supabase";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";

function navFallback(categories: { id: number; name: string; slug: string }[]): NavMenuItem[] {
  return categories.map((c, i) => ({
    category_id: c.id,
    category_slug: c.slug,
    link_type: "category" as const,
    custom_url: null,
    label: c.name,
    sort_order: i,
    visible: true,
  }));
}

export default async function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  const [categories, navItems, siteSettings] = await Promise.all([
    getCategories(),
    getNavMenu(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Masthead
        navItems={navItems.length > 0 ? navItems : navFallback(categories)}
        siteSettings={siteSettings}
      />
      <main className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="font-display font-extrabold text-4xl mb-2">{title}</h1>
        <p className="eyebrow border-b border-rule pb-8 mb-10 block">
          Last updated {updated}
        </p>
        <div className="article-body">{children}</div>
      </main>
      <Footer />
    </>
  );
}
