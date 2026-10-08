"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowRightIcon } from "@/components/icons/arrow-right";

type FeaturedOffer = {
  kind: "camp" | "nocowanka";
  title: string;
  dates: string;
  place: string;
  price: string;
  summary?: string;
  ageGroup?: string;
  image?: string;
  href: string;
  startDate?: number;
  endDate?: number;
};

type CountdownBadge = {
  label: string;
  urgent: boolean;
};

function startOfToday(): number {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function formatCampDates(startDate: number, endDate: number): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayMonth: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const startLabel = start.toLocaleDateString("pl-PL", dayMonth);
  const endLabel = end.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

function formatPrice(price: number | undefined, priceDisplay?: string): string {
  const display = priceDisplay?.trim();
  if (display) return display;
  if (price == null) return "";
  return `${price.toLocaleString("pl-PL")} PLN`;
}

function daysUntil(startDate: number, today: number): number {
  return Math.round((startDate - today) / 86_400_000);
}

function countdownBadge(
  offer: FeaturedOffer,
  today: number
): CountdownBadge {
  if (offer.startDate != null) {
    const days = daysUntil(offer.startDate, today);
    if (days > 1) {
      return { label: `Za ${days} dni`, urgent: days <= 14 };
    }
    if (days === 1) {
      return { label: "Za 1 dzień", urgent: true };
    }
    if (days === 0) {
      return { label: "Start dzisiaj", urgent: true };
    }
    if (offer.endDate != null && offer.endDate >= today) {
      return { label: "Trwa", urgent: true };
    }
    return { label: "Zakończony", urgent: false };
  }

  if (offer.dates && offer.dates !== "Termin wkrótce") {
    return { label: offer.dates, urgent: false };
  }

  return { label: "Termin wkrótce", urgent: false };
}

function badgeTone(urgent: boolean): string {
  if (urgent) {
    return "bg-primary text-primary-foreground shadow-xs";
  }
  return "bg-primary/15 text-primary ring-1 ring-inset ring-primary/25 dark:bg-primary/20 dark:text-amber-100";
}

export function HomeFeaturedOffer() {
  const camps = useQuery(api.camps.getCamps, { activeOnly: true });
  const nocowanki = useQuery(api.nocowanki.listPublicActive);
  const today = useMemo(() => startOfToday(), []);

  if (camps === undefined || nocowanki === undefined) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 pb-4 pt-2 sm:px-6 lg:px-8 lg:pb-6">
        <div className="h-44 animate-pulse rounded-2xl bg-stone-200/70 dark:bg-stone-800 sm:h-52" />
      </section>
    );
  }

  const upcomingCamps = [...camps]
    .filter((camp) => camp.endDate >= today)
    .sort((a, b) => a.startDate - b.startDate);

  let offer: FeaturedOffer | null = null;

  const nextCamp = upcomingCamps[0];
  if (nextCamp) {
    offer = {
      kind: "camp",
      title: nextCamp.name,
      dates: formatCampDates(nextCamp.startDate, nextCamp.endDate),
      place: nextCamp.location?.name ?? nextCamp.location?.city ?? "Miejsce wkrótce",
      price: formatPrice(nextCamp.price),
      summary: nextCamp.description?.trim() || undefined,
      ageGroup: nextCamp.ageGroup?.trim() || undefined,
      image: nextCamp.heroImageUrl,
      href: `/obozy/${encodeURIComponent(nextCamp.slug)}`,
      startDate: nextCamp.startDate,
      endDate: nextCamp.endDate,
    };
  } else if (nocowanki[0]) {
    const sleepover = nocowanki[0];
    offer = {
      kind: "nocowanka",
      title: sleepover.name,
      dates: sleepover.datesLabel?.trim() || "Termin wkrótce",
      place: sleepover.locationLabel?.trim() || "Miejsce wkrótce",
      price: formatPrice(sleepover.price, sleepover.priceDisplay),
      summary: sleepover.description?.trim() || undefined,
      image: sleepover.imageUrls?.[0],
      href: `/obozy/nocowanki/${encodeURIComponent(sleepover.slug)}`,
    };
  } else if (camps[0]) {
    const latest = [...camps].sort((a, b) => b.startDate - a.startDate)[0]!;
    offer = {
      kind: "camp",
      title: latest.name,
      dates: formatCampDates(latest.startDate, latest.endDate),
      place: latest.location?.name ?? latest.location?.city ?? "Miejsce wkrótce",
      price: formatPrice(latest.price),
      summary: latest.description?.trim() || undefined,
      ageGroup: latest.ageGroup?.trim() || undefined,
      image: latest.heroImageUrl,
      href: `/obozy/${encodeURIComponent(latest.slug)}`,
      startDate: latest.startDate,
      endDate: latest.endDate,
    };
  }

  if (!offer) return null;

  const kindLabel = offer.kind === "nocowanka" ? "Nocowanka" : "Obóz";
  const badge = countdownBadge(offer, today);
  const meta = [offer.dates, offer.place, offer.ageGroup].filter(Boolean);

  return (
    <section
      aria-label="Nadchodząca oferta"
      className="mx-auto w-full max-w-7xl px-4 pb-6 pt-2 sm:px-6 lg:px-8 lg:pb-8"
    >
      <Link
        href={offer.href}
        className="group relative grid overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:hover:translate-y-0 dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark dark:hover:shadow-card-dark-hover lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
      >
        <span
          className={`absolute right-3 top-3 z-10 inline-flex max-w-[min(100%-1.5rem,16rem)] items-center gap-1.5 truncate rounded-full px-3 py-1.5 text-xs font-bold tracking-wide ${badgeTone(badge.urgent)}`}
        >
          <span className="material-symbols-outlined shrink-0 text-[16px]" aria-hidden>
            schedule
          </span>
          {badge.label}
        </span>

        <div className="relative aspect-16/10 min-h-44 bg-stone-100 dark:bg-stone-800 lg:aspect-auto lg:min-h-56">
          {offer.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={offer.image}
              alt=""
              className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 via-stone-100 to-stone-200 dark:from-primary/25 dark:via-stone-800 dark:to-stone-900">
              <span className="material-symbols-outlined text-5xl text-primary" aria-hidden>
                {offer.kind === "nocowanka" ? "nights_stay" : "camping"}
              </span>
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent lg:bg-linear-to-r lg:from-transparent lg:via-transparent lg:to-black/10"
            aria-hidden
          />
        </div>

        <div className="flex flex-col justify-center gap-4 px-5 py-6 pr-28 sm:px-7 sm:py-8 lg:px-8 lg:pr-32">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            {kindLabel}
          </p>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-main dark:text-white sm:text-3xl">
              {offer.title}
            </h2>
            {offer.summary ? (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base">
                {offer.summary}
              </p>
            ) : null}
          </div>

          <ul className="grid gap-2 text-sm text-stone-500 dark:text-stone-400">
            {meta.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span
                  className="material-symbols-outlined mt-0.5 text-[18px] text-primary/80"
                  aria-hidden
                >
                  {item === offer.dates
                    ? "calendar_month"
                    : item === offer.place
                      ? "location_on"
                      : "child_care"}
                </span>
                <span>{item}</span>
              </li>
            ))}
            {offer.price ? (
              <li className="flex items-start gap-2 pt-1">
                <span className="material-symbols-outlined mt-0.5 text-[18px] text-primary/80" aria-hidden>
                  payments
                </span>
                <span className="font-bold text-text-main dark:text-white">{offer.price}</span>
              </li>
            ) : null}
          </ul>

          <span className="inline-flex items-center gap-1.5 pt-1 text-sm font-bold text-primary">
            Zobacz szczegóły
            <ArrowRightIcon className="text-[1em] transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </section>
  );
}
