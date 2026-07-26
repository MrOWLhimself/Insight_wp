import { getAboutContent, getNavMenu, getSiteSettings, type NavMenuItem } from "@/lib/supabase";
import { getCategories } from "@/lib/wordpress";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = { title: "About Us" };
export const revalidate = 300;

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

export default async function AboutPage() {
  const [about, categories, navItems, siteSettings] = await Promise.all([
    getAboutContent(),
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
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <main className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="font-display font-extrabold text-4xl mb-8">{about.title}</h1>
        <p className="text-lg leading-relaxed text-ink-soft whitespace-pre-line">{about.body}</p>
      </main>
      <Footer />
    </>
  );
}
