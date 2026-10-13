"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { ObozyListCard } from "@/components/obozy/obozy-list-card";

type Tab = "letnie" | "zimowe" | "polkolonie" | "nocowanki";

type CampBadge = "OSTATNIE MIEJSCA" | "Nowość" | null;

type CampCategory = "letni" | "zimowy" | "polkolonie";

const TABS: {
  id: Tab;
  label: string;
  icon: string;
  panel: "obozy" | "nocowanki";
}[] = [
  { id: "letnie", label: "Obozy letnie", icon: "wb_sunny", panel: "obozy" },
  { id: "zimowe", label: "Obozy zimowe", icon: "ac_unit", panel: "obozy" },
  { id: "polkolonie", label: "Półkolonie", icon: "school", panel: "obozy" },
  { id: "nocowanki", label: "Nocowanki", icon: "nights_stay", panel: "nocowanki" },
];

function formatCampDates(startDate: number, endDate: number): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  return `${start.toLocaleDateString("pl-PL", opts)} – ${end.toLocaleDateString("pl-PL", opts)}`;
}

const TAB_TO_CATEGORY: Record<"letnie" | "zimowe" | "polkolonie", CampCategory> = {
  letnie: "letni",
  zimowe: "zimowy",
  polkolonie: "polkolonie",
};

const TAB_EYEBROW: Record<"letnie" | "zimowe" | "polkolonie", string> = {
  letnie: "Obóz letni",
  zimowe: "Obóz zimowy",
  polkolonie: "Półkolonie",
};

function stripDiacriticsLower(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeCampCategory(raw: unknown, slug: string): CampCategory {
  const s = typeof raw === "string" ? stripDiacriticsLower(raw) : "";
  if (s === "letni" || s === "zimowy" || s === "polkolonie") return s;
  if (s.includes("polkolonie") || s.includes("polkolon")) return "polkolonie";
  if (s.includes("rower") || s.includes("zimow")) return "zimowy";
  if (s.includes("sport") || s.includes("letni")) return "letni";
  if (slug === "zimowe") return "zimowy";
  if (slug === "polkolonie") return "polkolonie";
  return "letni";
}

function ListState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white px-6 py-14 text-center shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark">
      <p className="text-sm text-stone-500 dark:text-stone-400 sm:text-base">{children}</p>
    </div>
  );
}

function ObozyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("letnie");

  const setTabWithUrl = useCallback(
    (newTab: Tab) => {
      setTab(newTab);
      router.replace(`/obozy?tab=${newTab}`, { scroll: false });
    },
    [router]
  );
  const convexCamps = useQuery(api.camps.getCamps, { activeOnly: true });
  const convexNocowanki = useQuery(api.nocowanki.listPublicActive);
  const registrationClosedBySlug = useMemo(() => {
    const map: Record<string, boolean> = {};
    if (convexCamps) {
      for (const c of convexCamps) {
        map[c.slug] = c.isRegistrationOpen === false;
      }
    }
    return map;
  }, [convexCamps]);

  const camps = useMemo(() => {
    if (convexCamps === undefined) return [];
    return convexCamps.map((c) => {
      const slug = c.slug ?? c.id ?? "";
      const registered = c.registrationCount ?? 0;
      const maxSeats = c.maxParticipants;
      const seatsLeft =
        maxSeats != null ? Math.max(0, maxSeats - registered) : null;
      const badge: CampBadge =
        seatsLeft != null && seatsLeft > 0 && seatsLeft < 10
          ? "OSTATNIE MIEJSCA"
          : null;
      return {
        id: c.id ?? c.slug,
        title: c.name,
        description: c.description ?? "",
        dates: formatCampDates(c.startDate, c.endDate),
        location: c.location?.name ?? c.location?.city ?? "—",
        age: c.ageGroup ?? "—",
        price: c.price != null ? `${c.price} PLN` : "—",
        priceLabel: "Cena od",
        image:
          c.heroImageUrl ??
          "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=600",
        href: `/obozy/${encodeURIComponent(slug)}`,
        badge,
        category: normalizeCampCategory(c.category, slug),
        maxParticipants: c.maxParticipants,
        earlyBirdDiscountPercent: c.earlyBirdDiscountPercent,
        slug,
      };
    });
  }, [convexCamps]);

  const filteredCamps = useMemo(() => {
    if (tab === "nocowanki") return [];
    const category = TAB_TO_CATEGORY[tab];
    return camps.filter((c) => c.category === category);
  }, [tab, camps]);

  const nocowankiCards = useMemo(() => {
    if (convexNocowanki === undefined) return [];
    return convexNocowanki.map((n) => {
      const slug = n.slug?.trim() ?? "";
      const priceDisplay =
        n.priceDisplay?.trim() ||
        (n.price != null ? `${n.price} PLN` : "—");
      return {
        id: n._id,
        slug,
        title: n.name,
        description: n.description ?? "",
        dates: n.datesLabel?.trim() || "—",
        location: n.locationLabel?.trim() || "—",
        priceLabel: "Pełna cena",
        price: priceDisplay,
        href: `/obozy/nocowanki/${encodeURIComponent(slug)}`,
      };
    });
  }, [convexNocowanki]);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "letnie" || t === "zimowe" || t === "polkolonie" || t === "nocowanki") {
      setTab(t);
    } else {
      setTab("letnie");
      router.replace("/obozy?tab=letnie", { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-background-dark">
      <section className="relative px-4 py-12 sm:px-6 md:py-16 lg:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40"
          aria-hidden
        >
          <div className="absolute -right-24 top-0 size-80 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -left-20 top-40 size-72 rounded-full bg-amber-200/25 blur-3xl dark:bg-amber-900/20" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <header className="mb-10 max-w-3xl md:mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Obozy i eventy
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-text-main dark:text-white md:text-5xl">
              Wybierz przygodę dla swojego dziecka
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-stone-400 sm:text-lg">
              Obozy, półkolonie i nocowanki — sprawdzone terminy, jasne ceny i
              zapisy w jednym miejscu.
            </p>
          </header>

          <div
            className="mb-8 overflow-x-auto pb-1 sm:mb-10"
            role="tablist"
            aria-label="Wybierz typ oferty"
          >
            <div className="inline-flex min-w-full gap-1 rounded-2xl border border-stone-200/80 bg-white/90 p-1.5 shadow-card backdrop-blur-sm dark:border-stone-800 dark:bg-[#2a2015]/90 dark:shadow-card-dark sm:min-w-0 sm:flex-wrap">
              {TABS.map((item) => {
                const selected = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={
                      item.panel === "obozy" ? "obozy-panel" : "nocowanki-panel"
                    }
                    id={`${item.id}-tab`}
                    onClick={() => setTabWithUrl(item.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors sm:px-4",
                      selected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-stone-600 hover:bg-stone-100 hover:text-text-main dark:text-stone-300 dark:hover:bg-stone-800/70 dark:hover:text-white"
                    )}
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined text-[18px]",
                        selected ? "text-primary-foreground" : "text-primary"
                      )}
                      aria-hidden
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {(tab === "letnie" || tab === "zimowe" || tab === "polkolonie") && (
            <div
              id="obozy-panel"
              role="tabpanel"
              aria-labelledby={`${tab}-tab`}
              className="space-y-5"
            >
              {convexCamps === undefined ? (
                <ListState>Ładowanie ofert…</ListState>
              ) : filteredCamps.length === 0 ? (
                <ListState>Brak obozów w tej kategorii w tym momencie.</ListState>
              ) : (
                filteredCamps.map((c) => {
                  const registrationClosed = registrationClosedBySlug[c.slug];
                  const statusBadge = registrationClosed
                    ? { label: "Rejestracja zamknięta", tone: "muted" as const }
                    : c.badge === "OSTATNIE MIEJSCA"
                      ? { label: "Ostatnie miejsca", tone: "danger" as const }
                      : c.earlyBirdDiscountPercent != null &&
                          c.earlyBirdDiscountPercent > 0
                        ? {
                            label: `Rabat −${c.earlyBirdDiscountPercent}%`,
                            tone: "primary" as const,
                          }
                        : c.badge === "Nowość"
                          ? { label: "Nowość", tone: "info" as const }
                          : null;

                  const meta = [
                    { icon: "calendar_month", label: c.dates },
                    { icon: "location_on", label: c.location },
                    { icon: "child_care", label: c.age },
                  ];
                  if (c.maxParticipants != null) {
                    meta.push({
                      icon: "group",
                      label: `Do ${c.maxParticipants} miejsc`,
                    });
                  }

                  return (
                    <ObozyListCard
                      key={c.id}
                      href={c.href}
                      title={c.title}
                      description={c.description}
                      eyebrow={TAB_EYEBROW[tab]}
                      image={c.image}
                      meta={meta}
                      priceLabel={c.priceLabel}
                      price={c.price}
                      statusBadge={statusBadge}
                      notice={
                        registrationClosed
                          ? "Na ten obóz nie przyjmujemy już zapisów."
                          : null
                      }
                      ctaHref={`${c.href}/rejestracja`}
                      ctaLabel={
                        registrationClosed ? "Rejestracja zakończona" : "Zapisz się"
                      }
                      ctaDisabled={Boolean(registrationClosed)}
                    />
                  );
                })
              )}
            </div>
          )}

          {tab === "nocowanki" && (
            <div
              id="nocowanki-panel"
              role="tabpanel"
              aria-labelledby="nocowanki-tab"
              className="space-y-5"
            >
              <div className="mb-1">
                <h2 className="text-lg font-bold tracking-tight text-text-main dark:text-white">
                  Nadchodzące nocowanki
                </h2>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  Krótkie wyjazdy z noclegiem — szczegóły i zapisy w kartach poniżej.
                </p>
              </div>

              {convexNocowanki === undefined ? (
                <ListState>Ładowanie ofert…</ListState>
              ) : nocowankiCards.length === 0 ? (
                <ListState>
                  Wkrótce pojawią się tu nocowanki — zajrzyj ponownie później.
                </ListState>
              ) : (
                nocowankiCards.map((n) => (
                  <ObozyListCard
                    key={n.id}
                    href={n.href}
                    title={n.title}
                    description={n.description}
                    eyebrow="Nocowanka"
                    placeholderIcon="nights_stay"
                    meta={[
                      { icon: "calendar_month", label: n.dates },
                      { icon: "location_on", label: n.location },
                    ]}
                    priceLabel={n.priceLabel}
                    price={n.price}
                    ctaHref={`${n.href}#rejestracja`}
                    ctaLabel="Szczegóły i zapisy"
                  />
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ObozyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7] text-stone-500 dark:bg-background-dark dark:text-stone-400">
          Ładowanie…
        </div>
      }
    >
      <ObozyContent />
    </Suspense>
  );
}
