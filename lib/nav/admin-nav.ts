/** Admin sidebar / mobile „Administrator” links */
export const adminNavItems = [
  { label: "Pulpit", href: "/admin", icon: "dashboard" },
  { label: "Użytkownicy", href: "/admin/uzytkownicy", icon: "group" },
  { label: "Rejestracje", href: "/admin/rejestracje", icon: "how_to_reg" },
  { label: "Wydarzenia", href: "/admin/wydarzenia", icon: "event" },
  { label: "Płatności", href: "/admin/platnosci", icon: "payments" },
  { label: "Grafik", href: "/admin/grafik", icon: "schedule" },
  { label: "Trenerzy", href: "/admin/trenerzy", icon: "person" },
  { label: "Galeria", href: "/admin/galeria", icon: "photo_library" },
  { label: "Lokalizacje", href: "/admin/lokalizacje", icon: "location_on" },
  { label: "Newsletter", href: "/admin/newsletter", icon: "mail" },
  { label: "Reset hasła", href: "/admin/reset-password", icon: "lock_reset" },
] as const;
