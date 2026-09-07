"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  NocowankaHero,
  FeatureCards,
  DailyProgram,
  WhatToBringPricing,
} from "@/components/obozy";
import {
  NOCOWANKI_STATIC,
  NOCOWANKA_CONTACT,
  type NocowankaStaticContent,
} from "../nocowanki-static";

type ViewModel = {
  badge: string;
  titlePart1: string;
  titlePart2: string;
  description: string;
  meta: { icon: string; text: string }[];
  ctaHref: string;
  stats: { value: string; label: string }[];
  attractions: { icon: string; title: string; description: string }[];
  whatToBring: string[];
  price: string;
  priceIncluded: string[];
  availabilityPercent?: number;
  schedule: { time: string; title: string; description: string }[];
  imageUrls: string[];
};

function firstWord(name: string): string {
  const t = name.trim();
  if (!t) return "";
  return t.split(/\s+/)[0] ?? t;
}

function restWords(name: string): string {
  const t = name.trim();
  const parts = t.split(/\s+/);
  if (parts.length <= 1) return "";
  return parts.slice(1).join(" ");
}

function mergeDocWithStatic(
  slug: string,
  doc: Doc<"nocowanki">,
  s: NocowankaStaticContent | undefined
): ViewModel {
  const dates =
    doc.datesLabel?.trim() || s?.dates || "";
  const location =
    doc.locationLabel?.trim() || s?.location || "";
  const meta: { icon: string; text: string }[] = [];
  if (dates) {
    meta.push({ icon: "calendar_today", text: `Daty: ${dates}` });
  }
  if (location) {
    meta.push({ icon: "location_on", text: `Gdzie: ${location}` });
  }

  const stats =
    doc.stats && doc.stats.length > 0
      ? doc.stats
      : s?.stats ?? [];

  const attractions =
    doc.attractions && doc.attractions.length > 0
      ? doc.attractions
      : s?.attractions ?? [];

  const whatToBring =
    doc.whatToBring && doc.whatToBring.length > 0
      ? doc.whatToBring
      : s?.whatToBring ?? [];

  const priceIncluded =
    doc.priceIncluded && doc.priceIncluded.length > 0
      ? doc.priceIncluded
      : s?.priceIncluded ?? [];

  const price =
    doc.priceDisplay?.trim() ||
    (doc.price != null ? `${doc.price} PLN` : "") ||
    s?.price ||
    "—";

  const schedule =
    doc.schedule && doc.schedule.length > 0
      ? doc.schedule.map((x) => ({
          time: x.time,
          title: x.title,
          description: x.description || "",
        }))
      : (s?.schedule ?? []).map((x) => ({
          time: x.time,
          title: x.title,
          description: x.description || "",
        }));

  const availabilityPercent =
    doc.availabilityPercent != null
      ? doc.availabilityPercent
      : s?.availabilityPercent;

  const ctaHref = `/obozy/nocowanki/${encodeURIComponent(slug)}#rejestracja`;
  const imageUrls = doc.imageUrls?.filter(Boolean).slice(0, 2) ?? [];

  return {
    badge: doc.badge?.trim() || s?.badge || "NOCOWANKA",
    titlePart1:
      doc.titlePart1?.trim() ||
      s?.titlePart1 ||
      firstWord(doc.name) ||
      doc.name,
    titlePart2:
      doc.titlePart2?.trim() || s?.titlePart2 || restWords(doc.name),
    description: doc.description?.trim() || s?.description || "",
    meta,
    ctaHref,
    stats,
    attractions,
    whatToBring,
    price,
    priceIncluded,
    availabilityPercent,
    schedule,
    imageUrls,
  };
}

function staticOnlyView(slug: string, s: NocowankaStaticContent): ViewModel {
  const ctaHref = `/obozy/nocowanki/${encodeURIComponent(slug)}#rejestracja`;
  return {
    badge: s.badge,
    titlePart1: s.titlePart1,
    titlePart2: s.titlePart2,
    description: s.description,
    meta: [
      { icon: "calendar_today", text: `Daty: ${s.dates}` },
      { icon: "location_on", text: `Gdzie: ${s.location}` },
    ],
    ctaHref,
    stats: s.stats,
    attractions: s.attractions,
    whatToBring: s.whatToBring,
    price: s.price,
    priceIncluded: s.priceIncluded,
    availabilityPercent: s.availabilityPercent,
    schedule: s.schedule.map((x) => ({
      time: x.time,
      title: x.title,
      description: x.description || "",
    })),
    imageUrls: [],
  };
}

function staticEntryForSlug(slug: string): NocowankaStaticContent | undefined {
  const direct = NOCOWANKI_STATIC[slug];
  if (direct) return direct;
  return NOCOWANKI_STATIC[slug.toLowerCase()];
}

export function NocowankaPublicView({ slug }: { slug: string }) {
  const safeSlug = slug.trim();
  const doc = useQuery(api.nocowanki.getBySlug, { slug: safeSlug });
  const registrationsCount = useQuery(
    api.registrations.countNocowankaRegistrationsPublic,
    safeSlug ? { slug: safeSlug } : "skip"
  );
  const staticFallback = staticEntryForSlug(safeSlug);

  if (doc === undefined) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-stone-50 dark:bg-stone-900/30">
        <p className="text-stone-600 dark:text-stone-400">Ładowanie…</p>
      </div>
    );
  }

  if (doc === null && !staticFallback) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 bg-stone-50 dark:bg-stone-900/30 px-4">
        <h1 className="text-xl font-bold text-stone-900 dark:text-white">
          Nie znaleziono nocowanki
        </h1>
        <p className="text-center text-stone-600 dark:text-stone-400 max-w-md">
          Sprawdź adres lub wróć do listy nocowanek.
        </p>
        <Link
          href="/obozy?tab=nocowanki"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          Wszystkie nocowanki
        </Link>
      </div>
    );
  }

  const data: ViewModel =
    doc !== null
      ? mergeDocWithStatic(safeSlug, doc, staticFallback)
      : staticOnlyView(safeSlug, staticFallback!);

  const occupiedSeats = registrationsCount ?? 0;
  const maxSeats = doc?.maxParticipants;
  const hasSeatCapacity = maxSeats != null && maxSeats > 0;
  const availableSeats = hasSeatCapacity
    ? Math.max(0, maxSeats - occupiedSeats)
    : undefined;
  const availabilityPercent =
    hasSeatCapacity && availableSeats !== undefined
      ? Math.round((availableSeats / maxSeats) * 100)
      : data.availabilityPercent;
  const availabilityLabel = hasSeatCapacity
    ? `Dostępność miejsc: ${availableSeats} wolnych / ${occupiedSeats} zajętych`
    : "Dostępność miejsc";

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900/30">
      <NocowankaHero
        badge={data.badge}
        titlePart1={data.titlePart1}
        titlePart2={data.titlePart2}
        description={data.description}
        image={data.imageUrls[0]}
        images={data.imageUrls}
        imageAlt={`${data.titlePart1} ${data.titlePart2}`}
        meta={
          data.meta.length > 0
            ? data.meta
            : [
                {
                  icon: "event",
                  text: "Szczegóły w opisie",
                },
              ]
        }
        ctaPrimary={{ label: "Zapisz się", href: data.ctaHref }}
      />

      {data.stats.length > 0 ? (
        <section className="py-10 md:py-12 bg-stone-100 dark:bg-stone-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {data.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.attractions.length > 0 ? (
        <FeatureCards
          title="Główne atrakcje"
          subtitle="Co czeka na uczestników podczas nocowanki."
          cards={data.attractions}
          cardsGridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8"
        />
      ) : null}

      <WhatToBringPricing
        whatToBringTitle="Co zabrać ze sobą?"
        whatToBringItems={data.whatToBring}
        priceTitle="Cena wyjazdu"
        price={data.price}
        priceIncluded={data.priceIncluded}
        bookButtonLabel="Zapisz się teraz"
        bookButtonHref={data.ctaHref}
        showBookButton={false}
        showDropdowns={false}
        availabilityLabel={availabilityLabel}
        availabilityPercent={availabilityPercent}
      />

      {data.schedule.length > 0 ? (
        <DailyProgram
          title="Harmonogram nocy"
          items={data.schedule.map((s) => ({
            time: s.time,
            title: s.title,
            description: s.description || "",
          }))}
        />
      ) : null}

      <section id="rejestracja" className="py-16 md:py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Gotowi na przygodę?</h2>
          <p className="text-white/90 mb-10">
            Skontaktuj się z nami, aby zarezerwować miejsce lub zadać pytania.
          </p>
          <Link
            href={data.ctaHref}
            className="mb-8 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary hover:bg-white/90 transition-colors"
          >
            Zapisz się
          </Link>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <a
              href={`tel:${NOCOWANKA_CONTACT.phone.replace(/\s/g, "")}`}
              className="flex flex-col items-center gap-3 rounded-2xl bg-white dark:bg-stone-100 p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow text-stone-900"
            >
              <span className="material-symbols-outlined text-4xl text-primary">
                call
              </span>
              <span className="font-bold">Zadzwoń do nas</span>
              <span className="text-lg font-semibold text-primary">
                {NOCOWANKA_CONTACT.phone}
              </span>
            </a>
            <a
              href={`mailto:${NOCOWANKA_CONTACT.email}`}
              className="flex flex-col items-center gap-3 rounded-2xl bg-white dark:bg-stone-100 p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow text-stone-900"
            >
              <span className="material-symbols-outlined text-4xl text-primary">
                mail
              </span>
              <span className="font-bold">Napisz do nas</span>
              <span className="text-sm font-medium text-primary break-all">
                {NOCOWANKA_CONTACT.email}
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
