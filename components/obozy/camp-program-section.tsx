"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type ProgramSlot = {
  time: string;
  title: string;
  description: string;
};

export type ProgramDay = {
  dayLabel: string;
  slots: ProgramSlot[];
};

export type CampProgramSectionProps = {
  days: ProgramDay[];
  pdfHref?: string;
};

export function CampProgramSection({ days, pdfHref }: CampProgramSectionProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const daysWithSlots = days.filter((d) => d.slots.length > 0);
  const activeDay = daysWithSlots[activeDayIndex];
  const slots = activeDay?.slots ?? [];

  if (daysWithSlots.length === 0) return null;

  const showPdf = Boolean(pdfHref && pdfHref !== "#");

  return (
    <section
      id="program"
      className="border-t border-stone-200 bg-white py-12 dark:border-stone-700 dark:bg-stone-900/50 md:py-16"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white md:text-3xl">
            Program Obozu
          </h2>
          {showPdf ? (
            <a
              href={pdfHref}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary risu-underline"
            >
              Pobierz PDF
              <span className="material-symbols-outlined text-lg">download</span>
            </a>
          ) : null}
        </div>

        {daysWithSlots.length > 1 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {daysWithSlots.map((day, i) => (
              <button
                key={day.dayLabel}
                type="button"
                onClick={() => setActiveDayIndex(i)}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                  i === activeDayIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700",
                )}
              >
                {day.dayLabel}
              </button>
            ))}
          </div>
        )}

        <ol className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900/80">
          {slots.map((slot, i) => (
            <li
              key={`${slot.time}-${slot.title}-${i}`}
              className="flex gap-4 border-b border-stone-200 px-4 py-3.5 last:border-b-0 dark:border-stone-700 sm:gap-5 sm:px-5"
            >
              <time className="w-[4.25rem] shrink-0 pt-0.5 font-mono text-sm font-semibold tabular-nums text-primary">
                {slot.time}
              </time>
              <div className="min-w-0">
                <h3 className="font-semibold leading-snug text-stone-900 dark:text-white">
                  {slot.title}
                </h3>
                {slot.description ? (
                  <p className="mt-0.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                    {slot.description}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
