"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const sidebarPanelClasses =
  "rounded-r-2xl border border-stone-100 dark:border-stone-800 border-l-0 shadow-soft bg-white/95 dark:bg-[#2a2015]/95 backdrop-blur-md";

const navLinkBaseParent =
  "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-stone-500 dark:text-stone-400";
const navLinkInactiveParent =
  "hover:bg-stone-100/80 dark:hover:bg-stone-800/80 hover:text-text-main dark:hover:text-stone-200";
const navLinkActiveParent =
  "bg-primary/20 text-primary dark:bg-primary/25 dark:text-primary shadow-sm ring-1 ring-primary/15";

const navLinkBaseAdmin =
  "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-text-main dark:text-stone-300 hover:text-primary transition-colors";
const navLinkActiveAdmin = "text-primary bg-primary/10";

export type SidebarItem = {
  label: string;
  href: string;
  icon: string;
  driverStepId?: string;
};

export type ParentBrand = {
  href: string;
  title: string;
  subtitle: string;
};

export function AppSidebar({
  items,
  title,
  titleIcon,
  parentBrand,
  footer,
}: {
  items: SidebarItem[];
  title?: string;
  titleIcon?: string;
  /** When set, shows logo + Risu branding and parent-panel nav styling */
  parentBrand?: ParentBrand;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isParent = Boolean(parentBrand);

  const linkClassName = (href: string) => {
    const isActive =
      href === pathname ||
      (href !== "/dashboard" &&
        href !== "/admin" &&
        href !== "/grafik" &&
        pathname.startsWith(href));
    const exactPublic = href === "/grafik" && pathname === "/grafik";
    const active =
      href === "/grafik" ? exactPublic : isActive;

    if (isParent) {
      return `${navLinkBaseParent} ${active ? navLinkActiveParent : navLinkInactiveParent}`;
    }
    return `${navLinkBaseAdmin} ${active ? navLinkActiveAdmin : "hover:bg-stone-100/80 dark:hover:bg-stone-800/80"}`;
  };

  const firstItemMatchesTitle =
    !parentBrand && title && items.length > 0 && items[0].label === title;
  const navItems = firstItemMatchesTitle ? items.slice(1) : items;

  const NavContent = () => (
    <>
      {parentBrand && (
        <Link
          href={parentBrand.href}
          className="flex items-center gap-3 px-2 py-3 mb-4 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
        >
          <Image
            src="/logoWithBorder.png"
            alt=""
            width={48}
            height={48}
            className="h-11 w-11 rounded-full object-cover shrink-0 dark:invert"
          />
          <div className="min-w-0 text-left">
            <div className="font-black text-text-main dark:text-white leading-tight truncate">
              {parentBrand.title}
            </div>
            <div className="text-xs font-medium text-stone-500 dark:text-stone-400 truncate">
              {parentBrand.subtitle}
            </div>
          </div>
        </Link>
      )}
      {!parentBrand && title && (
        <div className="flex items-center gap-2 px-4 py-3 mb-2">
          {firstItemMatchesTitle ? (
            <Link
              href={items[0].href}
              className={linkClassName(items[0].href)}
              {...(items[0].driverStepId && {
                "data-onboarding": items[0].driverStepId,
              })}
            >
              {titleIcon && (
                <span className="material-symbols-outlined">{titleIcon}</span>
              )}
              {title}
            </Link>
          ) : (
            <>
              {titleIcon && (
                <span className="material-symbols-outlined text-text-main dark:text-stone-300 text-2xl">
                  {titleIcon}
                </span>
              )}
              <span className="font-bold text-text-main dark:text-white">{title}</span>
            </>
          )}
        </div>
      )}
      <nav className="flex flex-col gap-1 flex-1 min-h-0">
        {navItems.map((item, i) => (
          <Link
            key={`${item.href}-${item.label}-${i}`}
            href={item.href}
            className={linkClassName(item.href)}
            {...(item.driverStepId && {
              "data-onboarding": item.driverStepId,
            })}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${isParent ? "" : ""}`}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
      {footer && <div className="mt-auto pt-4 shrink-0">{footer}</div>}
    </>
  );

  return (
    <>
      <aside
        className={`w-64 lg:w-72 shrink-0 p-4 hidden md:flex flex-col min-h-screen ${sidebarPanelClasses}`}
      >
        <NavContent />
      </aside>
    </>
  );
}
