"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { publicSiteMoreItems } from "@/lib/nav/public-site-more";
import { parentDashboardNavItems } from "@/lib/nav/parent-dashboard-nav";
import { adminNavItems } from "@/lib/nav/admin-nav";

type NavLeaf = {
  label: string;
  href: string;
  icon?: string;
};

/** Keep in sync with `--risu-mobile-bottom-nav-h` in `app/globals.css` (footer safe area). */
const barItemBase =
  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1.5 text-[10px] sm:text-[11px] font-bold transition-colors min-w-0";
const barItemInactive =
  "text-stone-500 dark:text-stone-400 hover:text-text-main dark:hover:text-stone-200";
const barItemActive = "text-primary";

function isDashboardNavActive(href: string, currentPath: string): boolean {
  const isActive =
    href === currentPath ||
    (href !== "/dashboard" &&
      href !== "/admin" &&
      href !== "/grafik" &&
      currentPath.startsWith(href));
  const exactPublic = href === "/grafik" && currentPath === "/grafik";
  return href === "/grafik" ? exactPublic : isActive;
}

function isAdminNavActive(href: string, currentPath: string): boolean {
  if (href === "/admin") {
    return currentPath === "/admin" || currentPath.startsWith("/admin/");
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function isPublicBarActive(href: string, currentPath: string): boolean {
  if (href === "/obozy") {
    return currentPath === "/obozy" || currentPath.startsWith("/obozy/");
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

type FlatNavItem = { label: string; href: string; icon?: string };

function itemMatchesPath(item: FlatNavItem, currentPath: string): boolean {
  if (item.href === "/") return currentPath === "/";
  return currentPath === item.href || currentPath.startsWith(`${item.href}/`);
}

const menuLinkBase =
  "flex w-full items-center gap-3 py-3.5 text-sm font-semibold transition-colors rounded-none";
const menuLinkInactive =
  "text-text-main hover:opacity-80 dark:text-stone-200";
const menuLinkActive = "text-primary";

/** Subtle rule only under section heading (not between links). */
const sectionTitleRule =
  "border-b border-stone-300/40 pb-2 mb-2 dark:border-stone-600/45";

function MoreSection({
  title,
  subtitle,
  variant = "site",
  children,
}: {
  title?: string;
  subtitle?: string;
  variant?: "site" | "panel" | "admin" | "account";
  children: ReactNode;
}) {
  if (variant === "panel") {
    return (
      <section className="mt-5 first:mt-0">
        <div className="-mx-4 bg-primary/[0.09] px-4 py-4 dark:bg-primary/[0.14]">
          <h3
            className={cn(
              "text-base font-black tracking-tight text-primary dark:text-amber-100",
              "border-b border-stone-400/35 pb-2 mb-2 dark:border-stone-500/40"
            )}
          >
            {title}
          </h3>
          {subtitle ? (
            <p className="mb-3 text-xs font-medium leading-snug text-stone-600 dark:text-stone-400">
              {subtitle}
            </p>
          ) : null}
          {children}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "mt-5 first:mt-0",
        variant === "admin" && "pt-1"
      )}
    >
      {title ? (
        <div className={sectionTitleRule}>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
            {title}
          </h3>
        </div>
      ) : null}
      {subtitle ? (
        <p className="mb-2 text-xs font-medium text-stone-600 dark:text-stone-400">
          {subtitle}
        </p>
      ) : null}
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function MoreLinks({ items, pathname }: { items: FlatNavItem[]; pathname: string }) {
  return (
    <>
      {items.map((item) => {
        const active = itemMatchesPath(item, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(menuLinkBase, active ? menuLinkActive : menuLinkInactive)}
          >
            {item.icon ? (
              <span className="material-symbols-outlined text-[20px] shrink-0" aria-hidden>
                {item.icon}
              </span>
            ) : null}
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function SiteMobileBottomNav() {
  const pathname = usePathname();
  const isAuthenticated = useQuery(api.auth.isAuthenticated);
  const currentUser = useQuery(api.authHelpers.getCurrentUser);
  const isAdmin = currentUser?.role === "admin";

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  /** Parent „Panel rodzica” + /dashboard tab — not for admins */
  const showParentPanel =
    isAuthenticated === true &&
    currentUser != null &&
    currentUser.role !== "admin";

  const fourthBarSlot = useMemo((): NavLeaf | null => {
    if (isAuthenticated !== true || currentUser == null) return null;
    if (currentUser.role === "admin") {
      return {
        label: "Admin",
        href: "/admin",
        icon: "admin_panel_settings",
      };
    }
    return { label: "Panel", href: "/dashboard", icon: "dashboard" };
  }, [isAuthenticated, currentUser]);

  const primaryBar: NavLeaf[] = useMemo(() => {
    const base: NavLeaf[] = [
      { label: "Grafik", href: "/grafik", icon: "calendar_month" },
      { label: "Obozy", href: "/obozy", icon: "hiking" },
      { label: "Kontakt", href: "/kontakt", icon: "call" },
    ];
    if (fourthBarSlot) base.push(fourthBarSlot);
    return base;
  }, [fourthBarSlot]);

  const moreHasActivePublic = useMemo(
    () => publicSiteMoreItems.some((item) => itemMatchesPath(item, pathname)),
    [pathname]
  );

  const moreHasActiveAdmin = useMemo(() => {
    if (!isAdmin) return false;
    return adminNavItems.some((item) => isAdminNavActive(item.href, pathname));
  }, [isAdmin, pathname]);

  /**
   * Admin routes are covered by the „Admin” tab — do not highlight „Więcej” for /admin/*.
   * Dashboard routes are covered by the „Panel” tab for parents.
   */
  const isMoreActive =
    moreHasActivePublic ||
    (moreHasActiveAdmin && !pathname.startsWith("/admin")) ||
    pathname === "/sign-in" ||
    pathname === "/sign-up";

  return (
    <div className="md:hidden">
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200/80 bg-white/95 px-1.5 pb-[max(0.65rem,calc(env(safe-area-inset-bottom,0px)+0.45rem))] pt-1.5 backdrop-blur dark:border-stone-700/80 dark:bg-[#2a2015]/95"
        aria-label="Nawigacja mobilna"
      >
        <div className="mx-auto flex w-full min-w-0 max-w-3xl items-stretch gap-1 px-0.5">
          {primaryBar.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname.startsWith("/dashboard/")
                : item.href === "/admin"
                  ? pathname === "/admin" || pathname.startsWith("/admin/")
                  : isPublicBarActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(barItemBase, active ? barItemActive : barItemInactive)}
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]" aria-hidden>
                  {item.icon ?? "radio_button_checked"}
                </span>
                <span className="truncate max-w-full text-center leading-tight">{item.label}</span>
              </Link>
            );
          })}

          <Drawer open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <DrawerTrigger asChild>
              <button
                type="button"
                className={cn(barItemBase, isMoreActive ? barItemActive : barItemInactive)}
                aria-label="Więcej"
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]" aria-hidden>
                  more_horiz
                </span>
                <span className="truncate">Więcej</span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="mx-auto mt-0 flex w-full max-w-3xl flex-col rounded-none border-0 bg-stone-100 shadow-none dark:bg-[#1c1610] max-h-[min(92dvh,100%)] pb-[max(env(safe-area-inset-bottom),0.75rem)]">
              <DrawerHeader className="flex shrink-0 flex-row items-center justify-between gap-3 px-4 pb-3 pt-2 text-left">
                <DrawerTitle className="text-xl font-black tracking-tight text-text-main dark:text-white">
                  Menu
                </DrawerTitle>
                <AnimatedThemeToggler className="shrink-0" />
              </DrawerHeader>
              <div className="max-h-[min(72dvh,calc(100dvh-7rem))] overflow-y-auto overscroll-contain px-4 pb-3">
                <MoreSection title="Strona" variant="site">
                  <MoreLinks items={publicSiteMoreItems} pathname={pathname} />
                </MoreSection>

                {showParentPanel && (
                  <MoreSection
                    title="Panel rodzica"
                    subtitle="Profil, dzieci, zapisy i płatności"
                    variant="panel"
                  >
                    <div className="flex flex-col">
                      {parentDashboardNavItems.map((item) => {
                        const active = isDashboardNavActive(item.href, pathname);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              menuLinkBase,
                              active ? menuLinkActive : menuLinkInactive
                            )}
                          >
                            <span className="material-symbols-outlined text-[20px] shrink-0" aria-hidden>
                              {item.icon}
                            </span>
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                    <SignOutButton className="mt-1 w-full justify-center rounded-none border-0 bg-transparent py-3.5 text-sm font-semibold text-text-main shadow-none hover:bg-black/[0.04] dark:text-stone-200 dark:hover:bg-white/[0.06]" />
                  </MoreSection>
                )}

                {isAdmin && (
                  <MoreSection title="Administrator" variant="admin">
                    <div className="flex flex-col">
                      {adminNavItems.map((item) => {
                        const active = isAdminNavActive(item.href, pathname);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              menuLinkBase,
                              active ? menuLinkActive : menuLinkInactive
                            )}
                          >
                            <span className="material-symbols-outlined text-[20px] shrink-0" aria-hidden>
                              {item.icon}
                            </span>
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                    <SignOutButton className="mt-1 w-full justify-center rounded-none border-0 bg-transparent py-3.5 text-sm font-semibold text-text-main shadow-none hover:bg-black/[0.04] dark:text-stone-200 dark:hover:bg-white/[0.06]" />
                  </MoreSection>
                )}

                {!isAuthenticated && (
                  <MoreSection title="Konto" variant="account">
                    <div className="flex flex-col">
                      <Link
                        href="/sign-in"
                        className={cn(menuLinkBase, "justify-center", menuLinkInactive)}
                      >
                        Zaloguj się
                      </Link>
                      <Link
                        href="/sign-up"
                        className={cn(
                          menuLinkBase,
                          "justify-center bg-primary font-bold text-primary-foreground hover:opacity-95"
                        )}
                      >
                        Zarejestruj się
                      </Link>
                    </div>
                  </MoreSection>
                )}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </nav>
    </div>
  );
}
