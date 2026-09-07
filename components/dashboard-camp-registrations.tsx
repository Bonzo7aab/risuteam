"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type RegWithCamp = Doc<"registrations"> & {
  camp?: {
    name: string;
    slug: string;
    startDate?: number;
    endDate?: number;
  } | null;
};

const DOW_PL = ["NDZ", "PN", "WT", "ŚR", "CZW", "PT", "SOB"] as const;

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

export function DashboardCampRegistrations({
  variant = "compact",
  emptyRowsMessage,
}: {
  variant?: "compact" | "rows";
  /** When `variant` is `rows` and the list is empty (e.g. on /dashboard/zapisy). */
  emptyRowsMessage?: string;
}) {
  const list = useQuery(api.registrations.listMyCampRegistrations, {}) as
    | RegWithCamp[]
    | undefined;

  if (list === undefined) {
    return (
      <p className="text-text-light dark:text-stone-400 text-sm">Ładowanie…</p>
    );
  }

  if (list.length === 0) {
    if (variant === "rows") {
      return (
        <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-600 bg-white/50 dark:bg-stone-900/40 p-8 text-center">
          <p className="text-text-light dark:text-stone-400 text-sm">
            {emptyRowsMessage ?? "Brak nadchodzących obozów."}
          </p>
        </div>
      );
    }
    return (
      <p className="text-text-light dark:text-stone-400 text-sm mb-4">
        Brak nadchodzących obozów.
      </p>
    );
  }

  if (variant === "rows") {
    return (
      <ul className="space-y-3">
        {list.map((reg) => {
          const atMs = reg.camp?.startDate ?? reg._creationTime;
          const d = new Date(atMs);
          const dow = DOW_PL[d.getDay()] ?? "??";
          const dayNum = d.getDate();
          const statusLabel = reg.status === "new" ? "Nowa" : reg.status ?? "—";
          const dateRange = reg.camp?.startDate
            ? formatRangePl(reg.camp.startDate, reg.camp.endDate)
            : undefined;
          const campSlug = reg.camp?.slug?.trim();
          const campHref = campSlug ? `/obozy/${encodeURIComponent(campSlug)}` : null;

          const rowInner = (
            <>
              <div
                className={cn(
                  "w-14 shrink-0 rounded-xl flex flex-col items-center justify-center py-2 text-center font-bold",
                  "bg-primary text-primary-foreground"
                )}
              >
                <span className="text-[10px] uppercase opacity-90 leading-tight">
                  {dow}
                </span>
                <span className="text-xl leading-none">{dayNum}</span>
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <p className="font-bold text-text-main dark:text-white truncate">
                  {reg.camp?.name ?? "Obóz"}
                </p>
                <p className="text-sm text-text-light dark:text-stone-400 truncate">
                  {reg.childName} {reg.childSurname}
                </p>
              </div>
              <div className="hidden sm:flex flex-col items-end justify-center gap-1 shrink-0">
                {dateRange && (
                  <span className="text-sm text-text-light dark:text-stone-400">
                    {dateRange}
                  </span>
                )}
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                  {statusLabel}
                </span>
              </div>
              <div className="sm:hidden flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
                  {statusLabel}
                </span>
              </div>
            </>
          );

          return (
            <li key={reg._id}>
              {campHref ? (
                <Link
                  href={campHref}
                  className="flex gap-4 items-stretch rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-4 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
                >
                  {rowInner}
                </Link>
              ) : (
                <div className="flex gap-4 items-stretch rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-4 shadow-sm">
                  {rowInner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="space-y-3 mb-4">
      {list.map((reg) => (
        <li
          key={reg._id}
          className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
        >
          <span className="font-medium text-text-main dark:text-white">
            {reg.childName} {reg.childSurname}
            {reg.camp && (
              <span className="text-text-light dark:text-stone-400 font-normal ml-1">
                — {reg.camp.name}
              </span>
            )}
          </span>
          <span className="text-xs text-text-light dark:text-stone-500">
            {reg.status === "new" ? "Nowa" : reg.status ?? "—"}
          </span>
        </li>
      ))}
    </ul>
  );
}
