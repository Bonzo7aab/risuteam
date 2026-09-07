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

/** Przycisk dodawania wydarzenia (obóz / nocowanka) */
function addEventButtonClassName() {
  return cn(
    "font-semibold shadow-sm transition-colors",
    "border border-emerald-700/25 bg-emerald-600 text-white hover:bg-emerald-700",
    "focus-visible:ring-emerald-500 dark:border-emerald-400/30 dark:bg-emerald-600 dark:hover:bg-emerald-500"
  );
}

/** Wyraźny przycisk edycji na kartach listy wydarzeń */
function editActionButtonClassName() {
  return cn(
    "font-semibold shadow-md transition-shadow hover:shadow-lg",
    "bg-primary text-primary-foreground hover:bg-primary/90",
    "border border-primary/30 dark:border-primary/40",
    "min-h-11 w-full touch-manipulation sm:min-h-10 sm:flex-1"
  );
}

/** Przycisk „Pytania formularza” obok edycji */
function formQuestionsButtonClassName() {
  return cn(
    "min-h-11 w-full touch-manipulation font-semibold sm:min-h-10 sm:flex-1",
    "border-2 border-primary/35 text-primary hover:bg-primary/10 dark:border-primary/45 dark:hover:bg-primary/15"
  );
}

export default function AdminWydarzeniaPage() {
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
        <h1 className="mb-2 text-2xl font-bold text-text-main dark:text-white">Wydarzenia</h1>
        <p className="mb-4 text-text-light dark:text-stone-400">
          Zarządzaj tworzeniem i edycją obozów oraz nocowanek.
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
            <div className="flex items-center justify-start gap-3">
              <Button asChild className={addEventButtonClassName()}>
                <Link href="/admin/wydarzenia/new">Dodaj obóz</Link>
              </Button>
            </div>

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
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button asChild size="sm" className={editActionButtonClassName()}>
                          <Link href={`/admin/wydarzenia/oboz/${encodeURIComponent(camp.slug)}/edit`}>
                            Edytuj obóz
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className={formQuestionsButtonClassName()}>
                          <Link href={`/admin/wydarzenia/oboz/${encodeURIComponent(camp.slug)}/pytania`}>
                            Pytania formularza
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="nocowanki" className="mt-0 space-y-4 focus-visible:ring-0">
            <div className="flex items-center justify-start gap-3">
              <Button asChild className={addEventButtonClassName()}>
                <Link href="/admin/wydarzenia/nocowanka/new">Dodaj nocowankę</Link>
              </Button>
            </div>

            {nocowankiLoading ? (
              <p className="text-text-light dark:text-stone-400">Ładowanie…</p>
            ) : nocowankaListWithFallback.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-text-light dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-400">
                Brak nocowanek. Dodaj nocowankę powyżej lub poczekaj na rejestracje.
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
                      {hasDbRow ? (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button asChild size="sm" className={editActionButtonClassName()}>
                            <Link href={`/admin/wydarzenia/nocowanka/${encodeURIComponent(item.slug)}/edit`}>
                              Edytuj nocowankę
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" className={formQuestionsButtonClassName()}>
                            <Link href={`/admin/wydarzenia/nocowanka/${encodeURIComponent(item.slug)}/pytania`}>
                              Pytania formularza
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-text-light dark:text-stone-400">
                            Dodaj rekord nocowanki w bazie, aby móc edytować szczegóły.
                          </p>
                          <Button asChild size="sm" variant="outline" className={cn(formQuestionsButtonClassName(), "sm:max-w-md")}>
                            <Link href={`/admin/wydarzenia/nocowanka/${encodeURIComponent(item.slug)}/pytania`}>
                              Pytania formularza
                            </Link>
                          </Button>
                        </div>
                      )}
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
