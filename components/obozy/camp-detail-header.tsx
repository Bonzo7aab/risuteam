"use client";

import Link from "next/link";
import { campRegistrationCtaHref } from "@/lib/camp-registration-links";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export type CampDetailHeaderProps = {
  registrationHref: string;
  isRegistrationClosed: boolean;
};

export function CampDetailHeader({
  registrationHref,
  isRegistrationClosed,
}: CampDetailHeaderProps) {
  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <header className="sticky top-2 z-40 mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
      <div className="rounded-xl bg-white/90 dark:bg-[#2a2015]/90 backdrop-blur-md shadow-soft border border-stone-100 dark:border-stone-800 px-4 py-2.5 flex items-center justify-between transition-all duration-300">
        <Link href="/obozy" className="flex items-center gap-2">
          <Image
            src="/logoWithBorder.png"
            alt="Risu Team"
            width={288}
            height={96}
            className="h-12 w-auto dark:invert"
            priority
          />
          <span className="text-base font-extrabold tracking-tight text-text-main dark:text-white">
            Risu Team
          </span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <a
            href="#program"
            className="text-sm font-bold text-text-main dark:text-stone-300 hover:text-primary transition-colors"
          >
            Program
          </a>
          <a
            href="#kadra"
            className="text-sm font-bold text-text-main dark:text-stone-300 hover:text-primary transition-colors"
          >
            Kadra
          </a>
          <a
            href="#cennik"
            className="text-sm font-bold text-text-main dark:text-stone-300 hover:text-primary transition-colors"
          >
            Cennik
          </a>
          <button
            type="button"
            className="p-1.5 rounded-lg text-text-main dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Ulubione"
          >
            <span className="material-symbols-outlined text-xl">favorite_border</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-lg text-text-main dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Udostępnij"
          >
            <span className="material-symbols-outlined text-xl">share</span>
          </button>
          <Button asChild size="sm" className="rounded-xl font-bold">
            <Link
              href={campRegistrationCtaHref(registrationHref, isRegistrationClosed)}
              aria-disabled={isRegistrationClosed}
              className={isRegistrationClosed ? "pointer-events-none opacity-70" : ""}
            >
              Zapisz się
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
