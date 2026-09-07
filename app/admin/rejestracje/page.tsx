"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getNocowankaDisplayName } from "@/lib/nocowanki";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatAdminTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Główna akcja na liście rejestracji — przejście do zapisów */
function registrationsPrimaryButtonClassName() {
  return cn(
    "font-semibold shadow-md transition-shadow hover:shadow-lg",
    "bg-primary text-primary-foreground hover:bg-primary/90",
    "border border-primary/30 dark:border-primary/40",
    "min-h-11 w-full touch-manipulation sm:min-h-10"
  );
}

export default function AdminRejestracjePage() {
  const camps = useQuery(api.camps.getCamps, { activeOnly: false });
  const nocowanki = useQuery(api.nocowanki.listForAdmin);
  const registrationSlugs = useQuery(api.registrations.listNocowankaSlugsForAdmin);
  const campCounts = useQuery(api.registrations.getCampRegistrationCountsForAdmin);
  const nocowankaCounts = useQuery(api.registrations.getNocowankaRegistrationCountsForAdmin);

  const campsLoading = camps === undefined || registrationSlugs === undefined || campCounts === undefined;
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
    <div className="w-full min-w-0 max-w-4xl space-y-6 text-left">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-text-main dark:text-white">Rejestracje</h1>
        <p className="mb-4 text-text-light dark:text-stone-400">
          Przeglądaj listy zapisów, status płatności i formularze dla obozów oraz nocowanek.
        </p>

        <Tabs defaultValue="obozy" className="w-full">
          <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 p-1 sm:max-w-md">
            <TabsTrigger value="obozy" className="min-h-10 text-base font-semibold sm:text-sm">
              Obozy{campTabCountSuffix}
            </TabsTrigger>
            <TabsTrigger value="nocowanki" className="min-h-10 text-base font-semibold sm:text-sm">
              Nocowanki{nocowankaTabCountSuffix}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="obozy" className="mt-0 space-y-4 focus-visible:ring-0">
            {campsLoading ? (
              <p className="text-text-light dark:text-stone-400">Ładowanie…</p>
            ) : !camps?.length ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-text-light dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-400">
                Brak obozów w systemie.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {camps.map((camp) => {
                  const regCount = campCounts?.[camp._id] ?? 0;
                  const isOpen = camp.isRegistrationOpen !== false;
                  return (
                    <div
                      key={camp._id}
                      className={cn(
                        "flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4",
                        "dark:border-stone-700 dark:bg-stone-900/80"
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/admin/rejestracje/oboz/${encodeURIComponent(camp.slug)}`}
                            className={cn(
                              "font-semibold text-text-main transition-colors hover:text-primary dark:text-white",
                              "rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            )}
                          >
                            {camp.name}
                          </Link>
                          <p className="mt-1 font-mono text-xs text-text-light dark:text-stone-400">{camp.slug}</p>
                          <p className="mt-1 text-xs text-text-light dark:text-stone-400">
                            Zaktualizowano: {formatAdminTimestamp(camp.updatedAt ?? camp._creationTime)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "Otwarte" : "Zamknięte"}</Badge>
                          <span className="text-xs font-medium text-text-light dark:text-stone-400">
                            {regCount} / {camp.maxParticipants}
                          </span>
                        </div>
                      </div>
                      <Button asChild size="sm" className={registrationsPrimaryButtonClassName()}>
                        <Link href={`/admin/rejestracje/oboz/${encodeURIComponent(camp.slug)}`}>
                          Lista zapisów
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="nocowanki" className="mt-0 space-y-4 focus-visible:ring-0">
            {nocowankiLoading ? (
              <p className="text-text-light dark:text-stone-400">Ładowanie…</p>
            ) : nocowankaListWithFallback.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-text-light dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-400">
                Brak nocowanek. Poczekaj na pierwsze rejestracje lub dodaj nocowankę w sekcji Wydarzenia.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {nocowankaListWithFallback.map((item) => {
                  const regCount = nocowankaCounts?.[item.slug] ?? 0;
                  const hasDbRow = nocowankaInDb.has(item.slug);
                  const nocowankaDoc = hasDbRow ? nocowankaInDb.get(item.slug) : undefined;
                  const isOpen = nocowankaDoc ? nocowankaDoc.isActive !== false : true;
                  return (
                    <div
                      key={item.slug}
                      className={cn(
                        "flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4",
                        "dark:border-stone-700 dark:bg-stone-900/80"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/admin/rejestracje/nocowanka/${encodeURIComponent(item.slug)}`}
                            className={cn(
                              "font-semibold text-text-main transition-colors hover:text-primary dark:text-white",
                              "rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            )}
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 font-mono text-xs text-text-light dark:text-stone-400">{item.slug}</p>
                          <p className="mt-1 text-xs text-text-light dark:text-stone-400">
                            Zaktualizowano:{" "}
                            {hasDbRow
                              ? formatAdminTimestamp(nocowankaDoc!.updatedAt ?? nocowankaDoc!._creationTime)
                              : "brak danych"}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {hasDbRow ? (
                            <Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "Otwarta" : "Zamknięta"}</Badge>
                          ) : null}
                          <span className="text-xs font-medium text-text-light dark:text-stone-400">
                            {regCount} {regCount === 1 ? "dziecko" : "dzieci"}
                          </span>
                        </div>
                      </div>
                      <Button asChild size="sm" className={registrationsPrimaryButtonClassName()}>
                        <Link href={`/admin/rejestracje/nocowanka/${encodeURIComponent(item.slug)}`}>
                          Lista zapisów
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
