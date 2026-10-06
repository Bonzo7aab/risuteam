"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavItems } from "@/lib/nav/admin-nav";

const MOBILE_CARD_ITEMS = adminNavItems.filter((item) => item.href !== "/admin");

function isAdminLinkActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Mobile-only shortcuts on the admin pulpit — sidebar destinations except Pulpit.
 */
export function AdminMobileMenuCards() {
  const pathname = usePathname();

  return (
    <nav
      className="grid grid-cols-3 gap-2"
      aria-label="Menu administratora"
    >
      {MOBILE_CARD_ITEMS.map((item) => {
        const active = isAdminLinkActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition-colors active:scale-[0.98]",
              active
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-stone-200/80 bg-white text-text-main shadow-card hover:border-primary/30 dark:border-stone-800 dark:bg-[#2a2015] dark:text-stone-100"
            )}
          >
            <span
              className={cn(
                "material-symbols-outlined text-[20px]",
                active ? "text-primary" : "text-primary/80"
              )}
              aria-hidden
            >
              {item.icon}
            </span>
            <span className="text-[11px] font-semibold leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
