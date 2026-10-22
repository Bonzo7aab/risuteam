"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";

const AUTH_PATHS = ["/logowanie", "/rejestracja", "/forgot-password"];

export function SiteFooterVisibility() {
  const pathname = usePathname();

  if (AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return null;
  }

  const hideOnMobile = pathname === "/lokalizacja";

  if (hideOnMobile) {
    return (
      <div className="hidden lg:block">
        <SiteFooter />
      </div>
    );
  }

  return <SiteFooter />;
}
