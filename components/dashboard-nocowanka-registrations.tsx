"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { getNocowankaDisplayName } from "@/lib/nocowanki";

const DOW_PL = ["NDZ", "PN", "WT", "ŚR", "CZW", "PT", "SOB"] as const;

export function DashboardNocowankaRegistrations({
  emptyRowsMessage,
}: {
  emptyRowsMessage?: string;
}) {
  const list = useQuery(api.registrations.listMyNocowankaRegistrations, {}) as
    | Doc<"nocowankaRegistrations">[]
    | undefined;

  if (list === undefined) {
    return (
      <p className="text-text-light dark:text-stone-400 text-sm">Ładowanie…</p>
    );
  }

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-600 bg-white/50 dark:bg-stone-900/40 p-8 text-center">
        <p className="text-text-light dark:text-stone-400 text-sm">
          {emptyRowsMessage ?? "Brak zapisów na nocowanki."}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {list.map((reg) => {
        const atMs = reg._creationTime;
        const d = new Date(atMs);
        const dow = DOW_PL[d.getDay()] ?? "??";
        const dayNum = d.getDate();
        const statusLabel = reg.status === "new" ? "Nowa" : reg.status ?? "—";
        const title = getNocowankaDisplayName(reg.slug);
        const href = `/obozy/nocowanki/${encodeURIComponent(reg.slug)}`;

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
              <p className="font-bold text-text-main dark:text-white truncate">{title}</p>
              <p className="text-sm text-text-light dark:text-stone-400 truncate">
                {reg.childName} {reg.childSurname}
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end justify-center gap-1 shrink-0">
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
            <Link
              href={href}
              className="flex gap-4 items-stretch rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-4 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
            >
              {rowInner}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
