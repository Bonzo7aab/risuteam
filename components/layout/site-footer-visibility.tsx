"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";

export function SiteFooterVisibility() {
  const pathname = usePathname();
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
