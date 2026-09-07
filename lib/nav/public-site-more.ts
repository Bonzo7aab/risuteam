/** Subpages under „O nas” — used in desktop dropdown + mobile „Więcej” */
export const oNasSubItems = [
  { label: "Historia", href: "/historia", icon: "history_edu" },
  { label: "Kadra", href: "/trenerzy", icon: "groups" },
  { label: "Zajęcia", href: "/rodzaje_zajec", icon: "sports_martial_arts" },
  { label: "Cennik", href: "/cennik", icon: "payments" },
  { label: "Galeria", href: "/galeria", icon: "photo_library" },
] as const;

/**
 * Public site links in mobile „Więcej” (flat list, same level).
 * Excludes Grafik, Obozy, Kontakt (bottom bar). „O nas” is not a group — items listed inline.
 */
export const publicSiteMoreItems: {
  label: string;
  href: string;
  icon?: string;
}[] = [
  { label: "Strona główna", href: "/", icon: "home" },
  { label: "Lokalizacje", href: "/lokalizacja", icon: "location_on" },
  ...oNasSubItems.map((s) => ({
    label: s.label,
    href: s.href,
    icon: s.icon,
  })),
  { label: "FAQ", href: "/faq", icon: "help" },
];
