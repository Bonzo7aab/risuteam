"use client";

import Link from "next/link";
import {
  campRegistrationCtaHref,
  eventSignupCta,
} from "@/lib/camp-registration-links";
import Image from "next/image";
import { SignupRequireChildLink } from "@/components/signup/signup-require-child-link";
import { cn } from "@/lib/utils";

export type CampDetailHeaderProps = {
  registrationHref: string;
  isRegistrationClosed: boolean;
  isEnrolled?: boolean;
};

export function CampDetailHeader({
  registrationHref,
  isRegistrationClosed,
  isEnrolled = false,
}: CampDetailHeaderProps) {
  const cta = eventSignupCta({ isRegistrationClosed, isEnrolled });

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
          <SignupRequireChildLink
            href={campRegistrationCtaHref(registrationHref, isRegistrationClosed)}
            disabled={cta.disabled}
            className={cn(
              "inline-flex h-8 items-center justify-center rounded-xl px-3 text-sm font-bold shadow-sm transition-colors",
              cta.isEnrolled
                ? "border border-primary/40 bg-transparent text-primary"
                : cta.disabled
                  ? "cursor-not-allowed bg-stone-200 text-stone-500"
                  : "bg-primary text-primary-foreground hover:bg-primary-hover"
            )}
          >
            {cta.label}
          </SignupRequireChildLink>
        </nav>
      </div>
    </header>
  );
}
