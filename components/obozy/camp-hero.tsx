"use client";

import Image from "next/image";
import Link from "next/link";
import { campRegistrationCtaHref } from "@/lib/camp-registration-links";
import { Button } from "@/components/ui/button";

export type CampHeroProps = {
  badge: string;
  /** Optional second badge (e.g. "OSTATNIE MIEJSCA") */
  badgeSecondary?: string;
  /** Full camp name as single title */
  title?: string;
  /** Split title: first part (accent) */
  titlePart1?: string;
  /** Split title: second part */
  titlePart2?: string;
  image: string;
  imageAlt: string;
  meta: { icon: string; text: string; label?: string }[];
  /** Optional secondary link (e.g. "Wszystkie obozy") */
  secondaryLink?: { label: string; href: string };
  /** Back control over the hero image (frosted pill, top-left) */
  backLink?: { href: string; label: string };
  /** Rejestracja — primary CTA */
  registrationHref?: string;
  isRegistrationClosed?: boolean;
  /** Optional price shown in the split info panel */
  price?: string;
  /** Explicit layout; defaults to fullBleed when no `title`, or when layout="fullBleed" */
  layout?: "fullBleed" | "card" | "split";
  /** Primary CTA (full-bleed; used when registrationHref is not set) */
  ctaPrimary?: { label: string; href: string };
  /** Secondary CTA */
  ctaSecondary?: { label: string; href: string };
};

function HeroBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex max-w-[min(100%,calc(100vw-2rem))] items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/15 backdrop-blur-xs transition-colors hover:bg-black/55"
    >
      <span className="material-symbols-outlined shrink-0 text-xl leading-none" aria-hidden>
        arrow_back
      </span>
      <span className="min-w-0 truncate sm:max-w-none sm:whitespace-normal sm:overflow-visible">
        {label}
      </span>
    </Link>
  );
}

function SplitBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex max-w-full items-center gap-1.5 text-sm font-semibold text-stone-600 transition-colors hover:text-primary dark:text-stone-400 dark:hover:text-primary"
    >
      <span className="material-symbols-outlined shrink-0 text-lg leading-none" aria-hidden>
        arrow_back
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </Link>
  );
}

function BadgeRow({
  badge,
  badgeSecondary,
}: {
  badge: string;
  badgeSecondary?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      <span className="inline-block rounded-lg bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
        {badge}
      </span>
      {badgeSecondary ? (
        <span className="inline-block rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
          {badgeSecondary}
        </span>
      ) : null}
    </div>
  );
}

export function CampHero({
  badge,
  badgeSecondary,
  title,
  titlePart1,
  titlePart2,
  image,
  imageAlt,
  meta,
  secondaryLink,
  backLink,
  registrationHref,
  isRegistrationClosed = false,
  price,
  layout,
  ctaPrimary,
  ctaSecondary,
}: CampHeroProps) {
  const useCardLayout = layout === "card" || (layout == null && title != null);
  const displayTitle =
    title ?? ([titlePart1, titlePart2].filter(Boolean).join(" ").trim() || "Obóz");

  if (layout === "split") {
    const registerHref = registrationHref
      ? campRegistrationCtaHref(registrationHref, isRegistrationClosed)
      : null;

    return (
      <section className="px-4 pb-8 pt-4 sm:px-6 md:pb-12 md:pt-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {backLink ? <SplitBackLink href={backLink.href} label={backLink.label} /> : null}

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-stone-700 dark:bg-stone-900/80 lg:rounded-3xl">
            <div className="grid lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
              <div className="relative aspect-[3/4] w-full bg-[#ece7df] dark:bg-[#1c1610] lg:aspect-auto lg:min-h-[26rem]">
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 352px"
                  priority
                  unoptimized={image.startsWith("data:")}
                />
              </div>

              <div className="flex flex-col justify-center px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
                <BadgeRow badge={badge} badgeSecondary={badgeSecondary} />
                <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl lg:text-[2.15rem] lg:leading-tight">
                  {displayTitle}
                </h1>

                <dl className="mt-5 divide-y divide-stone-200/80 border-y border-stone-200/80 dark:divide-stone-700/80 dark:border-stone-700/80">
                  {meta.map((item) => (
                    <div key={item.text} className="flex items-start gap-3 py-3">
                      <span
                        className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                        aria-hidden
                      >
                        <span className="material-symbols-outlined text-[20px] leading-none">
                          {item.icon}
                        </span>
                      </span>
                      <div className="min-w-0">
                        {item.label ? (
                          <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
                            {item.label}
                          </dt>
                        ) : null}
                        <dd className="text-sm font-semibold leading-snug text-stone-800 dark:text-stone-100 sm:text-[15px]">
                          {item.text}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>

                {price ? (
                  <p className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
                      Cena
                    </span>
                    <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">
                      {price}
                    </span>
                  </p>
                ) : null}

                {registerHref || secondaryLink ? (
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    {registerHref ? (
                      <Button
                        asChild
                        className="h-11 min-w-[11.5rem] rounded-xl px-6 text-sm font-bold"
                        disabled={isRegistrationClosed}
                      >
                        <Link
                          href={registerHref}
                          onClick={(e) => {
                            if (isRegistrationClosed) e.preventDefault();
                          }}
                          aria-disabled={isRegistrationClosed}
                          className={
                            isRegistrationClosed
                              ? "pointer-events-none cursor-not-allowed opacity-70"
                              : ""
                          }
                        >
                          {isRegistrationClosed ? "Rejestracja zakończona" : "Zapisz się"}
                        </Link>
                      </Button>
                    ) : null}
                    {secondaryLink ? (
                      <Link
                        href={secondaryLink.href}
                        className="text-sm font-medium text-primary risu-underline dark:text-amber-200"
                      >
                        {secondaryLink.label}
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!useCardLayout) {
    const primaryCta =
      registrationHref != null
        ? {
            label: isRegistrationClosed ? "Rejestracja zakończona" : "Zapisz się teraz",
            href: campRegistrationCtaHref(registrationHref, isRegistrationClosed),
            disabled: isRegistrationClosed,
          }
        : ctaPrimary
          ? { ...ctaPrimary, disabled: false }
          : null;

    return (
      <section className="relative flex min-h-[70vh] items-center justify-start">
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            unoptimized={image.startsWith("data:")}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-black/30" aria-hidden />
        </div>
        {backLink ? (
          <div className="absolute left-4 top-[max(env(safe-area-inset-top),1rem)] z-20 sm:left-6 lg:left-8">
            <HeroBackLink href={backLink.href} label={backLink.label} />
          </div>
        ) : null}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <BadgeRow badge={badge} badgeSecondary={badgeSecondary} />
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {titlePart1 || titlePart2 ? (
                <>
                  <span className="text-primary">{titlePart1 ?? displayTitle}</span>
                  {titlePart2 ? (
                    <>
                      <br />
                      <span>{titlePart2}</span>
                    </>
                  ) : null}
                </>
              ) : (
                <span>{displayTitle}</span>
              )}
            </h1>
            <ul className="mb-8 space-y-2.5 text-sm text-white/90 md:text-base">
              {meta.map((item) => (
                <li key={item.text} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-primary" aria-hidden>
                    {item.icon}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              {primaryCta ? (
                <Link
                  href={primaryCta.href}
                  onClick={(e) => {
                    if (primaryCta.disabled) e.preventDefault();
                  }}
                  className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition-colors ${
                    primaryCta.disabled
                      ? "cursor-not-allowed bg-white/25 text-white/80"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                  aria-disabled={primaryCta.disabled}
                >
                  {primaryCta.label}
                </Link>
              ) : null}
              {ctaSecondary ? (
                <Link
                  href={ctaSecondary.href}
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-xs transition-colors hover:bg-white/20"
                >
                  {ctaSecondary.label}
                </Link>
              ) : null}
              {secondaryLink ? (
                <Link
                  href={secondaryLink.href}
                  className="inline-flex items-center justify-center px-2 py-3 text-sm font-medium text-white/90 risu-underline hover:text-white"
                >
                  {secondaryLink.label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="md:mx-auto md:max-w-7xl md:px-4 md:pb-12 md:pt-4 lg:px-8">
      <div className="md:hidden">
        <div className="relative min-h-[220px] w-full bg-stone-200 dark:bg-stone-800">
          <div className="relative aspect-5/4 min-h-[220px] w-full">
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover object-top"
              sizes="100vw"
              priority
              unoptimized={image.startsWith("data:")}
            />
            {backLink ? (
              <div className="absolute left-4 top-[max(env(safe-area-inset-top),0.75rem)] z-20">
                <HeroBackLink href={backLink.href} label={backLink.label} />
              </div>
            ) : null}
            {registrationHref ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/65 via-black/25 to-transparent pt-16 pb-4 px-4">
                <div className="pointer-events-auto mx-auto w-full max-w-md">
                  <Link
                    href={campRegistrationCtaHref(registrationHref, isRegistrationClosed)}
                    onClick={(e) => {
                      if (isRegistrationClosed) e.preventDefault();
                    }}
                    className={`flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold shadow-lg transition-colors ${
                      isRegistrationClosed
                        ? "cursor-not-allowed bg-white/25 text-white/80"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                    aria-disabled={isRegistrationClosed}
                  >
                    {isRegistrationClosed ? "Rejestracja zakończona" : "Zapisz się"}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="border-b border-stone-200 bg-white px-4 py-5 dark:border-stone-700 dark:bg-stone-900/95">
          <BadgeRow badge={badge} badgeSecondary={badgeSecondary} />
          <h1 className="mb-4 text-2xl font-bold leading-tight text-stone-900 dark:text-white sm:text-3xl">
            {displayTitle}
          </h1>
          <ul className="flex flex-col gap-2 text-sm text-stone-600 dark:text-stone-300 sm:text-base">
            {meta.map((item) => (
              <li key={item.text} className="flex items-center gap-2">
                <span className="material-symbols-outlined shrink-0 text-lg text-primary" aria-hidden>
                  {item.icon}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
          {secondaryLink ? (
            <a
              href={secondaryLink.href}
              className="mt-4 inline-block text-sm font-medium text-primary risu-underline dark:text-amber-200"
            >
              {secondaryLink.label}
            </a>
          ) : null}
        </div>
      </div>

      <div className="relative hidden overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-lg dark:border-stone-700 dark:bg-stone-800/50 md:block md:rounded-3xl">
        <div className="relative aspect-21/9 min-h-[360px]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1280px"
            priority
            unoptimized={image.startsWith("data:")}
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent"
            aria-hidden
          />
          {backLink ? (
            <div className="absolute left-6 top-[max(env(safe-area-inset-top),1rem)] z-20 lg:left-8 lg:top-8">
              <HeroBackLink href={backLink.href} label={backLink.label} />
            </div>
          ) : null}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8 lg:p-10">
          <BadgeRow badge={badge} badgeSecondary={badgeSecondary} />
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
            {displayTitle}
          </h1>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/90 md:text-base">
            {meta.map((item) => (
              <li key={item.text} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-primary" aria-hidden>
                  {item.icon}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
          {registrationHref || secondaryLink ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {registrationHref ? (
                <Link
                  href={campRegistrationCtaHref(registrationHref, isRegistrationClosed)}
                  onClick={(e) => {
                    if (isRegistrationClosed) e.preventDefault();
                  }}
                  className={`inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-bold shadow-md transition-colors sm:w-auto ${
                    isRegistrationClosed
                      ? "cursor-not-allowed bg-white/20 text-white/75"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                  aria-disabled={isRegistrationClosed}
                >
                  {isRegistrationClosed ? "Rejestracja zakończona" : "Zapisz się"}
                </Link>
              ) : null}
              {secondaryLink ? (
                <a
                  href={secondaryLink.href}
                  className="inline-block text-sm font-medium text-white/90 hover:text-white risu-underline sm:ml-1"
                >
                  {secondaryLink.label}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
