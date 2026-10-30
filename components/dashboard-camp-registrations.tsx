"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
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

function WithdrawButton({
  registrationId,
  childLabel,
  eventLabel,
}: {
  registrationId: Id<"registrations">;
  childLabel: string;
  eventLabel: string;
}) {
  const cancel = useMutation(api.registrations.cancelCampRegistration);
  const [pending, setPending] = useState(false);

  const onWithdraw = async () => {
    const ok = window.confirm(
      `Wypisać ${childLabel} z „${eventLabel}”?`
    );
    if (!ok) return;
    setPending(true);
    try {
      await cancel({ registrationId });
      toast.success("Wypisano z obozu.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nie udało się wypisać."
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onWithdraw}
      disabled={pending}
      className="shrink-0 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-60 dark:border-stone-700 dark:text-stone-300 dark:hover:border-red-800 dark:hover:bg-red-950/40 dark:hover:text-red-300"
    >
      {pending ? "…" : "Wypisz"}
    </button>
  );
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
      <ul className="space-y-3" aria-busy="true" aria-label="Ładowanie zapisów">
        {Array.from({ length: variant === "rows" ? 2 : 1 }).map((_, i) => (
          <li
            key={i}
            className="h-[4.5rem] animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800/80"
          />
        ))}
      </ul>
    );
  }

  if (list.length === 0) {
    if (variant === "rows") {
      return (
        <p className="py-4 text-center text-sm text-stone-500 dark:text-stone-400">
          {emptyRowsMessage ?? "Brak nadchodzących obozów."}
        </p>
      );
    }
    return (
      <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
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
          const campHref = campSlug
            ? `/obozy/${encodeURIComponent(campSlug)}`
            : null;
          const childLabel = `${reg.childName} ${reg.childSurname}`.trim();
          const eventLabel = reg.camp?.name ?? "obóz";

          return (
            <li key={reg._id}>
              <div className="flex gap-3 items-stretch rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-4 shadow-xs">
                {campHref ? (
                  <Link
                    href={campHref}
                    className="flex min-w-0 flex-1 gap-4 items-stretch hover:opacity-90 transition-opacity"
                  >
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
                        {eventLabel}
                      </p>
                      <p className="text-sm text-text-light dark:text-stone-400 truncate">
                        {childLabel}
                      </p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end justify-center gap-1 shrink-0">
                      {dateRange ? (
                        <span className="text-sm text-text-light dark:text-stone-400">
                          {dateRange}
                        </span>
                      ) : null}
                      <span className="text-[11px] font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                        {statusLabel}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="flex min-w-0 flex-1 gap-4 items-stretch">
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
                        {eventLabel}
                      </p>
                      <p className="text-sm text-text-light dark:text-stone-400 truncate">
                        {childLabel}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <WithdrawButton
                    registrationId={reg._id}
                    childLabel={childLabel}
                    eventLabel={eventLabel}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="space-y-3 mb-4">
      {list.map((reg) => {
        const childLabel = `${reg.childName} ${reg.childSurname}`.trim();
        const eventLabel = reg.camp?.name ?? "obóz";
        return (
          <li
            key={reg._id}
            className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
          >
            <span className="font-medium text-text-main dark:text-white">
              {childLabel}
              {reg.camp ? (
                <span className="text-text-light dark:text-stone-400 font-normal ml-1">
                  — {reg.camp.name}
                </span>
              ) : null}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-light dark:text-stone-500">
                {reg.status === "new" ? "Nowa" : reg.status ?? "—"}
              </span>
              <WithdrawButton
                registrationId={reg._id}
                childLabel={childLabel}
                eventLabel={eventLabel}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
