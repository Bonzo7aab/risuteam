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

const NOCOWANKI_LIST = [
  {
    slug: "klubowa",
    name: "Klubowa Nocowanka",
    description: "Noc pełna gier, pizzy i przygód z Risu Team. 6–7 Marca.",
    href: "/obozy/nocowanki/klubowa",
  },
];

export function ZapisyPageContent({ steps }: { steps: Step[] }) {
  const [tab, setTab] = useState<TabId>("zajecia");
  const currentUser = useQuery(api.authHelpers.getCurrentUser);
  const camps = useQuery(
    api.camps.getCamps,
    tab === "obozy" ? { activeOnly: true } : "skip"
  );
  const showMyRegistrations = currentUser != null;

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8 p-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 w-fit">
        <button
          type="button"
          onClick={() => setTab("zajecia")}
          className={cn(
            "px-4 py-2.5 rounded-lg font-bold text-sm transition-colors",
            tab === "zajecia"
              ? "bg-white dark:bg-stone-800 text-primary shadow-sm"
              : "text-text-main dark:text-stone-400 hover:text-primary"
          )}
        >
          Zajęcia (abonament)
        </button>
        <button
          type="button"
          onClick={() => setTab("obozy")}
          className={cn(
            "px-4 py-2.5 rounded-lg font-bold text-sm transition-colors",
            tab === "obozy"
              ? "bg-white dark:bg-stone-800 text-primary shadow-sm"
              : "text-text-main dark:text-stone-400 hover:text-primary"
          )}
        >
          Obozy
        </button>
        <button
          type="button"
          onClick={() => setTab("nocowanki")}
          className={cn(
            "px-4 py-2.5 rounded-lg font-bold text-sm transition-colors",
            tab === "nocowanki"
              ? "bg-white dark:bg-stone-800 text-primary shadow-sm"
              : "text-text-main dark:text-stone-400 hover:text-primary"
          )}
        >
          Nocowanki
        </button>
      </div>

      {tab === "zajecia" && (
        <div className="space-y-4">
          <ZapisyContent steps={steps} />
        </div>
      )}

      {tab === "obozy" && (
        <div className="space-y-6">
          {showMyRegistrations ? (
            <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 shadow-soft">
              <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
                Twoje zapisy na obozy
              </h2>
              <DashboardCampRegistrations
                variant="rows"
                emptyRowsMessage="Nie masz jeszcze zapisów na obóz. Wybierz obóz poniżej."
              />
            </div>
          ) : null}

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-main dark:text-white">
              Rejestracje na obozy
            </h2>
            <p className="text-text-light dark:text-stone-400 text-sm">
              Wybierz obóz i wypełnij formularz rejestracyjny.
            </p>
            {camps === undefined ? (
              <p className="text-text-light dark:text-stone-400 py-4">Ładowanie…</p>
            ) : !camps.length ? (
              <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-8 text-center">
                <p className="text-text-light dark:text-stone-400">
                  Brak dostępnych obozów w tej chwili. Sprawdź później lub{" "}
                  <Link href="/obozy" className="text-primary font-medium risu-underline">
                    zobacz ofertę obozów
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {camps.map((camp) => (
                  <li key={camp._id}>
                    <Link
                      href={`/dashboard/zapisy/obozy/${encodeURIComponent(camp.slug)}`}
                      className="block rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 shadow-soft hover:shadow-glow hover:border-primary/50 transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">
                            {camp.name}
                          </h3>
                          {camp.description && (
                            <p className="text-sm text-text-light dark:text-stone-400 mt-1 line-clamp-2">
                              {camp.description}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-2 text-primary font-bold shrink-0">
                          Zapisz się
                          <ArrowRightIcon className="text-[1.1em]" />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "nocowanki" && (
        <div className="space-y-6">
          {showMyRegistrations ? (
            <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 shadow-soft">
              <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
                Twoje zapisy na nocowanki
              </h2>
              <DashboardNocowankaRegistrations emptyRowsMessage="Nie masz jeszcze zapisów na nocowankę. Wybierz wydarzenie poniżej." />
            </div>
          ) : null}

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-main dark:text-white">
              Rejestracje na nocowanki
            </h2>
            <p className="text-text-light dark:text-stone-400 text-sm">
              Wybierz nocowankę i zarezerwuj miejsce.
            </p>
            <ul className="space-y-3">
              {NOCOWANKI_LIST.map((n) => (
                <li key={n.slug}>
                  <Link
                    href={n.href}
                    className="block rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 shadow-soft hover:shadow-glow hover:border-primary/50 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">
                          {n.name}
                        </h3>
                        {n.description && (
                          <p className="text-sm text-text-light dark:text-stone-400 mt-1 line-clamp-2">
                            {n.description}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-2 text-primary font-bold shrink-0">
                        Szczegóły i zapisy
                        <ArrowRightIcon className="text-[1.1em]" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
