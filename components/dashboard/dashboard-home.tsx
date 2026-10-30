"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { getNocowankaDisplayName } from "@/lib/nocowanki";
import { parentDashboardNavItems } from "@/lib/nav/parent-dashboard-nav";

/** Sidebar links except home — four destinations for mobile quick cards */
const dashboardMobilePanelLinks = parentDashboardNavItems.filter(
  (item) => item.href !== "/dashboard"
);

const DOW_PL = ["NDZ", "PN", "WT", "ŚR", "CZW", "PT", "SOB"] as const;

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

function formatRangePl(startMs: number, endMs?: number): string {
  const start = new Date(startMs);
  const end = endMs ? new Date(endMs) : null;
  const startLabel = start.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
  });
  if (!end) return startLabel;
  const endLabel = end.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
  });
  return `${startLabel}–${endLabel}`;
}

const enrolledAvatar =
  "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300";
const noEnrollmentAvatar =
  "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300";

type CampReg = Doc<"registrations"> & {
  camp?: {
    name: string;
    slug: string;
    startDate?: number;
    endDate?: number;
  } | null;
};

type UpcomingEventRow = {
  key: string;
  href: string;
  title: string;
  childLabel: string;
  kindLabel: string;
  atMs: number;
  meta?: string;
  statusLabel: string;
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
  const campRegs = useQuery(api.registrations.listMyCampRegistrations, {}) as
    | CampReg[]
    | undefined;
  const nocowankaRegs = useQuery(
    api.registrations.listMyNocowankaRegistrations,
    {}
  );

  const firstName = useMemo(() => {
    if (!user) return "Rodzicu";
    const n = user.name?.trim();
    if (!n) return "Rodzicu";
    return n.split(/\s+/)[0] ?? n;
  }, [user]);

  const upcomingEvents = useMemo(() => {
    if (campRegs === undefined || nocowankaRegs === undefined) return undefined;
    const now = Date.now();
    const rows: UpcomingEventRow[] = [];

    for (const reg of campRegs) {
      const atMs = reg.camp?.startDate ?? reg._creationTime;
      if (reg.camp?.endDate != null && reg.camp.endDate < now) continue;
      const slug = reg.camp?.slug?.trim();
      rows.push({
        key: `camp-${reg._id}`,
        href: slug ? `/obozy/${encodeURIComponent(slug)}` : "/obozy",
        title: reg.camp?.name ?? "Obóz",
        childLabel: `${reg.childName} ${reg.childSurname}`.trim(),
        kindLabel: "Obóz",
        atMs,
        meta: reg.camp?.startDate
          ? formatRangePl(reg.camp.startDate, reg.camp.endDate)
          : undefined,
        statusLabel: reg.status === "new" ? "Nowa" : (reg.status ?? "—"),
      });
    }

    for (const reg of nocowankaRegs) {
      rows.push({
        key: `nocowanka-${reg._id}`,
        href: `/obozy/nocowanki/${encodeURIComponent(reg.slug)}`,
        title: getNocowankaDisplayName(reg.slug),
        childLabel: `${reg.childName} ${reg.childSurname}`.trim(),
        kindLabel: "Nocowanka",
        atMs: reg._creationTime,
        statusLabel: reg.status === "new" ? "Nowa" : (reg.status ?? "—"),
      });
    }

    rows.sort((a, b) => a.atMs - b.atMs);
    return rows.slice(0, 8);
  }, [campRegs, nocowankaRegs]);

  if (home === undefined || user === undefined || upcomingEvents === undefined) {
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
              title="Nadchodzące wydarzenia"
              href="/dashboard/zapisy"
              linkLabel="Wszystkie"
            />
            {upcomingEvents.length === 0 ? (
              <EmptyPanel
                icon="event"
                actionHref="/dashboard/zapisy"
                actionLabel="Przejdź do zapisów"
              >
                Brak nadchodzących obozów i nocowanek — zapisz dziecko na
                wydarzenie.
              </EmptyPanel>
            ) : (
              <ul className="space-y-2.5">
                {upcomingEvents.map((row) => {
                  const d = new Date(row.atMs);
                  const dow = DOW_PL[d.getDay()] ?? "??";
                  const dayNum = d.getDate();
                  return (
                    <li key={row.key}>
                      <Link
                        href={row.href}
                        className="flex items-stretch gap-3.5 rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-card transition-colors hover:border-primary/35 dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark dark:hover:border-primary/40 sm:gap-4 sm:p-4"
                      >
                        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary py-2 text-center font-bold text-primary-foreground">
                          <span className="text-[10px] uppercase leading-tight opacity-90">
                            {dow}
                          </span>
                          <span className="text-xl leading-none">{dayNum}</span>
                        </div>
                        <div className="min-w-0 flex-1 py-0.5">
                          <p className="truncate font-bold text-text-main dark:text-white">
                            {row.title}
                          </p>
                          <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                            {row.kindLabel} · {row.childLabel}
                          </p>
                        </div>
                        <div className="hidden shrink-0 flex-col items-end justify-center gap-1 sm:flex">
                          {row.meta ? (
                            <span className="text-sm text-stone-500 dark:text-stone-400">
                              {row.meta}
                            </span>
                          ) : null}
                          <span className="text-[11px] font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                            {row.statusLabel}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
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
    </div>
  );
}
