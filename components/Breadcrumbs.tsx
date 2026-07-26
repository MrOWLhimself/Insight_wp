import Link from "next/link";
import { SITE_URL } from "@/lib/config";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-6 pt-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {item.href ? (
                <Link href={item.href} className="hover:text-orange">
                  {item.label}
                </Link>
              ) : (
                <span className="text-ink">{item.label}</span>
              )}
              {i < items.length - 1 && <span className="text-rule">/</span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
