"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ZapisyContent } from "./zapisy-content";
import { DashboardCampRegistrations } from "@/components/dashboard-camp-registrations";
import { DashboardNocowankaRegistrations } from "@/components/dashboard-nocowanka-registrations";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@/components/icons/arrow-right";

type Step = {
  step: number;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: string;
};

type TabId = "zajecia" | "obozy" | "nocowanki";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "zajecia", label: "Zajęcia", icon: "fitness_center" },
  { id: "obozy", label: "Obozy", icon: "camping" },
  { id: "nocowanki", label: "Nocowanki", icon: "nights_stay" },
];

function formatCampDates(startDate: number, endDate: number): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${start.toLocaleDateString("pl-PL", opts)} – ${end.toLocaleDateString("pl-PL", opts)}`;
}

function OfferRow({
  href,
  title,
  description,
  meta,
  cta,
}: {
  href: string;
  title: string;
  description?: string;
  meta?: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-card transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover motion-reduce:hover:translate-y-0 dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark dark:hover:shadow-card-dark-hover sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="min-w-0">
        <h3 className="font-bold tracking-tight text-text-main transition-colors group-hover:text-primary dark:text-white">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm text-stone-500 dark:text-stone-400">
            {description}
          </p>
        ) : null}
        {meta ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
            <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden>
              calendar_month
            </span>
            {meta}
          </p>
        ) : null}
      </div>
      <span className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition-colors group-hover:bg-primary-hover">
        {cta}
        <ArrowRightIcon className="text-[1em] transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-black tracking-tight text-text-main dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function OfferListSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <ul className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="h-[5.5rem] animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800/80"
        />
      ))}
    </ul>
  );
}

export function ZapisyPageContent({ steps }: { steps: Step[] }) {
  const [tab, setTab] = useState<TabId>("zajecia");
  const currentUser = useQuery(api.authHelpers.getCurrentUser);
  // Always subscribe so tab switches don't remount queries / flash loading.
  const camps = useQuery(api.camps.getCamps, { activeOnly: true });
  const nocowanki = useQuery(api.nocowanki.listPublicActive, {});
  const authLoading = currentUser === undefined;
  const showMyRegistrations = currentUser != null;

  return (
    <>
      <div
        className="mb-8 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Rodzaj zapisu"
      >
        <div className="inline-flex min-w-full gap-1 rounded-2xl border border-stone-200/80 bg-white/90 p-1.5 shadow-card dark:border-stone-800 dark:bg-[#2a2015]/90 dark:shadow-card-dark sm:min-w-0">
          {TABS.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`zapisy-panel-${item.id}`}
                id={`zapisy-tab-${item.id}`}
                onClick={() => setTab(item.id)}
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

      {/* Keep panels mounted to avoid query/UI remount flicker on tab change */}
      <div
        id="zapisy-panel-zajecia"
        role="tabpanel"
        aria-labelledby="zapisy-tab-zajecia"
        hidden={tab !== "zajecia"}
        className={cn(tab !== "zajecia" && "hidden")}
      >
        <ZapisyContent steps={steps} />
      </div>

      <div
        id="zapisy-panel-obozy"
        role="tabpanel"
        aria-labelledby="zapisy-tab-obozy"
        hidden={tab !== "obozy"}
        className={cn("space-y-5", tab !== "obozy" && "hidden")}
      >
        {authLoading ? (
          <SectionCard
            title="Twoje zapisy na obozy"
            description="Status rejestracji i nadchodzące wyjazdy."
          >
            <OfferListSkeleton rows={1} />
          </SectionCard>
        ) : showMyRegistrations ? (
          <SectionCard
            title="Twoje zapisy na obozy"
            description="Status rejestracji i nadchodzące wyjazdy."
          >
            <DashboardCampRegistrations
              variant="rows"
              emptyRowsMessage="Nie masz jeszcze zapisów na obóz. Wybierz ofertę poniżej."
            />
          </SectionCard>
        ) : null}

        <SectionCard
          title="Dostępne obozy"
          description="Wybierz obóz i wypełnij formularz rejestracyjny."
        >
          {camps === undefined ? (
            <OfferListSkeleton />
          ) : !camps.length ? (
            <p className="py-6 text-center text-sm text-stone-500 dark:text-stone-400">
              Brak dostępnych obozów.{" "}
              <Link href="/obozy" className="font-semibold text-primary hover:text-primary-hover">
                Zobacz ofertę
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {camps.map((camp) => (
                <li key={camp._id}>
                  <OfferRow
                    href={`/dashboard/zapisy/obozy/${encodeURIComponent(camp.slug)}`}
                    title={camp.name}
                    description={camp.description}
                    meta={formatCampDates(camp.startDate, camp.endDate)}
                    cta="Zapisz się"
                  />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div
        id="zapisy-panel-nocowanki"
        role="tabpanel"
        aria-labelledby="zapisy-tab-nocowanki"
        hidden={tab !== "nocowanki"}
        className={cn("space-y-5", tab !== "nocowanki" && "hidden")}
      >
        {authLoading ? (
          <SectionCard
            title="Twoje zapisy na nocowanki"
            description="Rezerwacje i statusy nadchodzących nocowanek."
          >
            <OfferListSkeleton rows={1} />
          </SectionCard>
        ) : showMyRegistrations ? (
          <SectionCard
            title="Twoje zapisy na nocowanki"
            description="Rezerwacje i statusy nadchodzących nocowanek."
          >
            <DashboardNocowankaRegistrations emptyRowsMessage="Nie masz jeszcze zapisów na nocowankę. Wybierz wydarzenie poniżej." />
          </SectionCard>
        ) : null}

        <SectionCard
          title="Dostępne nocowanki"
          description="Wybierz wydarzenie i zarezerwuj miejsce."
        >
          {nocowanki === undefined ? (
            <OfferListSkeleton />
          ) : nocowanki.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-500 dark:text-stone-400">
              Wkrótce pojawią się tu nocowanki.{" "}
              <Link
                href="/obozy?tab=nocowanki"
                className="font-semibold text-primary hover:text-primary-hover"
              >
                Zobacz ofertę
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {nocowanki.map((n) => {
                const slug = n.slug?.trim() ?? "";
                return (
                  <li key={n._id}>
                    <OfferRow
                      href={`/obozy/nocowanki/${encodeURIComponent(slug)}`}
                      title={n.name}
                      description={n.description}
                      meta={n.datesLabel?.trim() || undefined}
                      cta="Szczegóły"
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}
