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

function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-3.5 flex items-end justify-between gap-3">
      <h2 className="text-lg font-black tracking-tight text-text-main dark:text-white">
        {title}
      </h2>
      {href && linkLabel ? (
        <Link
          href={href}
          className="text-xs font-bold text-primary transition-opacity hover:opacity-80"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

function EmptyPanel({
  icon,
  children,
  actionHref,
  actionLabel,
}: {
  icon: string;
  children: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300/90 bg-white/70 px-5 py-8 text-center dark:border-stone-700 dark:bg-[#2a2015]/50">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
        <span className="material-symbols-outlined text-[22px]" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="text-sm text-stone-500 dark:text-stone-400">{children}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-3 inline-flex text-sm font-bold text-primary transition-opacity hover:opacity-80"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

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
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-stone-200 dark:bg-stone-700" />
          <div className="h-10 w-64 max-w-full rounded-xl bg-stone-200 dark:bg-stone-700" />
          <div className="h-4 w-80 max-w-full rounded bg-stone-200 dark:bg-stone-700" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="h-36 rounded-2xl bg-stone-200/80 dark:bg-stone-700" />
            <div className="h-48 rounded-2xl bg-stone-200/80 dark:bg-stone-700" />
          </div>
          <div className="space-y-4">
            <div className="h-56 rounded-2xl bg-stone-200/80 dark:bg-stone-700" />
            <div className="h-48 rounded-2xl bg-stone-200/80 dark:bg-stone-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="mb-1 max-w-2xl sm:mb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          Panel rodzica
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-text-main dark:text-white md:text-4xl">
          Witaj, {firstName}!
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400 sm:text-base">
          Sprawdź, co słychać u Twoich małych sportowców.
        </p>
      </header>

      <nav
        className="grid grid-cols-2 gap-2.5 sm:gap-3 md:hidden"
        aria-label="Skróty panelu rodzica"
      >
        {dashboardMobilePanelLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-stone-200/80 bg-white px-2 py-3.5 shadow-card transition-all active:scale-[0.98] dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12">
              <span className="material-symbols-outlined text-[22px] text-primary">
                {item.icon}
              </span>
            </div>
            <span className="px-0.5 text-center text-[11px] font-bold leading-snug text-text-main dark:text-white sm:text-xs">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-7 lg:col-span-2">
          <section>
            <SectionHeading
              title="Moje dzieci"
              href="/dashboard/dzieci"
              linkLabel="Zarządzaj"
            />
            {home.childrenRows.length === 0 ? (
              <EmptyPanel
                icon="child_care"
                actionHref="/dashboard/dzieci"
                actionLabel="Dodaj pierwsze dziecko"
              >
                Nie masz jeszcze dodanych dzieci.
              </EmptyPanel>
            ) : (
              <div className="flex flex-wrap gap-3">
                {home.childrenRows.map((ch) => {
                  const dobLabel = formatChildDob(ch.dateOfBirth);
                  return (
                    <div
                      key={ch.childId}
                      className="min-w-[260px] max-w-md flex-1 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark"
                    >
                      <div className="flex gap-3.5">
                        <div
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                            ch.hasEnrollment ? enrolledAvatar : noEnrollmentAvatar
                          )}
                        >
                          <span className="material-symbols-outlined text-2xl">
                            {ch.hasEnrollment ? "school" : "child_care"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-text-main dark:text-white">
                            {ch.firstName} {ch.lastName}
                          </p>
                          {dobLabel ? (
                            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                              ur. {dobLabel}
                            </p>
                          ) : null}
                          {!ch.hasEnrollment ? (
                            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                              Brak zapisów
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <SectionHeading
              title="Nadchodzące zajęcia"
              href="/grafik"
              linkLabel="Grafik"
            />
            {home.upcoming.length === 0 ? (
              <EmptyPanel
                icon="event"
                actionHref="/dashboard/zapisy"
                actionLabel="Przejdź do zapisów"
              >
                Brak zaplanowanych zajęć — zapisz dziecko na grupę.
              </EmptyPanel>
            ) : (
              <ul className="space-y-2.5">
                {home.upcoming.map((row, i) => (
                  <li key={`${row.classId}-${row.atMs}-${i}`}>
                    <button
                      type="button"
                      onClick={() => setClassDetail(row)}
                      aria-label={`Szczegóły zajęć: ${row.className}`}
                      className="flex w-full cursor-pointer items-stretch gap-3.5 rounded-2xl border border-stone-200/80 bg-white p-3.5 text-left shadow-card transition-colors hover:border-primary/35 dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark dark:hover:border-primary/40 sm:gap-4 sm:p-4"
                    >
                      <div
                        className={cn(
                          "flex w-14 shrink-0 flex-col items-center justify-center rounded-xl py-2 text-center font-bold",
                          row.schedulePending
                            ? "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-200"
                            : tintPill[row.tint]
                        )}
                      >
                        <span className="text-[10px] uppercase leading-tight opacity-90">
                          {row.schedulePending ? "grafik" : row.dowShort}
                        </span>
                        <span className="text-xl leading-none">
                          {row.schedulePending ? "…" : row.dayNum}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <p className="truncate font-bold text-text-main dark:text-white">
                          {row.className}
                        </p>
                        <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                          {row.childFirstName}
                          {row.schedulePending ? (
                            <> · Godziny w grafiku</>
                          ) : (
                            <>
                              {" "}
                              · {row.startTime}–{row.endTime}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="hidden max-w-[120px] shrink-0 items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 sm:flex">
                        <span className="material-symbols-outlined shrink-0 text-lg">
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
            <SectionHeading
              title="Nadchodzące obozy"
              href="/dashboard/zapisy?tab=obozy"
              linkLabel="Wszystkie"
            />
            <DashboardCampRegistrations variant="rows" />
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <SectionHeading title="Płatności" />
            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark">
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
                  Do zapłaty
                </span>
                {home.pendingCount > 0 ? (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    {home.pendingCount}{" "}
                    {home.pendingCount === 1 ? "oczekująca" : "oczekujące"}
                  </span>
                ) : null}
              </div>
              <p className="mb-5 text-3xl font-black tracking-tight text-text-main dark:text-white">
                {formatPln(home.pendingTotalGrosze)} zł
              </p>
              <ul className="mb-5 space-y-2.5">
                {home.pendingPayments.map((p) => (
                  <li
                    key={`${p.subscriptionId}-${p.year}-${p.month}`}
                    className="flex justify-between gap-2 text-sm"
                  >
                    <span className="truncate text-stone-500 dark:text-stone-400">
                      {p.childName} — {p.className} ({p.periodLabel})
                    </span>
                    <span className="shrink-0 font-semibold text-text-main dark:text-stone-200">
                      {formatPln(p.amountGrosze)} zł
                    </span>
                  </li>
                ))}
                {home.activePaidLines.map((line, i) => (
                  <li
                    key={`paid-${line.childName}-${i}`}
                    className="flex justify-between gap-2 text-sm"
                  >
                    <span className="truncate text-stone-500 dark:text-stone-400">
                      {line.childName} — {line.className}
                    </span>
                    <span className="shrink-0 font-semibold text-emerald-600 dark:text-emerald-400">
                      Zapłacono
                    </span>
                  </li>
                ))}
                {home.pendingPayments.length === 0 &&
                home.activePaidLines.length === 0 ? (
                  <li className="text-sm text-stone-500 dark:text-stone-400">
                    Brak pozycji do rozliczenia.
                  </li>
                ) : null}
              </ul>
              <Link
                href={
                  home.pendingCount > 0
                    ? "/dashboard/aktywnosci?tab=do_zaplaty"
                    : "/cennik"
                }
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary-hover"
              >
                {home.pendingCount > 0 ? "Opłać teraz" : "Zobacz cennik"}
                <ArrowRightIcon className="text-[1.1em]" />
              </Link>
            </div>
          </section>

          <section>
            <SectionHeading title="Szybkie akcje" />
            <ul className="space-y-2.5">
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
                    className="flex gap-3.5 rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-card transition-colors hover:border-primary/35 dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark dark:hover:border-primary/40"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12">
                      <span className="material-symbols-outlined text-xl text-primary">
                        {a.icon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-main dark:text-white">
                        {a.title}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
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
        <DialogContent className="max-h-[85vh] overflow-y-auto border-stone-200 dark:border-stone-700 sm:max-w-md">
          {classDetail ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-left text-text-main dark:text-white">
                  {classDetail.className}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm text-stone-500 dark:text-stone-400">
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
                    Dyscyplina
                  </p>
                  <p className="text-text-main dark:text-stone-200">
                    {classDetail.discipline}
                  </p>
                </div>
                {classDetail.ageGroup ? (
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
                      Grupa wiekowa
                    </p>
                    <p className="text-text-main dark:text-stone-200">
                      {classDetail.ageGroup}
                    </p>
                  </div>
                ) : null}
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
                    Uczestnik
                  </p>
                  <p className="text-text-main dark:text-stone-200">
                    {classDetail.childFirstName}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
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
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
                    Lokalizacja
                  </p>
                  <p className="text-text-main dark:text-stone-200">
                    {classDetail.locationName}
                  </p>
                  {classDetail.locationDetail ? (
                    <p className="mt-1">{classDetail.locationDetail}</p>
                  ) : null}
                </div>
                {classDetail.description ? (
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">
                      Opis
                    </p>
                    <p className="whitespace-pre-wrap leading-relaxed text-text-main dark:text-stone-300">
                      {classDetail.description}
                    </p>
                  </div>
                ) : null}
              </div>
              <Button asChild className="mt-2 h-11 w-full rounded-xl font-bold">
                <Link href="/grafik" onClick={() => setClassDetail(null)}>
                  Zobacz grafik zajęć
                </Link>
              </Button>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
