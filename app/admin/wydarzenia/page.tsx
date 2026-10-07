"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getNocowankaDisplayName } from "@/lib/nocowanki";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatCampDates(startDate: number, endDate: number): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return `${start.toLocaleDateString("pl-PL", opts)} – ${end.toLocaleDateString("pl-PL", opts)}`;
}

function categoryLabel(category: string | undefined): string {
  if (category === "letni") return "Letni";
  if (category === "zimowy") return "Zimowy";
  if (category === "polkolonie") return "Półkolonie";
  return "Obóz";
}

const tabTriggerClass = cn(
  "rounded-lg px-3.5 py-2 text-sm font-semibold shadow-none",
  "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  "data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground",
  "dark:data-[state=active]:!bg-primary dark:data-[state=active]:!text-primary-foreground",
);

function Occupancy({ current, max }: { current: number; max?: number | null }) {
  const cap = max != null && max > 0 ? max : null;
  const pct = cap ? Math.min(100, Math.round((current / cap) * 100)) : 0;
  return (
    <div className="hidden w-32 shrink-0 sm:block">
      <p className="text-right text-xs font-semibold tabular-nums text-stone-700 dark:text-stone-300">
        {current}
        {cap != null ? ` / ${cap}` : ""}
      </p>
      {cap != null ? (
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : (
        <p className="mt-0.5 text-right text-[11px] text-stone-500 dark:text-stone-400">
          {current === 1 ? "zapis" : "zapisów"}
        </p>
      )}
    </div>
  );
}

function StatusPill({
  open,
  openLabel,
  closedLabel,
}: {
  open: boolean;
  openLabel: string;
  closedLabel: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        open
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
          : "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400",
      )}
    >
      {open ? openLabel : closedLabel}
    </span>
  );
}

const rowClass =
  "flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-stone-50 sm:gap-4 sm:px-5 dark:hover:bg-stone-800/50";

const iconBtnClass =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white";

export default function AdminWydarzeniaPage() {
  const [tab, setTab] = useState("obozy");
  const camps = useQuery(api.camps.getCamps, { activeOnly: false });
  const nocowanki = useQuery(api.nocowanki.listForAdmin);
  const registrationSlugs = useQuery(api.registrations.listNocowankaSlugsForAdmin);
  const campCounts = useQuery(api.registrations.getCampRegistrationCountsForAdmin);
  const nocowankaCounts = useQuery(api.registrations.getNocowankaRegistrationCountsForAdmin);

  const campsLoading = camps === undefined || campCounts === undefined;
  const nocowankiLoading =
    nocowanki === undefined || registrationSlugs === undefined || nocowankaCounts === undefined;

  const nocowankaSlugsFromDb = new Set(nocowanki?.map((n) => n.slug) ?? []);
  const nocowankaInDb = new Map((nocowanki ?? []).map((n) => [n.slug, n] as const));
  const extraSlugs = registrationSlugs?.filter((s) => !nocowankaSlugsFromDb.has(s)) ?? [];
  const nocowankaListFromDb = (nocowanki ?? []).map((n) => ({ slug: n.slug, name: n.name }));
  const nocowankaListWithFallback = [
    ...nocowankaListFromDb,
    ...extraSlugs.map((slug) => ({ slug, name: getNocowankaDisplayName(slug) })),
  ];

  const campTabCountSuffix = camps !== undefined ? ` (${camps.length})` : "";
  const nocowankaTabCountReady = nocowanki !== undefined && registrationSlugs !== undefined;
  const nocowankaTabCountSuffix = nocowankaTabCountReady
    ? ` (${nocowankaListWithFallback.length})`
    : "";

  return (
    <div className="w-full min-w-0 max-w-5xl space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-text-main dark:text-white md:text-3xl">
          Wydarzenia
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500 dark:text-stone-400">
          Twórz i edytuj obozy oraz nocowanki — treści, terminy i ustawienia zapisów.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-auto w-full justify-start gap-2 bg-transparent p-0 sm:w-auto">
            <TabsTrigger value="obozy" className={tabTriggerClass}>
              Obozy{campTabCountSuffix}
            </TabsTrigger>
            <TabsTrigger value="nocowanki" className={tabTriggerClass}>
              Nocowanki{nocowankaTabCountSuffix}
            </TabsTrigger>
          </TabsList>
          <Button asChild size="sm" className="h-9 rounded-lg px-3 text-sm font-semibold">
            <Link
              href={
                tab === "nocowanki"
                  ? "/admin/wydarzenia/nocowanka/new"
                  : "/admin/wydarzenia/new"
              }
            >
              <span className="material-symbols-outlined mr-1 text-[18px]" aria-hidden>
                add
              </span>
              {tab === "nocowanki" ? "Dodaj nocowankę" : "Dodaj obóz"}
            </Link>
          </Button>
        </div>

        <TabsContent value="obozy" className="mt-0 focus-visible:ring-0">
          {campsLoading ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">Ładowanie…</p>
          ) : !camps?.length ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-6 py-10 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-400">
              Brak obozów w systemie.
            </div>
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-stone-700 dark:bg-stone-900/80">
              {camps.map((camp) => {
                const regCount = campCounts?.[camp._id] ?? 0;
                const isOpen = camp.isRegistrationOpen !== false;
                return (
                  <li
                    key={camp._id}
                    className="flex items-stretch border-b border-stone-200 last:border-b-0 dark:border-stone-700"
                  >
                    <Link
                      href={`/admin/wydarzenia/oboz/${encodeURIComponent(camp.slug)}/edit`}
                      className={rowClass}
                    >
                      <span className="risu-icon-well size-10" aria-hidden>
                        <span className="material-symbols-outlined text-[20px]">
                          {camp.category === "polkolonie" ? "diversity_3" : "hiking"}
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-stone-900 dark:text-white">
                          {camp.name}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-stone-500 dark:text-stone-400">
                          {formatCampDates(camp.startDate, camp.endDate)}
                          <span className="mx-1.5 text-stone-300 dark:text-stone-600">·</span>
                          {categoryLabel(camp.category)}
                        </p>
                        <p className="mt-1 text-xs font-medium tabular-nums text-stone-500 sm:hidden">
                          {regCount}
                          {camp.maxParticipants != null ? ` / ${camp.maxParticipants}` : " zapisów"}
                        </p>
                      </div>
                      <Occupancy current={regCount} max={camp.maxParticipants} />
                      <StatusPill open={isOpen} openLabel="Otwarte" closedLabel="Zamknięte" />
                    </Link>
                    <div className="flex shrink-0 items-center gap-0.5 pr-3">
                      <Link
                        href={`/admin/wydarzenia/oboz/${encodeURIComponent(camp.slug)}/pytania`}
                        className={iconBtnClass}
                        title="Pytania formularza"
                        aria-label="Pytania formularza"
                      >
                        <span className="material-symbols-outlined text-[20px]">quiz</span>
                      </Link>
                      <Link
                        href={`/admin/rejestracje/oboz/${encodeURIComponent(camp.slug)}`}
                        className={iconBtnClass}
                        title="Rejestracje"
                        aria-label="Rejestracje"
                      >
                        <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                      </Link>
                      <span
                        className="material-symbols-outlined text-xl text-stone-400 dark:text-stone-500"
                        aria-hidden
                      >
                        chevron_right
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="nocowanki" className="mt-0 focus-visible:ring-0">
          {nocowankiLoading ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">Ładowanie…</p>
          ) : nocowankaListWithFallback.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-6 py-10 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-400">
              Brak nocowanek. Dodaj nocowankę powyżej.
            </div>
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-stone-700 dark:bg-stone-900/80">
              {nocowankaListWithFallback.map((item) => {
                const regCount = nocowankaCounts?.[item.slug] ?? 0;
                const nocowankaDoc = nocowankaInDb.get(item.slug);
                const isOpen = nocowankaDoc ? nocowankaDoc.isActive !== false : true;
                const editHref = nocowankaDoc
                  ? `/admin/wydarzenia/nocowanka/${encodeURIComponent(item.slug)}/edit`
                  : `/admin/wydarzenia/nocowanka/new`;
                return (
                  <li
                    key={item.slug}
                    className="flex items-stretch border-b border-stone-200 last:border-b-0 dark:border-stone-700"
                  >
                    <Link href={editHref} className={rowClass}>
                      <span className="risu-icon-well size-10" aria-hidden>
                        <span className="material-symbols-outlined text-[20px]">
                          bedtime
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-stone-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-stone-500 dark:text-stone-400">
                          {nocowankaDoc?.datesLabel || "Nocowanka"}
                          {nocowankaDoc?.locationLabel ? (
                            <>
                              <span className="mx-1.5 text-stone-300 dark:text-stone-600">·</span>
                              {nocowankaDoc.locationLabel}
                            </>
                          ) : null}
                        </p>
                        <p className="mt-1 text-xs font-medium tabular-nums text-stone-500 sm:hidden">
                          {regCount} {regCount === 1 ? "dziecko" : "dzieci"}
                        </p>
                      </div>
                      <Occupancy current={regCount} max={nocowankaDoc?.maxParticipants} />
                      {nocowankaDoc ? (
                        <StatusPill open={isOpen} openLabel="Otwarta" closedLabel="Zamknięta" />
                      ) : (
                        <span className="inline-flex shrink-0 rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                          Brak karty
                        </span>
                      )}
                    </Link>
                    <div className="flex shrink-0 items-center gap-0.5 pr-3">
                      <Link
                        href={`/admin/wydarzenia/nocowanka/${encodeURIComponent(item.slug)}/pytania`}
                        className={iconBtnClass}
                        title="Pytania formularza"
                        aria-label="Pytania formularza"
                      >
                        <span className="material-symbols-outlined text-[20px]">quiz</span>
                      </Link>
                      <Link
                        href={`/admin/rejestracje/nocowanka/${encodeURIComponent(item.slug)}`}
                        className={iconBtnClass}
                        title="Rejestracje"
                        aria-label="Rejestracje"
                      >
                        <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                      </Link>
                      <span
                        className="material-symbols-outlined text-xl text-stone-400 dark:text-stone-500"
                        aria-hidden
                      >
                        chevron_right
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
