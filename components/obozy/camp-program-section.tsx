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

const CARD_STYLES: { bg: string; icon: string }[] = [
  { bg: "bg-primary text-primary-foreground", icon: "directions_bus" },
  { bg: "bg-emerald-500 text-white", icon: "park" },
  { bg: "bg-blue-500 text-white", icon: "local_fire_department" },
  { bg: "bg-amber-500 text-white", icon: "dark_mode" },
  { bg: "bg-violet-500 text-white", icon: "star" },
];

function ActivityCard({
  slot,
  style,
}: {
  slot: ProgramSlot;
  style: { bg: string; icon: string };
}) {
  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-4 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            "mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
            style.bg
          )}
          aria-hidden
        >
          <span className="material-symbols-outlined text-2xl">{style.icon}</span>
        </div>
        <div className="mb-1 text-sm font-medium text-stone-500 dark:text-stone-400">
          {slot.time}
        </div>
        <h3 className="mb-1 font-bold text-stone-900 dark:text-white">{slot.title}</h3>
        {slot.description ? (
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {slot.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function CampProgramSection({ days, pdfHref = "#" }: CampProgramSectionProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const daysWithSlots = days.filter((d) => d.slots.length > 0);
  const activeDay = daysWithSlots[activeDayIndex];
  const slots = activeDay?.slots ?? [];

  if (daysWithSlots.length === 0) return null;

  return (
    <section id="program" className="py-12 md:py-16 bg-white dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white">
            Program Obozu
          </h2>
          <a
            href={pdfHref}
            className="text-sm font-medium text-primary risu-underline inline-flex items-center gap-1"
          >
            Pobierz PDF
            <span className="material-symbols-outlined text-lg">download</span>
          </a>
        </div>

        {daysWithSlots.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {daysWithSlots.map((day, i) => (
              <button
                key={day.dayLabel}
                type="button"
                onClick={() => setActiveDayIndex(i)}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-bold transition-colors",
                  i === activeDayIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                )}
              >
                {day.dayLabel}
              </button>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {slots.map((slot, i) => (
            <ActivityCard
              key={`${slot.time}-${slot.title}-${i}`}
              slot={slot}
              style={CARD_STYLES[i % CARD_STYLES.length] ?? CARD_STYLES[0]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
