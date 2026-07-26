import Link from "next/link";
import Image from "next/image";
import { formatIssueDate } from "@/lib/wordpress";
import type { NavMenuItem, SiteSettings } from "@/lib/supabase";

export default function Masthead({
  navItems,
  siteSettings,
}: {
  navItems: NavMenuItem[];
  siteSettings: SiteSettings;
}) {
  return (
    <header className="bg-paper">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 text-center">
        <Link href="/" className="inline-block">
          {siteSettings.logo_type === "image" && siteSettings.logo_image_url ? (
            <Image
              src={siteSettings.logo_image_url}
              alt="Site logo"
              width={64}
              height={64}
              className="mx-auto h-14 w-auto object-contain"
            />
          ) : (
            <h1 className="font-script text-7xl md:text-8xl text-ink leading-none">
              {siteSettings.logo_text || "Insight Magazine"}
            </h1>
          )}
        </Link>
        <p className="eyebrow mt-2">by CitiPlug</p>
      </div>

      <div className="rule border-b">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between text-[11px]">
          <span className="font-mono uppercase tracking-eyebrow text-ink-soft">
            Vol. 01 — No. 07
          </span>
          <span className="font-mono uppercase tracking-eyebrow text-ink-soft hidden sm:inline">
            {formatIssueDate()}
          </span>
        </div>
      </div>

      <nav className="border-b border-rule bg-paper">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-8 overflow-x-auto py-4">
          {navItems
            .filter((item) => item.visible)
            .map((item) => (
              <Link
                key={item.id ?? item.category_id ?? item.custom_url}
                href={item.link_type === "custom" ? item.custom_url || "/" : `/${item.category_slug}`}
                className="font-display font-extrabold text-[15px] whitespace-nowrap text-ink hover:text-orange transition-colors"
              >
                {item.label}
              </Link>
            ))}
          <Link
            href="/search"
            aria-label="Search"
            className="ml-auto flex-shrink-0 text-ink hover:text-orange"
          >
            ⌕
          </Link>
        </div>
      </nav>
    </header>
  );
}
