"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DashboardCampRegistrations } from "@/components/dashboard-camp-registrations";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parentDashboardNavItems } from "@/lib/nav/parent-dashboard-nav";

/** Sidebar links except home — four destinations for mobile quick cards */
const dashboardMobilePanelLinks = parentDashboardNavItems.filter(
  (item) => item.href !== "/dashboard"
);

function formatPln(grosze: number): string {
  return (grosze / 100).toFixed(2).replace(".", ",");
}

function formatChildDob(raw?: string): string | null {
  if (!raw?.trim()) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw.trim();
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const enrolledAvatar =
  "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300";
const noEnrollmentAvatar =
  "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300";

const tintPill = {
  orange: "bg-orange-500 text-white",
  sky: "bg-sky-500 text-white",
  violet: "bg-violet-500 text-white",
} as const;

type DashboardUpcomingClassRow = {
  classId: Id<"classes">;
  atMs: number;
  className: string;
  childFirstName: string;
  discipline: string;
  ageGroup?: string;
  description?: string;
  locationName: string;
  locationDetail?: string;
  schedulePending: boolean;
  dowShort: string;
  dayNum: number;
  startTime: string;
  endTime: string;
  tint: "orange" | "sky" | "violet";
};

export function DashboardHome() {
  const asOf = useMemo(() => Date.now(), []);
  const home = useQuery(api.parentDashboard.getParentDashboardHome, {
    asOfTimestamp: asOf,
  });
  const user = useQuery(api.authHelpers.getCurrentUser);
  const [classDetail, setClassDetail] = useState<DashboardUpcomingClassRow | null>(
    null
  );

  const firstName = useMemo(() => {
    if (!user) return "Rodzicu";
    const n = user.name?.trim();
    if (!n) return "Rodzicu";
    return n.split(/\s+/)[0] ?? n;
  }, [user]);

  if (home === undefined || user === undefined) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-16 bg-stone-200/80 dark:bg-stone-700 rounded-2xl max-w-xl" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 bg-stone-200/80 dark:bg-stone-700 rounded-2xl" />
            <div className="h-48 bg-stone-200/80 dark:bg-stone-700 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="h-56 bg-stone-200/80 dark:bg-stone-700 rounded-2xl" />
            <div className="h-64 bg-stone-200/80 dark:bg-stone-700 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const monthLabel = new Date().toLocaleDateString("pl-PL", { month: "long" });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-text-main dark:text-white tracking-tight">
            Witaj, {firstName}!
          </h1>
          <p className="text-text-light dark:text-stone-400 mt-1">
            Sprawdź, co słychać u Twoich małych sportowców.
          </p>
        </div>
      </header>

      <nav
        className="md:hidden grid grid-cols-2 gap-2.5 sm:gap-3"
        aria-label="Skróty panelu rodzica"
      >
        {dashboardMobilePanelLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-stone-200 bg-white px-2 py-3 shadow-sm transition-all active:scale-[0.98] dark:border-stone-700 dark:bg-stone-900/80 hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 dark:bg-primary/20">
              <span className="material-symbols-outlined text-primary text-[22px]">
                {item.icon}
              </span>
            </div>
            <span className="text-center text-[11px] font-bold leading-snug text-text-main dark:text-white sm:text-xs px-0.5">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Moje dzieci */}
          <section>
            <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
              Moje dzieci
            </h2>
            {home.childrenRows.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-8 text-center shadow-sm">
                <p className="text-text-light dark:text-stone-400 mb-4">
                  Nie masz jeszcze dodanych dzieci.
                </p>
                <Link
                  href="/dashboard/dzieci"
                  className="text-primary font-bold risu-underline"
                >
                  Dodaj pierwsze dziecko
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {home.childrenRows.map((ch) => {
                  const dobLabel = formatChildDob(ch.dateOfBirth);
                  return (
                  <div
                    key={ch.childId}
                    className="flex-1 min-w-[260px] max-w-md rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-4 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          "h-14 w-14 rounded-full flex items-center justify-center shrink-0",
                          ch.hasEnrollment ? enrolledAvatar : noEnrollmentAvatar
                        )}
                      >
                        <span className="material-symbols-outlined text-2xl">
                          {ch.hasEnrollment ? "school" : "child_care"}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-text-main dark:text-white truncate">
                          {ch.firstName} {ch.lastName}
                        </p>
                        {dobLabel && (
                          <p className="text-sm text-text-light dark:text-stone-500">
                            ur. {dobLabel}
                          </p>
                        )}
                        {!ch.hasEnrollment && (
                          <p className="text-sm text-text-light dark:text-stone-500">
                            Brak zapisów
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Nadchodzące zajęcia */}
          <section>
            <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
              Nadchodzące zajęcia
            </h2>
            {home.upcoming.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-600 bg-white/50 dark:bg-stone-900/40 p-8 text-center">
                <p className="text-text-light dark:text-stone-400 text-sm mb-3">
                  Brak zaplanowanych zajęć — zapisz dziecko na grupę.
                </p>
                <Link
                  href="/dashboard/zapisy"
                  className="text-primary font-bold risu-underline text-sm"
                >
                  Przejdź do zapisów
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {home.upcoming.map((row, i) => (
                  <li key={`${row.classId}-${row.atMs}-${i}`}>
                    <button
                      type="button"
                      onClick={() => setClassDetail(row)}
                      aria-label={`Szczegóły zajęć: ${row.className}`}
                      className="flex gap-4 items-stretch w-full text-left rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-4 shadow-sm hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div
                        className={cn(
                          "w-14 shrink-0 rounded-xl flex flex-col items-center justify-center py-2 text-center font-bold",
                          row.schedulePending
                            ? "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-200"
                            : tintPill[row.tint]
                        )}
                      >
                        <span className="text-[10px] uppercase opacity-90 leading-tight">
                          {row.schedulePending ? "grafik" : row.dowShort}
                        </span>
                        <span className="text-xl leading-none">
                          {row.schedulePending ? "…" : row.dayNum}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <p className="font-bold text-text-main dark:text-white truncate">
                          {row.className}
                        </p>
                        <p className="text-sm text-text-light dark:text-stone-400">
                          {row.childFirstName}
                          {row.schedulePending ? (
                            <>
                              {" "}
                              · Godziny w grafiku
                            </>
                          ) : (
                            <>
                              {" "}
                              · {row.startTime}–{row.endTime}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 text-sm text-text-light dark:text-stone-400 shrink-0 max-w-[120px]">
                        <span className="material-symbols-outlined text-lg shrink-0">
                          location_on
                        </span>
                        <span className="truncate">{row.locationName}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
              Nadchodzące obozy
            </h2>
            <DashboardCampRegistrations variant="rows" />
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
              Płatności
            </h2>
            <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-400">
                  Do zapłaty
                </span>
                {home.pendingCount > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-1 rounded-full">
                    {home.pendingCount}{" "}
                    {home.pendingCount === 1 ? "oczekująca" : "oczekujące"}
                  </span>
                )}
              </div>
              <p className="text-3xl font-black text-text-main dark:text-white mb-6">
                {formatPln(home.pendingTotalGrosze)} zł
              </p>
              <ul className="space-y-3 mb-6">
                {home.pendingPayments.map((p) => (
                  <li
                    key={p.subscriptionId}
                    className="flex justify-between gap-2 text-sm"
                  >
                    <span className="text-text-light dark:text-stone-400 truncate">
                      {p.childName} — składka {monthLabel}
                    </span>
                    <span className="font-medium text-text-main dark:text-stone-300 shrink-0">
                      {formatPln(p.amountGrosze)} zł
                    </span>
                  </li>
                ))}
                {home.activePaidLines.map((line, i) => (
                  <li
                    key={`paid-${line.childName}-${i}`}
                    className="flex justify-between gap-2 text-sm"
                  >
                    <span className="text-text-light dark:text-stone-400 truncate">
                      {line.childName} — składka {monthLabel}
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      Zapłacono
                    </span>
                  </li>
                ))}
                {home.pendingPayments.length === 0 &&
                  home.activePaidLines.length === 0 && (
                    <li className="text-sm text-text-light dark:text-stone-400">
                      Brak pozycji do rozliczenia.
                    </li>
                  )}
              </ul>
              <Link
                href={
                  home.pendingCount > 0
                    ? "/dashboard/aktywnosci?tab=do_zaplaty"
                    : "/cennik"
                }
                className="flex items-center justify-center gap-2 w-full rounded-xl h-12 font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors shadow-sm"
              >
                {home.pendingCount > 0 ? "Opłać teraz" : "Zobacz cennik"}
                <ArrowRightIcon className="text-[1.1em]" />
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
              Szybkie akcje
            </h2>
            <ul className="space-y-3">
              {[
                {
                  href: "/dashboard/zapisy",
                  icon: "event",
                  title: "Zarezerwuj wydarzenie",
                  desc: "Półkolonie, turnieje, egzaminy",
                },
                {
                  href: "/kontakt",
                  icon: "chat",
                  title: "Napisz do trenera",
                  desc: "Zadaj pytanie o postępy",
                },
                {
                  href: "/faq",
                  icon: "description",
                  title: "Dokumenty i zgody",
                  desc: "Ubezpieczenia i oświadczenia",
                },
              ].map((a) => (
                <li key={a.href}>
                  <Link
                    href={a.href}
                    className="flex gap-4 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">
                        {a.icon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-text-main dark:text-white text-sm">
                        {a.title}
                      </p>
                      <p className="text-xs text-text-light dark:text-stone-500 mt-0.5">
                        {a.desc}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <Dialog
        open={classDetail !== null}
        onOpenChange={(open) => !open && setClassDetail(null)}
      >
        <DialogContent className="sm:max-w-md border-stone-200 dark:border-stone-700 max-h-[85vh] overflow-y-auto">
          {classDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-text-main dark:text-white text-left">
                  {classDetail.className}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm text-text-light dark:text-stone-400">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">
                    Dyscyplina
                  </p>
                  <p className="text-text-main dark:text-stone-200">
                    {classDetail.discipline}
                  </p>
                </div>
                {classDetail.ageGroup && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">
                      Grupa wiekowa
                    </p>
                    <p className="text-text-main dark:text-stone-200">
                      {classDetail.ageGroup}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">
                    Uczestnik
                  </p>
                  <p className="text-text-main dark:text-stone-200">
                    {classDetail.childFirstName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">
                    Najbliższy termin
                  </p>
                  <p className="text-text-main dark:text-stone-200">
                    {classDetail.schedulePending
                      ? "Godziny ustalane są w grafiku — zobacz pełny harmonogram."
                      : `${new Date(classDetail.atMs).toLocaleString("pl-PL", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} (${classDetail.startTime}–${classDetail.endTime})`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">
                    Lokalizacja
                  </p>
                  <p className="text-text-main dark:text-stone-200">
                    {classDetail.locationName}
                  </p>
                  {classDetail.locationDetail && (
                    <p className="mt-1">{classDetail.locationDetail}</p>
                  )}
                </div>
                {classDetail.description && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">
                      Opis
                    </p>
                    <p className="text-text-main dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                      {classDetail.description}
                    </p>
                  </div>
                )}
              </div>
              <Button asChild className="w-full mt-2">
                <Link href="/grafik" onClick={() => setClassDetail(null)}>
                  Zobacz grafik zajęć
                </Link>
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
