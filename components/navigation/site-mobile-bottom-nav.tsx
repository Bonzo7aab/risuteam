"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
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
import { requestDashboardTour } from "@/components/dashboard-onboarding";

type NavLeaf = {
  label: string;
  href: string;
  icon?: string;
};

/**
 * Same five slots on every page. Role-specific links live in the menu,
 * so the bar never swaps items between public, parent, and admin routes.
 * Keep the bar height in sync with `--risu-mobile-bottom-nav-h`.
 */
const PUBLIC_BAR: NavLeaf[] = [
  { label: "Start", href: "/", icon: "home" },
  { label: "Grafik", href: "/grafik", icon: "calendar_month" },
  { label: "Obozy", href: "/obozy", icon: "hiking" },
  { label: "Kontakt", href: "/kontakt", icon: "call" },
];

const barItemBase =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1 transition-colors";

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
  // Admin home is exact-only — otherwise it stays active on every /admin/* route.
  if (href === "/admin") {
    return currentPath === "/admin";
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function isPublicBarActive(href: string, currentPath: string): boolean {
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function BarItemFace({
  icon,
  label,
  active,
}: {
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <>
      <span
        className={cn(
          "flex h-8 w-11 items-center justify-center rounded-full transition-colors",
          active
            ? "bg-primary/15 text-primary"
            : "text-stone-500 dark:text-stone-400"
        )}
      >
        <span
          className="material-symbols-outlined text-[22px] leading-none"
          style={{
            fontVariationSettings: active ? "'FILL' 1, 'wght' 520" : "'FILL' 0, 'wght' 420",
          }}
          aria-hidden
        >
          {icon}
        </span>
      </span>
      <span
        className={cn(
          "max-w-full truncate text-[10px] font-semibold leading-none tracking-tight",
          active ? "text-primary" : "text-stone-500 dark:text-stone-400"
        )}
      >
        {label}
      </span>
    </>
  );
}

type FlatNavItem = { label: string; href: string; icon?: string };

function itemMatchesPath(item: FlatNavItem, currentPath: string): boolean {
  if (item.href === "/") return currentPath === "/";
  return currentPath === item.href || currentPath.startsWith(`${item.href}/`);
}

const menuLinkBase =
  "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold transition-colors";
const menuLinkInactive =
  "text-text-main hover:bg-white dark:text-stone-200 dark:hover:bg-white/6";
const menuLinkActive = "bg-white text-primary shadow-sm dark:bg-white/8 dark:text-amber-100 dark:shadow-none";

function MenuIcon({ icon, active }: { icon: string; active: boolean }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl",
        active
          ? "bg-primary/15 text-primary"
          : "bg-white text-stone-500 shadow-sm ring-1 ring-black/4 dark:bg-white/8 dark:text-stone-300 dark:shadow-none dark:ring-white/10"
      )}
      aria-hidden
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </span>
  );
}

function MoreSection({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-6 first:mt-0">
      {title ? (
        <h3 className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 dark:text-stone-500">
          {title}
        </h3>
      ) : null}
      {subtitle ? (
        <p className="mb-2 px-2 text-xs font-medium leading-snug text-stone-500 dark:text-stone-400">
          {subtitle}
        </p>
      ) : null}
      <div className="flex flex-col gap-0.5">{children}</div>
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
            {item.icon ? <MenuIcon icon={item.icon} active={active} /> : null}
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

  /** Parent „Panel rodzica” lives in the menu — not for admins */
  const showParentPanel =
    isAuthenticated === true &&
    currentUser != null &&
    currentUser.role !== "admin";

  const isMoreActive = !PUBLIC_BAR.some((item) => isPublicBarActive(item.href, pathname));

  return (
    <div className="md:hidden">
      <nav
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]"
        aria-label="Nawigacja mobilna"
      >
        <div className="pointer-events-auto mx-auto flex h-16 w-full max-w-md items-center rounded-[1.35rem] bg-white/95 px-1 shadow-[0_12px_40px_-16px_rgba(28,22,13,0.45),0_0_0_1px_rgba(28,22,13,0.06)] backdrop-blur-xl dark:bg-[#2a2118]/96 dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.72),0_0_0_1px_rgba(255,255,255,0.08)]">
          {PUBLIC_BAR.map((item) => {
            const active = isPublicBarActive(item.href, pathname);
            return (
              <Link key={item.href} href={item.href} className={barItemBase}>
                <BarItemFace icon={item.icon ?? "radio_button_checked"} label={item.label} active={active} />
              </Link>
            );
          })}

          <Drawer open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <DrawerTrigger asChild>
              <button type="button" className={barItemBase} aria-label="Menu">
                <BarItemFace icon="menu" label="Menu" active={isMoreActive || isMoreOpen} />
              </button>
            </DrawerTrigger>
            <DrawerContent className="mx-auto mt-0 flex w-full max-w-md flex-col border-stone-200/80 bg-[#faf6ef] shadow-none dark:border-white/10 dark:bg-[#1c160f] max-h-[min(88dvh,100%)] pb-[max(env(safe-area-inset-bottom),0.75rem)]">
              <DrawerHeader className="flex shrink-0 flex-row items-center justify-between gap-3 px-5 pb-1 pt-1 text-left">
                <div>
                  <DrawerTitle className="text-xl font-black tracking-tight text-text-main dark:text-white">
                    Menu
                  </DrawerTitle>
                  <p className="mt-1 text-xs font-medium text-stone-500 dark:text-stone-400">
                    Risu Team
                  </p>
                </div>
                <AnimatedThemeToggler className="shrink-0" />
              </DrawerHeader>
              <div className="max-h-[min(72dvh,calc(100dvh-7rem))] overflow-y-auto overscroll-contain px-4 pb-3">
                <MoreSection title="Strona">
                  <MoreLinks items={publicSiteMoreItems} pathname={pathname} />
                </MoreSection>

                {showParentPanel && (
                  <MoreSection
                    title="Panel rodzica"
                    subtitle="Profil, dzieci, zapisy i płatności"
                  >
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
                          {...("driverStepId" in item &&
                            item.driverStepId && {
                              "data-onboarding": item.driverStepId,
                            })}
                        >
                          <MenuIcon icon={item.icon} active={active} />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => requestDashboardTour()}
                      className={cn(menuLinkBase, menuLinkInactive)}
                    >
                      <MenuIcon icon="menu_book" active={false} />
                      Przewodnik po panelu
                    </button>
                  </MoreSection>
                )}

                {isAdmin && (
                  <MoreSection title="Administrator">
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
                          <MenuIcon icon={item.icon} active={active} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </MoreSection>
                )}

                {isAuthenticated === true ? (
                  <MoreSection title="Konto">
                    <SignOutButton
                      variant="ghost"
                      className="inline-flex h-auto w-full items-center justify-start gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-red-600 shadow-none hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                        <span className="material-symbols-outlined text-[20px]" aria-hidden>
                          logout
                        </span>
                      </span>
                      Wyloguj się
                    </SignOutButton>
                  </MoreSection>
                ) : (
                  <MoreSection title="Konto">
                    <Link
                      href="/logowanie"
                      className={cn(menuLinkBase, menuLinkInactive)}
                    >
                      <MenuIcon icon="login" active={pathname === "/logowanie"} />
                      Zaloguj się
                    </Link>
                    <Link
                      href="/rejestracja"
                      className="mt-1 flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-[0_8px_20px_-8px_rgba(244,157,37,0.7)] transition-colors hover:bg-primary-hover"
                    >
                      Zarejestruj się
                    </Link>
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
