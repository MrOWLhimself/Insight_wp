// components/CategoryBadge.tsx
//
// Renders a category name as a small colored box instead of plain text -
// used everywhere a category label shows up (article headers, cards,
// sidebars) so the site has real visual variety by section instead of
// looking flat/plain.

import { getCategoryColor } from '@/lib/category-colors';

export default function CategoryBadge({
  category,
  className = '',
}: {
  category: string;
  className?: string;
}) {
  const color = getCategoryColor(category);
  return (
    <span
      className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      {category}
    </span>
  );
}
