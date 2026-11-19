/** Admin menu order, by collection/global slug: the groups follow their first entry. See Nav.tsx. */
export const ADMIN_ORDER = [
  "orders", // Shop
  "customers",
  "designs",
  "media",
  "store-settings", // Settings
  "shipping",
  "users",
];

type Group = { label: string; entities: { slug: string }[] };

const rank = (slug: string) => {
  const i = ADMIN_ORDER.indexOf(slug);
  return i === -1 ? ADMIN_ORDER.length : i;
};

/** Nav entity labels arrive as plain strings or { en, ... } objects. */
export function entityTitle(label: unknown, slug: string, language: string): string {
  if (label && typeof label === "object") {
    const byLang = label as Record<string, string>;
    return byLang[language] ?? Object.values(byLang)[0] ?? slug;
  }
  return typeof label === "string" && label ? label : slug;
}

export function sortGroups<G extends Group>(groups: G[]): G[] {
  return groups
    .map((g) => ({ ...g, entities: [...g.entities].sort((a, b) => rank(a.slug) - rank(b.slug)) }))
    .sort((a, b) => rank(a.entities[0]?.slug ?? "") - rank(b.entities[0]?.slug ?? ""));
}
