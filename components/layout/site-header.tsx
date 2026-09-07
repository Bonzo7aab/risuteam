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
      <div className="hidden md:flex rounded-xl bg-white/90 dark:bg-[#2a2015]/90 backdrop-blur-md shadow-soft border border-stone-100 dark:border-stone-800 px-4 py-2.5 items-center justify-between transition-all duration-300">
        <Link href="/" className="flex items-center gap-2">
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

        <nav className="hidden md:flex relative z-10 flex-1 items-center justify-end gap-6" aria-label="Główne">
          {navItems.map((item) => {
            if (item.subItems) {
              const isActive = item.subItems.some((s) => pathname === s.href);
              return (
                <Menu key={item.label}>
                  <MenuTrigger
                    className={cn(
                      "group inline-flex h-auto items-center justify-center rounded-md px-0 py-1.5 text-sm font-bold transition-colors",
                      "bg-transparent shadow-none hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive
                        ? "text-primary group-aria-expanded:text-primary"
                        : "text-text-main dark:text-stone-300 hover:text-primary group-aria-expanded:text-primary"
                    )}
                    aria-label={item.label}
                  >
                    <span className={cn("risu-underline", isActive && "underline")}>
                      {item.label}
                    </span>
                    <span className="ml-1 inline-block size-3 shrink-0 transition-transform duration-200 group-aria-expanded:rotate-180" aria-hidden>
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 4 3 3 3-3" /></svg>
                    </span>
                  </MenuTrigger>
                  <MenuPanel align="start" className="min-w-[10rem]" sideOffset={4}>
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <MenuItem
                          key={sub.href}
                          onClick={() => router.push(sub.href)}
                          className={cn(
                            "cursor-pointer",
                            isSubActive && "bg-primary/10 text-primary font-semibold"
                          )}
                        >
                          {sub.label}
                        </MenuItem>
                      );
                    })}
                  </MenuPanel>
                </Menu>
              );
            }
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  "inline-flex h-auto items-center justify-center rounded-md px-0 py-1.5 text-sm font-bold transition-colors risu-underline",
                  "text-text-main dark:text-stone-300 hover:text-primary focus:outline-none focus:text-primary",
                  isActive && "text-primary underline"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
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
            <MenuPanel align="end" className="min-w-[10rem]" sideOffset={4}>
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
