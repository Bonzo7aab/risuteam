"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@/components/icons/arrow-right";

type Tab = "letnie" | "zimowe" | "polkolonie" | "nocowanki";

type CampBadge = "OSTATNIE MIEJSCA" | "Nowość" | null;

type CampCategory = "letni" | "zimowy" | "polkolonie";

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
  // tolerate older label-like values in DB
  if (s.includes("polkolonie") || s.includes("polkolon")) return "polkolonie";
  if (s.includes("rower") || s.includes("zimow")) return "zimowy";
  if (s.includes("sport") || s.includes("letni")) return "letni";
  // fallback by well-known slugs
  if (slug === "zimowe") return "zimowy";
  if (slug === "polkolonie") return "polkolonie";
  return "letni";
}

function ObozyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("letnie");
  const subscribeByEmail = useMutation(api.newsletter.subscribeByEmail);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterPending, setNewsletterPending] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(
    null
  );
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

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
        image: c.heroImageUrl ?? "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=600",
        href: `/obozy/${encodeURIComponent(slug)}`,
        badge,
        category: normalizeCampCategory(c.category, slug),
        maxParticipants: c.maxParticipants,
        earlyBirdDiscountPercent: c.earlyBirdDiscountPercent,
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
    <div className="min-h-screen bg-stone-100 dark:bg-stone-900/30">
      <section className="px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-3">
              GOTOWA NA PRZYGODĘ?
            </p>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight text-stone-900 dark:text-white mb-4">
              Dołącz do sportowej{" "}
              <span className="text-primary">przygody!</span>
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-8">
              Sprawdź nasze nadchodzące obozy i nocowanki. Razem z Risu
              tworzymy niezapomniane wspomnienia pełne ruchu i uśmiechu!
            </p>
            <div
              className="flex justify-center gap-2 flex-wrap"
              role="tablist"
              aria-label="Wybierz typ oferty"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === "letnie"}
                aria-controls="obozy-panel"
                id="letnie-tab"
                onClick={() => setTabWithUrl("letnie")}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-colors",
                  tab === "letnie"
                    ? "bg-primary text-primary-foreground"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-lg",
                    tab === "letnie" ? "text-primary-foreground" : "text-stone-500 dark:text-stone-400"
                  )}
                >
                  wb_sunny
                </span>
                Obozy letnie
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "zimowe"}
                aria-controls="obozy-panel"
                id="zimowe-tab"
                onClick={() => setTabWithUrl("zimowe")}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-colors",
                  tab === "zimowe"
                    ? "bg-primary text-primary-foreground"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-lg",
                    tab === "zimowe" ? "text-primary-foreground" : "text-stone-500 dark:text-stone-400"
                  )}
                >
                  ac_unit
                </span>
                Obozy zimowe
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "polkolonie"}
                aria-controls="obozy-panel"
                id="polkolonie-tab"
                onClick={() => setTabWithUrl("polkolonie")}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-colors",
                  tab === "polkolonie"
                    ? "bg-primary text-primary-foreground"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-lg",
                    tab === "polkolonie" ? "text-primary-foreground" : "text-stone-500 dark:text-stone-400"
                  )}
                >
                  school
                </span>
                Półkolonie
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "nocowanki"}
                aria-controls="nocowanki-panel"
                id="nocowanki-tab"
                onClick={() => setTabWithUrl("nocowanki")}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-colors",
                  tab === "nocowanki"
                    ? "bg-primary text-primary-foreground"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-lg",
                    tab === "nocowanki" ? "text-primary-foreground" : "text-stone-500 dark:text-stone-400"
                  )}
                >
                  star
                </span>
                Nocowanki
              </button>
            </div>
          </div>

          {/* Camps — horizontal cards (letnie / zimowe / polkolonie) */}
          {(tab === "letnie" || tab === "zimowe" || tab === "polkolonie") && (
            <div
              id="obozy-panel"
              role="tabpanel"
              aria-labelledby={`${tab}-tab`}
              className="space-y-8"
            >
              {convexCamps === undefined ? (
                <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-12 text-center">
                  <p className="text-stone-600 dark:text-stone-400">Ładowanie…</p>
                </div>
              ) : filteredCamps.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-12 text-center">
                  <p className="text-stone-600 dark:text-stone-400">
                    Brak obozów w tej kategorii w tym momencie.
                  </p>
                </div>
              ) : (
              filteredCamps.map((c) => {
                const registrationClosed = registrationClosedBySlug[c.id];
                return (
                  <div
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(c.href)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(c.href);
                      }
                    }}
                    title={`Zobacz szczegóły: ${c.title}`}
                    className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row cursor-pointer"
                  >
                    <div className="relative w-full md:w-[min(45%,380px)] md:min-h-[240px] aspect-[4/3] md:aspect-auto shrink-0">
                      <Image
                        src={c.image}
                        alt={c.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 380px"
                        unoptimized={c.image.startsWith("/")}
                      />
                      {registrationClosed ? (
                        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-stone-600 dark:bg-stone-500">
                          Rejestracja zamknięta
                        </div>
                      ) : c.badge ? (
                        <div
                          className={cn(
                            "absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold text-white",
                            c.badge === "OSTATNIE MIEJSCA"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          )}
                        >
                          {c.badge}
                        </div>
                      ) : c.earlyBirdDiscountPercent != null && c.earlyBirdDiscountPercent > 0 ? (
                        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-primary">
                          Rabat -{c.earlyBirdDiscountPercent}%
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col p-6 md:p-8 flex-1 justify-between">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-white mb-2 hover:text-primary transition-colors">
                          {c.title}
                        </h3>
                        {registrationClosed && (
                          <p className="text-amber-700 dark:text-amber-400 text-sm font-medium mb-2">
                            Na ten obóz nie przyjmujemy już zapisów.
                          </p>
                        )}
                        <p className="text-stone-600 dark:text-stone-400 text-sm md:text-base mb-4">
                          {c.description}
                        </p>
                        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-600 dark:text-stone-400">
                          <li className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-primary">
                              calendar_today
                            </span>
                            {c.dates}
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-primary">
                              group
                            </span>
                            {c.age}
                          </li>
                          {c.maxParticipants != null ? (
                            <li className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base text-primary">
                                person
                              </span>
                              Do {c.maxParticipants} miejsc
                            </li>
                          ) : null}
                          <li className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-primary">
                              location_on
                            </span>
                            {c.location}
                          </li>
                        </ul>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                        <div>
                          <span className="text-sm text-stone-600 dark:text-stone-400">
                            {c.priceLabel}{" "}
                          </span>
                          <span className="text-xl font-bold text-primary">
                            {c.price}
                          </span>
                        </div>
                        {registrationClosed ? (
                          <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-200 dark:bg-stone-700 px-6 py-3 text-sm font-medium text-stone-500 dark:text-stone-400 shrink-0 cursor-not-allowed">
                            Rejestracja zakończona
                          </span>
                        ) : (
                          <Link
                            href={`${c.href}/rejestracja`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover transition-colors shrink-0"
                          >
                            Zapisz się
                            <ArrowRightIcon className="text-[1.1em]" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
              )}
            </div>
          )}

          {/* Nocowanki */}
          {tab === "nocowanki" && (
            <div
              id="nocowanki-panel"
              role="tabpanel"
              aria-labelledby="nocowanki-tab"
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                  Nadchodzące Nocowanki
                </h2>
                <div className="mt-3 h-px bg-stone-200 dark:bg-stone-700 max-w-md mx-auto" />
              </div>
              {convexNocowanki === undefined ? (
                <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-12 text-center">
                  <p className="text-stone-600 dark:text-stone-400">Ładowanie…</p>
                </div>
              ) : nocowankiCards.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-12 text-center">
                  <p className="text-stone-600 dark:text-stone-400">
                    Wkrótce pojawią się tu nocowanki — zajrzyj ponownie później.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {nocowankiCards.map((n) => (
                    <div
                      key={n.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(n.href)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(n.href);
                        }
                      }}
                      title={`Zobacz szczegóły: ${n.title}`}
                      className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row cursor-pointer"
                    >
                      <div className="relative w-full md:w-[min(45%,380px)] md:min-h-[240px] aspect-[4/3] md:aspect-auto shrink-0 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-stone-300 dark:text-stone-600">
                          nightlight
                        </span>
                      </div>
                      <div className="flex flex-col p-6 md:p-8 flex-1 justify-between">
                        <div>
                          <Link href={n.href} onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-white mb-2 hover:text-primary transition-colors">
                              {n.title}
                            </h3>
                          </Link>
                          {n.description ? (
                            <p className="text-stone-600 dark:text-stone-400 text-sm md:text-base mb-4 line-clamp-4">
                              {n.description}
                            </p>
                          ) : null}
                          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-600 dark:text-stone-400">
                            <li className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base text-primary">
                                calendar_today
                              </span>
                              {n.dates}
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base text-primary">
                                location_on
                              </span>
                              {n.location}
                            </li>
                          </ul>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                          <div>
                            <span className="text-sm text-stone-600 dark:text-stone-400">
                              {n.priceLabel}{" "}
                            </span>
                            <span className="text-xl font-bold text-primary">
                              {n.price}
                            </span>
                          </div>
                          <Link
                            href={`${n.href}#rejestracja`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover transition-colors shrink-0"
                          >
                            Szczegóły i zapisy
                            <ArrowRightIcon className="text-[1.1em]" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="mt-20 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 shadow-sm p-8 md:p-12 text-center">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
              Bądź na bieżąco
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-md mx-auto">
              Zapisz się do newslettera, aby otrzymywać informacje o nowych
              obozach i nocowankach.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              aria-label="Zapisz się do newslettera"
              onSubmit={async (e) => {
                e.preventDefault();
                setNewsletterError(null);
                setNewsletterMessage(null);
                const trimmed = newsletterEmail.trim();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                  setNewsletterError("Podaj prawidłowy adres e-mail.");
                  return;
                }
                setNewsletterPending(true);
                try {
                  await subscribeByEmail({ email: trimmed });
                  setNewsletterMessage(
                    "Dziękujemy! Zapisaliśmy Twój adres — bądź na bieżąco z obozami i nocowankami."
                  );
                  setNewsletterEmail("");
                } catch (err) {
                  setNewsletterError(
                    err instanceof Error
                      ? err.message
                      : "Nie udało się zapisać. Spróbuj ponownie."
                  );
                } finally {
                  setNewsletterPending(false);
                }
              }}
            >
              <input
                type="email"
                name="newsletter-email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Twój email"
                aria-label="Adres e-mail"
                autoComplete="email"
                disabled={newsletterPending}
                className="flex-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-stone-900 dark:text-white placeholder:text-stone-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={newsletterPending}
                className="rounded-xl h-12 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary-hover disabled:opacity-60"
              >
                {newsletterPending ? "Zapisywanie…" : "Zapisz się"}
              </button>
            </form>
            {newsletterMessage && (
              <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
                {newsletterMessage}
              </p>
            )}
            {newsletterError && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400 max-w-md mx-auto">
                {newsletterError}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ObozyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Ładowanie…
        </div>
      }
    >
      <ObozyContent />
    </Suspense>
  );
}
