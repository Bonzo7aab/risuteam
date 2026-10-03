"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { SiteMobileBottomNav } from "@/components/navigation/site-mobile-bottom-nav";
import { oNasSubItems } from "@/lib/nav/public-site-more";
import {
  Menu,
  MenuTrigger,
  MenuPanel,
  MenuItem,
} from "@/components/animate-ui/components/base/menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getInitials(user: { name?: string; email?: string } | null): string {
  if (!user) return "?";
  if (user.name?.trim()) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
    }
    return user.name.slice(0, 2).toUpperCase();
  }
  if (user.email?.trim()) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return "?";
}

const navItems: {
  label: string;
  href?: string;
  icon?: string;
  subItems?: { label: string; href: string; icon?: string }[];
}[] = [
  { label: "Grafik", href: "/grafik", icon: "calendar_month" },
  { label: "Obozy i Nocowanki", href: "/obozy", icon: "hiking" },
  { label: "Lokalizacje", href: "/lokalizacja", icon: "location_on" },
  { label: "O nas", subItems: [...oNasSubItems] },
  { label: "FAQ", href: "/faq", icon: "help" },
  { label: "Kontakt", href: "/kontakt", icon: "call" },
];

function isPathActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const navItemClass = (active: boolean) =>
  cn(
    "inline-flex h-9 items-center justify-center rounded-xl px-3 text-[13px] font-semibold tracking-tight transition-colors duration-200",
    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    active
      ? "bg-primary/10 text-primary"
      : "text-stone-600 hover:bg-stone-100/90 hover:text-text-main dark:text-stone-300 dark:hover:bg-white/[0.07] dark:hover:text-white",
  );

const oNasPanelClass =
  "risu-card min-w-70 overflow-hidden rounded-2xl border-0 p-1.5 shadow-card ring-1 ring-black/5 dark:bg-[#2a2015] dark:shadow-card-dark dark:ring-white/10";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const isAuthenticated = useQuery(api.auth.isAuthenticated);
  const currentUser = useQuery(api.authHelpers.getCurrentUser);
  const isAdmin = currentUser?.role === "admin";

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <header className="md:sticky md:top-2 z-50 mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
      <div className="hidden md:flex items-center justify-between rounded-2xl border-0 bg-white/90 px-3 py-2 shadow-card ring-1 ring-black/4 backdrop-blur-md transition-all duration-300 dark:bg-[#2a2015]/90 dark:shadow-card-dark dark:ring-white/10 lg:px-4">
        <Link href="/" className="flex items-center gap-2 rounded-xl pr-2">
          <Image
            src="/logoWithBorder.png"
            alt="Risu Team"
            width={288}
            height={96}
            className="h-14 w-auto dark:invert"
            priority
          />
          <h1 className="text-lg font-extrabold tracking-tight text-text-main dark:text-white">
            Risu Team
          </h1>
        </Link>

        <nav className="hidden md:flex relative z-10 flex-1 items-center justify-end gap-0.5 lg:gap-1" aria-label="Główne">
          {navItems.map((item) => {
            if (item.subItems) {
              const isActive = item.subItems.some((s) => isPathActive(s.href, pathname));
              return (
                <Menu key={item.label}>
                  <MenuTrigger
                    className={cn(
                      navItemClass(isActive),
                      "group gap-1 border-0 shadow-none aria-expanded:bg-primary/10 aria-expanded:text-primary",
                    )}
                    aria-label={item.label}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className="material-symbols-outlined inline-flex size-[18px] items-center justify-center text-[18px]! leading-none transition-transform duration-200 ease-out group-aria-expanded:rotate-180"
                    >
                      expand_more
                    </span>
                  </MenuTrigger>
                  <MenuPanel
                    align="start"
                    sideOffset={10}
                    className={oNasPanelClass}
                    highlightClassName="rounded-xl bg-primary/10"
                  >
                    <p className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400 dark:text-stone-500">
                      O nas
                    </p>
                    {item.subItems.map((sub) => {
                      const isSubActive = isPathActive(sub.href, pathname);
                      return (
                        <MenuItem
                          key={sub.href}
                          onClick={() => router.push(sub.href)}
                          className={cn(
                            "cursor-pointer gap-3 rounded-xl px-2.5 py-2",
                            isSubActive && "bg-primary/10 font-semibold text-primary",
                          )}
                        >
                          {sub.icon ? (
                            <span className="risu-icon-well size-9" aria-hidden>
                              <span className="material-symbols-outlined text-[20px]">{sub.icon}</span>
                            </span>
                          ) : null}
                          <span className="text-sm font-semibold leading-tight">{sub.label}</span>
                        </MenuItem>
                      );
                    })}
                  </MenuPanel>
                </Menu>
              );
            }
            const isActive = isPathActive(item.href!, pathname);
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={navItemClass(isActive)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 pl-2 sm:gap-3">
          <AnimatedThemeToggler />
          {isAuthenticated === true && isAdmin && (
            <>
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center justify-center rounded-sm border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 px-4 py-2 text-sm font-bold text-text-main dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Admin
              </Link>
              <div className="hidden sm:block w-px self-stretch min-h-6 bg-stone-200 dark:bg-stone-600" aria-hidden />
            </>
          )}
          {isAuthenticated === true && !isAdmin && (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center justify-center rounded-sm border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 px-4 py-2 text-sm font-bold text-text-main dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Panel
              </Link>
              <div className="hidden sm:block w-px self-stretch min-h-6 bg-stone-200 dark:bg-stone-600" aria-hidden />
            </>
          )}
          <Menu>
            <MenuTrigger
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto min-h-9 py-1.5 pl-3 pr-2 rounded-sm bg-stone-50 dark:bg-stone-800/50 text-left gap-2 shrink-0"
              )}
              aria-label="Konto"
            >
              {isAuthenticated === true && currentUser ? (
                <>
                  <div className="hidden sm:block">
                    <div className="font-bold text-sm text-text-main dark:text-stone-200 leading-tight text-right">
                      {currentUser.name?.trim() || currentUser.email || "Konto"}
                    </div>
                    {isAdmin && (
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-light dark:text-stone-400 leading-tight mt-0.5">
                        Administrator
                      </div>
                    )}
                  </div>
                  <div className="flex h-8 w-8 shrink-0 rounded-full bg-primary/10 text-primary items-center justify-center text-sm font-bold">
                    {getInitials(currentUser)}
                  </div>
                </>
              ) : (
                <span className="material-symbols-outlined text-xl text-text-main dark:text-stone-400">person</span>
              )}
            </MenuTrigger>
            <MenuPanel align="end" className="min-w-40" sideOffset={4}>
              {isAuthenticated === true ? (
                <MenuItem
                  variant="destructive"
                  onClick={handleSignOut}
                  className="cursor-pointer"
                >
                  Wyloguj się
                </MenuItem>
              ) : (
                <>
                  <MenuItem
                    onClick={() => router.push("/sign-in")}
                    className="cursor-pointer"
                  >
                    Zaloguj się
                  </MenuItem>
                  <MenuItem
                    onClick={() => router.push("/sign-up")}
                    className="cursor-pointer"
                  >
                    Zarejestruj się
                  </MenuItem>
                </>
              )}
            </MenuPanel>
          </Menu>
        </div>
      </div>
      <SiteMobileBottomNav />
    </header>
  );
}
