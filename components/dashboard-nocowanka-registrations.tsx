"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { getNocowankaDisplayName } from "@/lib/nocowanki";

const DOW_PL = ["NDZ", "PN", "WT", "ŚR", "CZW", "PT", "SOB"] as const;

function WithdrawButton({
  registrationId,
  childLabel,
  eventLabel,
}: {
  registrationId: Id<"nocowankaRegistrations">;
  childLabel: string;
  eventLabel: string;
}) {
  const cancel = useMutation(api.registrations.cancelNocowankaRegistration);
  const [pending, setPending] = useState(false);

  const onWithdraw = async () => {
    const ok = window.confirm(
      `Wypisać ${childLabel} z „${eventLabel}”?`
    );
    if (!ok) return;
    setPending(true);
    try {
      await cancel({ registrationId });
      toast.success("Wypisano z nocowanki.");
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
      <ul className="space-y-3" aria-busy="true" aria-label="Ładowanie zapisów">
        {Array.from({ length: 2 }).map((_, i) => (
          <li
            key={i}
            className="h-[4.5rem] animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800/80"
          />
        ))}
      </ul>
    );
  }

  if (list.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-stone-500 dark:text-stone-400">
        {emptyRowsMessage ?? "Brak zapisów na nocowanki."}
      </p>
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
        const childLabel = `${reg.childName} ${reg.childSurname}`.trim();

        return (
          <li key={reg._id}>
            <div className="flex gap-3 items-stretch rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-4 shadow-xs">
              <Link
                href={href}
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
                    {title}
                  </p>
                  <p className="text-sm text-text-light dark:text-stone-400 truncate">
                    {childLabel}
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-end justify-center gap-1 shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                    {statusLabel}
                  </span>
                </div>
              </Link>
              <div className="flex items-center">
                <WithdrawButton
                  registrationId={reg._id}
                  childLabel={childLabel}
                  eventLabel={title}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
