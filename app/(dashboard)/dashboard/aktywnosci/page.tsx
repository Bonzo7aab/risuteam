"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { cn } from "@/lib/utils";

type TabId = "nadchodzace" | "do_zaplaty" | "przeszle";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "nadchodzace", label: "Nadchodzące", icon: "event_upcoming" },
  { id: "do_zaplaty", label: "Do zapłaty", icon: "payments" },
  { id: "przeszle", label: "Przeszłe", icon: "history" },
];

const BANK_ACCOUNT = "28 1090 1694 0000 0001 3471 6556";
const BANK_NAME = "Santander Bank Polska";

function statusLabel(status: string): string {
  switch (status) {
    case "pending_payment":
      return "Oczekuje na płatność";
    case "active":
      return "Aktywny";
    case "cancelled":
      return "Anulowany";
    case "ended":
      return "Zakończony";
    default:
      return status;
  }
}

function statusTone(status: string): string {
  switch (status) {
    case "pending_payment":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200";
    case "active":
      return "bg-primary/15 text-primary";
    default:
      return "bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-300";
  }
}

function CopyAccountButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          // ignore
        }
      }}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
    >
      <span className="material-symbols-outlined text-[16px]" aria-hidden>
        {copied ? "check" : "content_copy"}
      </span>
      {copied ? "Skopiowano" : "Kopiuj"}
    </button>
  );
}

function ListSkeleton() {
  return (
    <ul className="space-y-3" aria-busy="true" aria-label="Ładowanie">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="h-[5.25rem] animate-pulse rounded-2xl bg-stone-200/70 dark:bg-stone-800"
        />
      ))}
    </ul>
  );
}

/**
 * True if enrollment window covered at least one scheduled class day
 * (proxy for "attended at least once" — we do not store check-ins).
 */
function hadScheduledClassDuringEnrollment(
  startMs: number,
  endMs: number,
  dayOfWeeks: number[]
): boolean {
  if (!Number.isFinite(startMs) || endMs < startMs) return false;
  if (dayOfWeeks.length === 0) {
    // No timetable: require at least one full day as a weak signal
    return endMs - startMs >= 24 * 60 * 60 * 1000;
  }
  const dowSet = new Set(dayOfWeeks);
  const cursor = new Date(startMs);
  cursor.setHours(0, 0, 0, 0);
  const endDay = new Date(endMs);
  endDay.setHours(23, 59, 59, 999);
  let guard = 0;
  while (cursor.getTime() <= endDay.getTime() && guard < 180) {
    if (dowSet.has(cursor.getDay())) return true;
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }
  return false;
}

function AktywnosciPageInner() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabId>("nadchodzace");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "do_zaplaty" || t === "przeszle" || t === "nadchodzace") {
      setTab(t);
    }
  }, [searchParams]);

  const subscriptions = useQuery(api.subscriptions.listMySubscriptions, {});
  const classBilling = useQuery(api.payments.listMyClassBilling, {});
  const classes = useQuery(api.classes.getClasses, { activeOnly: false });
  const schedule = useQuery(api.classes.getSchedule, {});
  const children = useQuery(api.children.listMyChildren, {});
  const cancelEnrollment = useMutation(api.subscriptions.cancelEnrollment);

  const classMap = useMemo(() => {
    if (!classes)
      return new Map<Id<"classes">, { name: string; discipline: string }>();
    return new Map(
      classes.map((c) => [c._id, { name: c.name, discipline: c.discipline }])
    );
  }, [classes]);

  const childMap = useMemo(() => {
    if (!children) return new Map<Id<"children">, string>();
    return new Map(
      children.map((ch) => [ch._id, `${ch.firstName} ${ch.lastName}`])
    );
  }, [children]);

  const slotDaysByClassId = useMemo(() => {
    const map = new Map<string, number[]>();
    if (!schedule) return map;
    for (const slot of schedule) {
      const key = String(slot.classId);
      const list = map.get(key) ?? [];
      if (!list.includes(slot.dayOfWeek)) list.push(slot.dayOfWeek);
      map.set(key, list);
    }
    return map;
  }, [schedule]);

  const dueBillingItems = useMemo(() => {
    if (!classBilling) return [];
    return classBilling.flatMap((row) =>
      row.dueMonths.map((m) => ({
        key: `${row.subscriptionId}-${m.year}-${m.month}`,
        subscriptionId: row.subscriptionId,
        className: row.className,
        discipline: row.discipline,
        childName: row.childName,
        periodLabel: m.label,
        dueGrosze: m.dueGrosze,
        paymentStatus: m.paymentStatus,
      }))
    );
  }, [classBilling]);

  const byTab = useMemo(() => {
    if (!subscriptions) {
      return { nadchodzace: [], do_zaplaty: [], przeszle: [] };
    }
    const dueSubIds = new Set(
      (classBilling ?? [])
        .filter((b) => b.dueMonths.length > 0)
        .map((b) => b.subscriptionId)
    );
    const paidSubIds = new Set(
      (classBilling ?? [])
        .filter((b) => b.months.some((m) => m.paymentStatus === "paid"))
        .map((b) => b.subscriptionId)
    );
    return {
      nadchodzace: subscriptions.filter((s) => s.status === "active"),
      do_zaplaty: subscriptions.filter(
        (s) => s.status === "pending_payment" || dueSubIds.has(s._id)
      ),
      // Past: ended/cancelled enrollments where the child had at least one
      // scheduled class day in the enrollment window (or a paid month).
      // Excludes abandoned unpaid holds that never reached a class day.
      przeszle: subscriptions.filter((s) => {
        if (s.status !== "cancelled" && s.status !== "ended") return false;
        const endMs = s.endDate ?? Date.now();
        const days = slotDaysByClassId.get(String(s.classId)) ?? [];
        if (
          hadScheduledClassDuringEnrollment(s.startDate, endMs, days)
        ) {
          return true;
        }
        return paidSubIds.has(s._id);
      }),
    };
  }, [subscriptions, classBilling, slotDaysByClassId]);

  const list = byTab[tab];
  const pendingCount = dueBillingItems.length;
  const activeCount = byTab.nadchodzace.length;
  const pendingTotalGrosze = dueBillingItems.reduce(
    (sum, i) => sum + i.dueGrosze,
    0
  );
  const canCancel = (status: string) =>
    status === "pending_payment" || status === "active";

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 max-w-2xl sm:mb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          Panel rodzica
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-text-main dark:text-white md:text-4xl">
          Aktywności i płatności
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400 sm:text-base">
          Podgląd zapisów na zajęcia oraz dane do przelewu.
        </p>
      </header>

      <section className="mb-8 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark">
        <div className="border-b border-stone-100 px-5 py-5 dark:border-stone-800 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                Rozliczenia
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-text-main dark:text-white">
                Stan płatności
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-stone-500 dark:text-stone-400">
                Płatności przyjmujemy wyłącznie przelewem. W tytule podaj imię i
                nazwisko dziecka oraz miesiąc rozliczenia.
              </p>
            </div>
            <div className="rounded-xl bg-stone-50 px-4 py-3 text-right dark:bg-stone-950/40">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
                Do zapłaty
              </p>
              <p className="mt-0.5 text-2xl font-black tabular-nums text-primary">
                {(pendingTotalGrosze / 100).toFixed(0)} zł
              </p>
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                {pendingCount === 1
                  ? "1 miesiąc"
                  : `${pendingCount} miesięcy`}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <span className="material-symbols-outlined text-[16px]" aria-hidden>
                check_circle
              </span>
              Aktywne: {activeCount}
            </span>
            {pendingCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                <span className="material-symbols-outlined text-[16px]" aria-hidden>
                  schedule
                </span>
                Oczekujące: {pendingCount}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/40">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
              Bank
            </p>
            <p className="mt-1 text-sm font-semibold text-text-main dark:text-stone-100">
              {BANK_NAME}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/40">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
                Numer konta
              </p>
              <CopyAccountButton value={BANK_ACCOUNT} />
            </div>
            <p className="font-mono text-sm font-semibold tracking-tight text-text-main dark:text-stone-100">
              {BANK_ACCOUNT}
            </p>
          </div>
        </div>

        <div className="border-t border-stone-100 px-5 py-4 dark:border-stone-800 sm:px-6">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Pełne dane do przelewu i cennik abonamentu:{" "}
            <Link
              href="/cennik"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Cennik
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-text-main dark:text-white">
            Moje zapisy
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Filtruj według statusu rozliczenia.
          </p>
        </div>
        <Link
          href="/dashboard/zapisy"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-[#2a2015] dark:text-stone-200 dark:hover:bg-stone-900"
        >
          Zapisy
          <ArrowRightIcon className="text-[1em]" />
        </Link>
      </div>

      <div
        className="mb-6 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Status zapisów"
      >
        <div className="inline-flex min-w-full gap-1 rounded-2xl border border-stone-200/80 bg-white/90 p-1.5 shadow-card dark:border-stone-800 dark:bg-[#2a2015]/90 dark:shadow-card-dark sm:min-w-0">
          {TABS.map((t) => {
            const selected = tab === t.id;
            const count =
              t.id === "do_zaplaty" ? pendingCount : byTab[t.id].length;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors sm:px-4",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-stone-600 hover:bg-stone-100 hover:text-text-main dark:text-stone-300 dark:hover:bg-stone-800/70 dark:hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-[18px]",
                    selected ? "text-primary-foreground" : "text-primary"
                  )}
                  aria-hidden
                >
                  {t.icon}
                </span>
                {t.label}
                {subscriptions !== undefined ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                      selected
                        ? "bg-white/20 text-primary-foreground"
                        : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {subscriptions === undefined ? (
        <ListSkeleton />
      ) : subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-stone-200/80 bg-white px-6 py-14 text-center shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl" aria-hidden>
              fitness_center
            </span>
          </span>
          <h3 className="mt-5 text-xl font-black tracking-tight text-text-main dark:text-white">
            Brak zapisów na zajęcia
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            Zapisz dziecko na grupę, aby śledzić aktywności i status płatności.
          </p>
          <Link
            href="/dashboard/zapisy"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          >
            Przejdź do zapisów
            <ArrowRightIcon className="text-[1em]" />
          </Link>
        </div>
      ) : tab === "do_zaplaty" ? (
        dueBillingItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-12 text-center dark:border-stone-600">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Brak zaległych miesięcy do opłacenia.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {dueBillingItems.map((item) => (
              <li
                key={item.key}
                className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3.5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                    <span className="material-symbols-outlined text-[22px]" aria-hidden>
                      calendar_month
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold tracking-tight text-text-main dark:text-white">
                      {item.className}
                    </p>
                    <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                      {[item.discipline, item.childName]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                        {item.periodLabel}
                      </span>
                      <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                        {(item.dueGrosze / 100).toFixed(0)} zł
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                      W tytule przelewu podaj: {item.childName}, {item.periodLabel}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-12 text-center dark:border-stone-600">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Brak zapisów w tej kategorii.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((s) => {
            const cls = classMap.get(s.classId);
            const childName = s.childId
              ? (childMap.get(s.childId) ?? "—")
              : "—";
            const billing = classBilling?.find(
              (b) => b.subscriptionId === s._id
            );
            return (
              <li
                key={s._id}
                className="flex flex-col gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="flex min-w-0 items-start gap-3.5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[22px]" aria-hidden>
                      {s.status === "pending_payment"
                        ? "payments"
                        : s.status === "active"
                          ? "fitness_center"
                          : "history"}
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold tracking-tight text-text-main dark:text-white">
                      {cls?.name ?? "Zajęcia"}
                    </p>
                    <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                      {[cls?.discipline, childName].filter(Boolean).join(" · ")}
                    </p>
                    <span
                      className={cn(
                        "mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                        statusTone(s.status)
                      )}
                    >
                      {statusLabel(s.status)}
                    </span>
                    {billing && billing.months.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {billing.months.map((m) => (
                          <span
                            key={`${s._id}-${m.year}-${m.month}`}
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              m.dueGrosze > 0
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                            )}
                          >
                            {m.label}
                            {m.dueGrosze > 0 ? " · brak" : " · OK"}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {canCancel(s.status) ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-fit shrink-0 rounded-xl font-semibold"
                    onClick={() =>
                      cancelEnrollment({ subscriptionId: s._id })
                    }
                  >
                    Wypisz
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function AktywnosciPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 h-24 animate-pulse rounded-2xl bg-stone-200/70 dark:bg-stone-800" />
          <ListSkeleton />
        </div>
      }
    >
      <AktywnosciPageInner />
    </Suspense>
  );
}
