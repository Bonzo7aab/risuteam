"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Baby,
  Calendar,
  CalendarDays,
  Plus,
  Tent,
  UserRound,
  Users,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { AdminMobileMenuCards } from "@/components/admin/admin-mobile-menu-cards";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const panel =
  "flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark";

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase("pl-PL") + value.slice(1);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  return "?";
}

function formatRegistrationDate(ts: number, now: number): string {
  const d = new Date(ts);
  const today = new Date(now);
  const sameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  const time = d.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (sameDay) return `Dzisiaj, ${time}`;
  return `${d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
  })}, ${time}`;
}

function registrationStatus(status?: string): { label: string; className: string } {
  const key = status?.toLowerCase() ?? "";
  if (key === "new") {
    return {
      label: "Nowa",
      className:
        "bg-amber-50 text-amber-800 ring-amber-200/80 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30",
    };
  }
  if (key === "confirmed") {
    return {
      label: "Potwierdzona",
      className:
        "bg-emerald-50 text-emerald-800 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30",
    };
  }
  if (key === "cancelled" || key === "canceled") {
    return {
      label: "Anulowana",
      className:
        "bg-stone-100 text-stone-600 ring-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700",
    };
  }
  if (key) {
    return {
      label: status!,
      className:
        "bg-stone-100 text-stone-700 ring-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700",
    };
  }
  return {
    label: "—",
    className:
      "bg-stone-50 text-stone-500 ring-stone-200 dark:bg-stone-800/60 dark:text-stone-400 dark:ring-stone-700",
  };
}

function durationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

function clockMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function daysUntil(start: number, now: number): number {
  return Math.round((startOfDay(start) - startOfDay(now)) / 86_400_000);
}

function whenLabel(days: number): string {
  if (days <= 0) return "Start dzisiaj";
  if (days === 1) return "Jutro";
  return `Za ${days} dni`;
}

function formatCampRange(start: number, end?: number): string {
  const startDate = new Date(start);
  const startLabel = startDate.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (end == null) return startLabel;
  const endDate = new Date(end);
  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();
  if (sameMonth) {
    const monthYear = endDate.toLocaleDateString("pl-PL", {
      month: "short",
      year: "numeric",
    });
    return `${startDate.getDate()}–${endDate.getDate()} ${monthYear}`;
  }
  const endLabel = endDate.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

function formatCount(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("pl-PL");
}

function plCount(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const word =
    count === 1
      ? one
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? few
        : many;
  return `${count.toLocaleString("pl-PL")} ${word}`;
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs shadow-card dark:border-stone-700 dark:bg-stone-950">
      <p className="font-semibold text-text-main dark:text-white">{label}</p>
      <p className="mt-0.5 text-text-light dark:text-stone-400">
        {value.toLocaleString("pl-PL")}{" "}
        {value === 1 ? "rejestracja" : "rejestracji"}
      </p>
    </div>
  );
}

function SectionLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover"
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}

function MetricCell({
  href,
  label,
  value,
  hint,
  hintClassName,
  icon: Icon,
}: {
  href?: string;
  label: string;
  value: string;
  hint: string;
  hintClassName?: string;
  icon: typeof Users;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-text-light dark:text-stone-400">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-[1.65rem] font-semibold tabular-nums leading-none tracking-tight text-text-main dark:text-white">
        {value}
      </p>
      <p className={cn("mt-2 text-xs text-stone-500 dark:text-stone-400", hintClassName)}>
        {hint}
      </p>
    </>
  );

  if (!href) {
    return <div className="bg-white px-4 py-4 dark:bg-[#2a2015] sm:px-5">{body}</div>;
  }

  return (
    <Link
      href={href}
      className="group bg-white px-4 py-4 transition-colors hover:bg-stone-50 dark:bg-[#2a2015] dark:hover:bg-stone-800/40 sm:px-5"
    >
      {body}
    </Link>
  );
}

function EmptyNote({ children }: { children: string }) {
  return (
    <p className="flex flex-1 items-center justify-center px-2 py-10 text-center text-sm text-stone-500 dark:text-stone-400">
      {children}
    </p>
  );
}

export default function AdminPulpitPage() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const clock = useMemo(() => {
    if (now === null) return null;
    const date = new Date(now);
    return {
      dayOfWeek: date.getDay(),
      minutes: date.getHours() * 60 + date.getMinutes(),
      greeting: date.getHours() < 18 ? "Dzień dobry" : "Dobry wieczór",
      dateLabel: capitalize(
        date.toLocaleDateString("pl-PL", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      ),
    };
  }, [now]);

  const user = useQuery(api.authHelpers.getCurrentUser);
  const stats = useQuery(
    api.dashboard.getDashboardStats,
    now === null ? "skip" : { asOfTimestamp: now }
  );
  const trends = useQuery(
    api.dashboard.getRegistrationTrends,
    now === null ? "skip" : { months: 6, asOfTimestamp: now }
  );
  const todaysSchedule = useQuery(
    api.dashboard.getTodaysScheduleForAdmin,
    clock === null ? "skip" : { dayOfWeek: clock.dayOfWeek }
  );
  const allRegistrations = useQuery(api.registrations.listCampRegistrationsForAdmin);
  const recentRegistrations = (allRegistrations ?? []).slice(0, 6);

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const latest = trends?.[trends.length - 1];
  const previous = trends && trends.length > 1 ? trends[trends.length - 2] : undefined;
  const trendDelta =
    latest && previous ? latest.count - previous.count : null;
  const trendTotal = trends?.reduce((sum, point) => sum + point.count, 0) ?? 0;

  const scheduleSummary = useMemo(() => {
    if (!todaysSchedule) return null;
    const participants = todaysSchedule.reduce((sum, item) => sum + item.enrolledCount, 0);
    return { sessions: todaysSchedule.length, participants };
  }, [todaysSchedule]);

  const eventsHint =
    (stats?.eventsNewThisWeek ?? 0) > 0
      ? `+${stats?.eventsNewThisWeek} w tym tygodniu`
      : "Bez nowych w tym tygodniu";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-light dark:text-stone-400">
            Panel administratora
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-main dark:text-white">
            Pulpit
          </h1>
          <p className="mt-1 flex flex-col text-sm text-stone-500 dark:text-stone-400 sm:flex-row sm:flex-wrap sm:items-center">
            {clock ? (
              <>
                <span>
                  {clock.greeting}
                  {firstName ? `, ${firstName}` : ""}
                </span>
                <span className="mx-1.5 hidden text-stone-300 dark:text-stone-600 sm:inline">·</span>
                <span>{clock.dateLabel}</span>
              </>
            ) : (
              <span className="inline-block h-4 w-56 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/rejestracje">Rejestracje</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/grafik">Grafik</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/wydarzenia/new" className="gap-1.5">
              <Plus className="h-4 w-4" aria-hidden />
              Nowe wydarzenie
            </Link>
          </Button>
        </div>
      </header>

      <div className="md:hidden">
        <AdminMobileMenuCards />
      </div>

      <section
        className="overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-200/80 shadow-card dark:border-stone-800 dark:bg-stone-800 dark:shadow-card-dark"
        aria-label="Podsumowanie"
      >
        <div className="grid grid-cols-2 gap-px md:grid-cols-3 xl:grid-cols-6">
          {stats === undefined ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[7.25rem] animate-pulse bg-white dark:bg-[#2a2015]"
              />
            ))
          ) : (
            <>
              <MetricCell
                href="/admin/uzytkownicy"
                label="Użytkownicy"
                value={formatCount(stats.membersCount)}
                hint="Konta w systemie"
                icon={Users}
              />
              <MetricCell
                label="Dzieci"
                value={formatCount(stats.childrenCount)}
                hint="Profile uczestników"
                icon={Baby}
              />
              <MetricCell
                href="/admin/grafik"
                label="Zajęcia"
                value={formatCount(stats.activeClassesCount)}
                hint="Aktywne grupy"
                icon={CalendarDays}
              />
              <MetricCell
                href="/admin/trenerzy"
                label="Trenerzy"
                value={formatCount(stats.activeCoachesCount)}
                hint="Aktywny zespół"
                icon={UserRound}
              />
              <MetricCell
                href="/admin/wydarzenia"
                label="Obozy"
                value={formatCount(stats.activeCampsCount)}
                hint="W aktualnej ofercie"
                icon={Tent}
              />
              <MetricCell
                href="/admin/wydarzenia"
                label="Wydarzenia"
                value={formatCount(stats.eventsCount)}
                hint={eventsHint}
                hintClassName={
                  (stats.eventsNewThisWeek ?? 0) > 0
                    ? "font-medium text-emerald-700 dark:text-emerald-400"
                    : undefined
                }
                icon={Calendar}
              />
            </>
          )}
        </div>
      </section>

      <div className="grid items-stretch gap-4 lg:grid-cols-12">
        <section className={cn(panel, "lg:col-span-7")}>
          <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-5 py-4 dark:border-stone-800">
            <div>
              <h2 className="text-sm font-semibold text-text-main dark:text-white">
                Dzisiejszy grafik
              </h2>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                {scheduleSummary
                  ? scheduleSummary.sessions === 0
                    ? "Brak zajęć w grafiku"
                    : `${plCount(scheduleSummary.sessions, "zajęcie", "zajęcia", "zajęć")} · ${plCount(
                        scheduleSummary.participants,
                        "uczestnik",
                        "uczestników",
                        "uczestników"
                      )}`
                  : "Ładowanie grafiku"}
              </p>
            </div>
            <SectionLink href="/admin/grafik">Pełny grafik</SectionLink>
          </div>
          <div className="flex flex-1 flex-col px-5 py-2">
            {todaysSchedule === undefined || clock === null ? (
              <div className="space-y-3 py-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-14 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800"
                  />
                ))}
              </div>
            ) : todaysSchedule.length === 0 ? (
              <EmptyNote>Dziś nie ma zajęć w grafiku.</EmptyNote>
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {todaysSchedule.map((item, index) => {
                  const startMin = clockMinutes(item.slot.startTime);
                  const marker =
                    index > 0 &&
                    clockMinutes(todaysSchedule[index - 1]!.slot.endTime) <= clock.minutes &&
                    startMin > clock.minutes;
                  const max = item.maxCapacity;
                  const enrolled = item.enrolledCount;
                  const pct =
                    max != null && max > 0
                      ? Math.min(100, Math.round((enrolled / max) * 100))
                      : null;
                  const over = max != null && enrolled > max;
                  const minutes = durationMinutes(item.slot.startTime, item.slot.endTime);
                  const inProgress =
                    startMin <= clock.minutes &&
                    clockMinutes(item.slot.endTime) > clock.minutes;

                  return (
                    <li key={item.slot._id ?? `${item.class._id}-${item.slot.startTime}`}>
                      {marker ? (
                        <div className="flex items-center gap-3 py-2">
                          <span className="w-12 shrink-0 text-right text-[10px] font-bold uppercase tracking-wide text-primary">
                            Teraz
                          </span>
                          <span className="h-px flex-1 bg-primary/40" />
                        </div>
                      ) : null}
                      <div className="flex gap-4 py-3.5">
                        <div className="w-12 shrink-0 pt-0.5 text-right">
                          <p className="text-xs font-semibold tabular-nums text-text-main dark:text-stone-100">
                            {item.slot.startTime}
                          </p>
                          <p className="text-[11px] tabular-nums text-stone-400">
                            {item.slot.endTime}
                          </p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="flex min-w-0 items-center gap-2">
                              <span className="truncate font-semibold text-text-main dark:text-white">
                                {item.class.name}
                              </span>
                              {inProgress ? (
                                <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                                  Trwa
                                </span>
                              ) : null}
                            </p>
                            <p className="shrink-0 text-xs tabular-nums text-stone-400">
                              {minutes > 0 ? `${minutes} min` : ""}
                            </p>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                            {item.coach?.name ?? "Bez trenera"}
                            {item.location?.name ? ` · ${item.location.name}` : ""}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            {pct != null ? (
                              <div
                                className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"
                                role="meter"
                                aria-valuenow={enrolled}
                                aria-valuemin={0}
                                aria-valuemax={max}
                                aria-label={`Obłożenie: ${enrolled} z ${max}`}
                              >
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    over
                                      ? "bg-red-500"
                                      : pct >= 90
                                        ? "bg-amber-500"
                                        : "bg-primary"
                                  )}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            ) : (
                              <span className="text-xs text-stone-500 dark:text-stone-400">
                                {enrolled.toLocaleString("pl-PL")}{" "}
                                {enrolled === 1 ? "uczestnik" : "uczestników"}
                              </span>
                            )}
                            {pct != null ? (
                              <span className="shrink-0 text-xs tabular-nums text-stone-500 dark:text-stone-400">
                                {enrolled}/{max}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
                {clockMinutes(todaysSchedule[todaysSchedule.length - 1]!.slot.endTime) <=
                clock.minutes ? (
                  <li className="py-3 text-xs text-stone-500 dark:text-stone-400">
                    Grafik na dziś jest już zakończony.
                  </li>
                ) : null}
              </ul>
            )}
          </div>
        </section>

        <section className={cn(panel, "lg:col-span-5")}>
          <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-5 py-4 dark:border-stone-800">
            <div>
              <h2 className="text-sm font-semibold text-text-main dark:text-white">
                Nadchodzące obozy
              </h2>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                Najbliższe terminy w ofercie
              </p>
            </div>
            <SectionLink href="/admin/wydarzenia">Wydarzenia</SectionLink>
          </div>
          <div className="flex flex-1 flex-col px-3 py-2">
            {stats === undefined || now === null ? (
              <div className="space-y-3 px-2 py-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800"
                  />
                ))}
              </div>
            ) : stats.upcomingCamps.length === 0 ? (
              <EmptyNote>Brak obozów z datą startu w przyszłości.</EmptyNote>
            ) : (
              <ul>
                {stats.upcomingCamps.map((camp) => {
                  const start = new Date(camp.startDate);
                  const days = daysUntil(camp.startDate, now);
                  return (
                    <li key={camp.slug}>
                      <Link
                        href={`/admin/rejestracje/oboz/${encodeURIComponent(camp.slug)}`}
                        className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
                      >
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-text-light dark:text-stone-400">
                            {start.toLocaleDateString("pl-PL", { month: "short" }).replace(".", "")}
                          </span>
                          <span className="text-lg font-semibold leading-none tabular-nums text-text-main dark:text-white">
                            {start.getDate()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-text-main dark:text-white">
                            {camp.name}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                            {formatCampRange(camp.startDate, camp.endDate)}
                          </p>
                          <p className="mt-1 text-xs font-medium text-primary">{whenLabel(days)}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-12">
        <section className={cn(panel, "lg:col-span-7")}>
          <div className="flex items-start justify-between gap-3 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-text-main dark:text-white">
                Rejestracje
              </h2>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                {trends
                  ? `${trendTotal.toLocaleString("pl-PL")} w ostatnich 6 miesiącach`
                  : "Ostatnie 6 miesięcy"}
              </p>
            </div>
            {trendTotal > 0 && trendDelta != null && previous && latest ? (
              <p
                className={cn(
                  "text-right text-xs font-medium",
                  trendDelta > 0
                    ? "text-emerald-700 dark:text-emerald-400"
                    : trendDelta < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-stone-500"
                )}
              >
                {trendDelta > 0 ? "+" : trendDelta < 0 ? "−" : ""}
                {trendDelta === 0 ? "Bez zmian" : Math.abs(trendDelta).toLocaleString("pl-PL")}
                <span className="mt-0.5 block font-normal text-stone-400">
                  wobec {previous.label}
                </span>
              </p>
            ) : null}
          </div>
          <div className="h-60 px-2 pb-4 text-stone-400">
            {trends === undefined ? (
              <div className="mx-3 h-full animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
            ) : trendTotal === 0 ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-stone-500 dark:text-stone-400">
                Brak zgłoszeń w ostatnich 6 miesiącach.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="admin-registrations-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "currentColor" }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    width={32}
                    domain={[0, (dataMax: number) => Math.max(dataMax, 1)]}
                    tick={{ fontSize: 12, fill: "currentColor" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<TrendTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.35 }} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#admin-registrations-fill)"
                    activeDot={{ r: 4, fill: "hsl(var(--primary))", stroke: "white", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className={cn(panel, "lg:col-span-5")}>
          <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-5 py-4 dark:border-stone-800">
            <div>
              <h2 className="text-sm font-semibold text-text-main dark:text-white">
                Ostatnie zgłoszenia
              </h2>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                Najnowsze zapisy na obozy
              </p>
            </div>
            <SectionLink href="/admin/rejestracje">Wszystkie</SectionLink>
          </div>
          <div className="flex flex-1 flex-col px-3 py-2">
            {allRegistrations === undefined || now === null ? (
              <div className="space-y-3 px-2 py-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800"
                  />
                ))}
              </div>
            ) : recentRegistrations.length === 0 ? (
              <EmptyNote>Nie ma jeszcze zgłoszeń na obozy.</EmptyNote>
            ) : (
              <ul>
                {recentRegistrations.map((registration) => {
                  const child = `${registration.childName} ${registration.childSurname}`.trim();
                  const status = registrationStatus(registration.status);
                  const href =
                    registration.camp?.slug
                      ? `/admin/rejestracje/oboz/${encodeURIComponent(registration.camp.slug)}`
                      : "/admin/rejestracje";
                  return (
                    <li key={registration._id}>
                      <Link
                        href={href}
                        className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                          {getInitials(child || registration.parentName)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-text-main dark:text-white">
                            {child || registration.parentName}
                          </span>
                          <span className="block truncate text-xs text-stone-500 dark:text-stone-400">
                            {registration.camp?.name ?? "Obóz"}
                            <span className="sm:hidden">
                              {" "}
                              · {formatRegistrationDate(registration._creationTime, now)}
                            </span>
                          </span>
                        </span>
                        <span className="hidden shrink-0 text-xs tabular-nums text-stone-400 sm:block">
                          {formatRegistrationDate(registration._creationTime, now)}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                            status.className
                          )}
                        >
                          {status.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
