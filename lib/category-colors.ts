// lib/category-colors.ts
//
// A consistent color per category, used to render category labels as
// colored badges instead of plain text. Loosely matches the color scheme
// already used in the CitiPlug admin (getCatColor in the admin's utils.js)
// where categories overlap, extended to cover Insight's own categories.

const CATEGORY_COLORS: Record<string, string> = {
  news: '#1f2937',
  entertainment: '#9333ea',
  business: '#b45309',
  culture: '#ea580c',
  sports: '#dc2626',
  technology: '#0369a1',
  health: '#22c55e',
  travel: '#0891b2',
  education: '#a855f7',
  fashion: '#f97316',
  campus: '#7c3aed',
  ijebu: '#059669',
  'ogun state': '#059669',
  nigeria: '#16a34a',
  africa: '#ca8a04',
  world: '#0284c7',
  'bbnaija season 11': '#db2777',
  newsroom: '#4b5563',
  worship: '#78716c',
  property: '#0d9488',
  lifestyles: '#ec4899',
  opinion: '#7c3aed',
  spotlight: '#eab308',
  editorial: '#475569',
  features: '#0891b2',
  stories: '#f59e0b',
  articles: '#64748b',
  feature: '#0891b2',
  events: '#f97316',
  'red carpet': '#be185d',
  'outdoor event': '#16a34a',
  concert: '#7c3aed',
  hangout: '#0ea5e9',
  heritage: '#92400e',
};

export function getCategoryColor(name: string | undefined | null): string {
  if (!name) return '#6b7280';
  const key = name.toLowerCase().trim();
  return CATEGORY_COLORS[key] || '#6b7280';
}
