import Image from "next/image";
import Link from "next/link";
import { campRegistrationCtaHref } from "@/lib/camp-registration-links";

export type CampHeroProps = {
  badge: string;
  /** Optional second badge (e.g. "OSTATNIE MIEJSCA") */
  badgeSecondary?: string;
  /** Full camp name as single title (new layout) */
  title?: string;
  /** Legacy: first part of title */
  titlePart1?: string;
  /** Legacy: second part of title */
  titlePart2?: string;
  image: string;
  imageAlt: string;
  meta: { icon: string; text: string }[];
  /** Optional secondary link (e.g. "Wszystkie obozy") */
  secondaryLink?: { label: string; href: string };
  /** Back control over the hero image (frosted pill, top-left; mobile + desktop) */
  backLink?: { href: string; label: string };
  /** Rejestracja — primary CTA on the hero image (card layout / obóz slug) */
  registrationHref?: string;
  isRegistrationClosed?: boolean;
  /** Legacy: primary CTA (used when title is not provided) */
  ctaPrimary?: { label: string; href: string };
  /** Legacy: secondary CTA */
  ctaSecondary?: { label: string; href: string };
};

function HeroBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex max-w-[min(100%,calc(100vw-2rem))] items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-black/55"
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
  ctaPrimary,
  ctaSecondary,
}: CampHeroProps) {
  const useCardLayout = title != null;
  const displayTitle = title ?? ([titlePart1, titlePart2].filter(Boolean).join(" ").trim() || "Obóz");

  if (!useCardLayout) {
    return (
      <section className="relative flex min-h-[70vh] items-center justify-start">
        <div className="absolute inset-0">
          <Image src={image} alt={imageAlt} fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-black/50" aria-hidden />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <span className="mb-6 inline-block rounded bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
              {badge}
            </span>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              <span className="text-primary">{titlePart1 ?? displayTitle}</span>
              {titlePart2 ? (
                <>
                  <br />
                  <span>{titlePart2}</span>
                </>
              ) : null}
            </h1>
            <ul className="mb-8 space-y-2 text-sm text-white/90 md:text-base">
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
              {ctaPrimary ? (
                <Link
                  href={ctaPrimary.href}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {ctaPrimary.label}
                </Link>
              ) : null}
              {ctaSecondary ? (
                <Link
                  href={ctaSecondary.href}
                  className="inline-flex items-center justify-center rounded-xl border border-stone-500/50 bg-stone-700/90 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-stone-600/90"
                >
                  {ctaSecondary.label}
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
      {/* Mobile: full-width image flush top, no rounding; title + meta below */}
      <div className="md:hidden">
        <div className="relative min-h-[220px] w-full bg-stone-200 dark:bg-stone-800">
          <div className="relative aspect-[5/4] min-h-[220px] w-full">
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover object-top"
              sizes="100vw"
              priority
            />
            {backLink ? (
              <div className="absolute left-4 top-[max(env(safe-area-inset-top),0.75rem)] z-20">
                <HeroBackLink href={backLink.href} label={backLink.label} />
              </div>
            ) : null}
            {registrationHref ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/65 via-black/25 to-transparent pt-16 pb-4 px-4">
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

      {/* Desktop: rounded card, overlay on image */}
      <div className="relative hidden overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-lg dark:border-stone-700 dark:bg-stone-800/50 md:block md:rounded-3xl">
        <div className="relative aspect-[21/9] min-h-[360px]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1280px"
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
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
