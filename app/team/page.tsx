import Image from "next/image";
import { getTeamMembers, getNavMenu, getSiteSettings, type NavMenuItem } from "@/lib/supabase";
import { getCategories } from "@/lib/wordpress";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = { title: "Team" };
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

export default async function TeamPage() {
  const [team, categories, navItems, siteSettings] = await Promise.all([
    getTeamMembers(),
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
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Team" }]} />
      <main className="max-w-5xl mx-auto px-6 py-14">
        <h1 className="font-display font-extrabold text-4xl mb-10">Our Team</h1>

        {team.length === 0 ? (
          <p className="text-ink-soft">Team info coming soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
            {team.map((member) => (
              <div key={member.id}>
                <div className="relative w-full aspect-square bg-ink/5 mb-4 overflow-hidden">
                  {member.photo_url && (
                    <Image src={member.photo_url} alt={member.name} fill className="object-cover" />
                  )}
                </div>
                <h3 className="font-display font-extrabold text-lg text-ink">{member.name}</h3>
                {member.role && <p className="eyebrow mt-1">{member.role}</p>}
                {member.bio && (
                  <p className="text-ink-soft text-sm leading-relaxed mt-2">{member.bio}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
