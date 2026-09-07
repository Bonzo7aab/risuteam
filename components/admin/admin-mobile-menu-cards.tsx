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
 * Mobile-only grid on admin pulpit — all sidebar destinations except Pulpit.
 */
export function AdminMobileMenuCards() {
  const pathname = usePathname();

  return (
    <nav
      className="grid grid-cols-2 gap-2.5 sm:gap-3"
      aria-label="Menu administratora"
    >
      {MOBILE_CARD_ITEMS.map((item) => {
        const active = isAdminLinkActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border px-2 py-3 shadow-sm transition-all active:scale-[0.98]",
              active
                ? "border-primary bg-primary/10 dark:bg-primary/15"
                : "border-stone-200 bg-white hover:border-primary/40 hover:shadow-md dark:border-stone-700 dark:bg-stone-900/80"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/15 dark:bg-primary/20"
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[22px]",
                  !active && "text-primary"
                )}
              >
                {item.icon}
              </span>
            </div>
            <span
              className={cn(
                "text-center text-[11px] font-bold leading-snug sm:text-xs px-0.5",
                active
                  ? "text-primary dark:text-amber-100"
                  : "text-text-main dark:text-white"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
