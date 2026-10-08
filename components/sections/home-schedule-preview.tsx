"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowRightIcon } from "@/components/icons/arrow-right";

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

const DAY_SHORT = ["Nd", "Pn", "Wt", "Śr", "Czw", "Pt", "Sb"] as const;
const DAY_LONG = [
  "Niedziela",
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
] as const;

export function HomeSchedulePreview() {
  const slots = useQuery(api.classes.getSchedule, {});

  if (slots === undefined) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 h-10 w-56 animate-pulse rounded-xl bg-stone-200/80 dark:bg-stone-800" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-2xl bg-stone-200/70 dark:bg-stone-800"
            />
          ))}
        </div>
      </section>
    );
  }

  const byDay = new Map<number, typeof slots>();
  for (const slot of slots) {
    if (!slot.class) continue;
    const list = byDay.get(slot.dayOfWeek) ?? [];
    list.push(slot);
    byDay.set(slot.dayOfWeek, list);
  }

  const rows = WEEKDAY_ORDER.flatMap((day) => {
    const list = byDay.get(day);
    if (!list || list.length === 0) return [];
    const sorted = [...list].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const primary = sorted[0];
    if (!primary) return [];
    return [{ day, primary, extra: sorted.length - 1 }];
  });

  if (rows.length === 0) return null;

  return (
    <section
      id="grafik-tygodnia"
      className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Grafik
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-text-main dark:text-white md:text-4xl">
            Zajęcia w tym tygodniu
          </h2>
        </div>
        <Link
          href="/grafik"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-hover"
        >
          Pełny grafik
          <ArrowRightIcon className="text-[1em]" />
        </Link>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark">
        {rows.map(({ day, primary, extra }) => {
          const age = primary.class?.ageGroup?.trim();
          const details = [
            age,
            primary.coach?.name,
            primary.location?.name,
          ].filter(Boolean);
          return (
            <li
              key={`${day}-${primary._id}`}
              className="border-b border-stone-100 last:border-0 dark:border-stone-800"
            >
              <Link
                href="/grafik"
                className="grid grid-cols-[4.75rem_1fr] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-stone-50 sm:grid-cols-[8.5rem_1fr_auto] sm:px-5 dark:hover:bg-stone-800/40"
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                    {DAY_SHORT[day]}
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-text-main dark:text-white">
                    {primary.startTime}
                    <span className="font-normal text-stone-400">–{primary.endTime}</span>
                  </p>
                  <p className="sr-only">{DAY_LONG[day]}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-text-main dark:text-white">
                    {primary.class?.name}
                  </p>
                  {details.length > 0 ? (
                    <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                      {details.join(" · ")}
                    </p>
                  ) : null}
                </div>
                {extra > 0 ? (
                  <span className="hidden text-xs font-semibold tabular-nums text-stone-400 sm:inline">
                    +{extra}
                  </span>
                ) : (
                  <span className="hidden sm:inline" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
