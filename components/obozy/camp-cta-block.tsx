"use client";

import Link from "next/link";
import {
  campRegistrationCtaHref,
  eventSignupCta,
} from "@/lib/camp-registration-links";
import { SignupRequireChildLink } from "@/components/signup/signup-require-child-link";
import { cn } from "@/lib/utils";

export type CampCtaBlockProps = {
  headline?: string;
  description?: string;
  signUpHref: string;
  signUpLabel?: string;
  questionHref?: string;
  questionLabel?: string;
  isRegistrationClosed?: boolean;
  isEnrolled?: boolean;
};

export function CampCtaBlock({
  headline = "Gotowi na przygodę życia?",
  description = "Zarezerwuj miejsce już dziś i dołącz do wesołej ekipy Risu Camp. Liczba miejsc ograniczona!",
  signUpHref,
  signUpLabel,
  questionHref = "/kontakt",
  questionLabel = "Zadaj pytanie",
  isRegistrationClosed = false,
  isEnrolled = false,
}: CampCtaBlockProps) {
  const cta = eventSignupCta({
    isRegistrationClosed,
    isEnrolled,
    openLabel: signUpLabel ?? "Zapisz się teraz",
  });

  return (
    <section className="py-10 md:py-20">
      <div className="mx-auto max-w-5xl md:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-primary px-4 py-12 text-primary-foreground md:rounded-3xl md:px-14 md:py-16">
          <div className="absolute right-4 top-4 opacity-15 md:right-8 md:top-6" aria-hidden>
            <span className="material-symbols-outlined text-6xl md:text-8xl">
              terrain
            </span>
          </div>
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
              {headline}
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-primary-foreground/90 md:text-base">
              {description}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <SignupRequireChildLink
                href={campRegistrationCtaHref(signUpHref, isRegistrationClosed)}
                disabled={cta.disabled}
                className={cn(
                  "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition-colors",
                  cta.isEnrolled
                    ? "cursor-default border-2 border-white/70 bg-transparent text-white"
                    : cta.disabled
                      ? "cursor-not-allowed bg-white/20"
                      : "bg-white text-primary hover:bg-white/90"
                )}
              >
                {cta.label}
              </SignupRequireChildLink>
              <Link
                href={questionHref}
                className="inline-flex items-center justify-center rounded-xl border-2 border-white px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                {questionLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
