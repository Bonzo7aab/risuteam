/** Parent dashboard sidebar / mobile „Panel rodzica” links — single source of truth */
export const parentDashboardNavItems = [
  {
    label: "Strona główna",
    href: "/dashboard",
    icon: "home",
    driverStepId: "nav-home",
  },
  {
    label: "Moje dzieci",
    href: "/dashboard/dzieci",
    icon: "group",
    driverStepId: "nav-dzieci",
  },
  {
    label: "Zajęcia",
    href: "/dashboard/zapisy",
    icon: "fitness_center",
    driverStepId: "nav-zajecia",
  },
  {
    label: "Płatności",
    href: "/dashboard/aktywnosci",
    icon: "credit_card",
    driverStepId: "nav-platnosci",
  },
  {
    label: "Ustawienia",
    href: "/dashboard/ustawienia",
    icon: "settings",
    driverStepId: "nav-ustawienia",
  },
] as const;
