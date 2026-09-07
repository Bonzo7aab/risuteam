"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabId = "nadchodzace" | "do_zaplaty" | "przeszle";

const TABS: { id: TabId; label: string }[] = [
  { id: "nadchodzace", label: "Nadchodzące" },
  { id: "do_zaplaty", label: "Do zapłaty" },
  { id: "przeszle", label: "Przeszłe" },
];

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
  const classes = useQuery(api.classes.getClasses, { activeOnly: false });
  const children = useQuery(api.children.listMyChildren, {});
  const cancelEnrollment = useMutation(api.subscriptions.cancelEnrollment);

  const classMap = useMemo(() => {
    if (!classes) return new Map<Id<"classes">, { name: string; discipline: string }>();
    return new Map(classes.map((c) => [c._id, { name: c.name, discipline: c.discipline }]));
  }, [classes]);

  const childMap = useMemo(() => {
    if (!children) return new Map<Id<"children">, string>();
    return new Map(
      children.map((ch) => [ch._id, `${ch.firstName} ${ch.lastName}`])
    );
  }, [children]);

  const byTab = useMemo(() => {
    if (!subscriptions) return { nadchodzace: [], do_zaplaty: [], przeszle: [] };
    const nadchodzace = subscriptions.filter((s) => s.status === "active");
    const do_zaplaty = subscriptions.filter((s) => s.status === "pending_payment");
    const przeszle = subscriptions.filter(
      (s) => s.status === "cancelled" || s.status === "ended"
    );
    return { nadchodzace, do_zaplaty, przeszle };
  }, [subscriptions]);

  const list = byTab[tab];
  const canCancel = (s: { status: string }) =>
    s.status === "pending_payment" || s.status === "active";

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-text-main dark:text-white mb-6">
        Aktywności i płatności
      </h1>

      <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-main dark:text-white">
            Aktualny stan płatności
          </h2>
          <span className="text-2xl font-black text-primary">0 PLN</span>
        </div>
        <p className="text-sm text-text-light dark:text-stone-400 mb-3">
          Płatności realizujemy wyłącznie przelewem bankowym. W tytule przelewu podaj: imię i nazwisko uczestnika oraz miesiąc/okres rozliczenia.
        </p>
        <p className="text-sm font-medium text-text-main dark:text-white">
          Santander Bank: 28 1090 1694 0000 0001 3471 6556
        </p>
        <p className="text-xs text-text-light dark:text-stone-500 mt-2">
          Dane do przelewu możesz też znaleźć na stronie{" "}
          <Link href="/cennik" className="text-primary font-medium risu-underline">
            Cennik
          </Link>
          .
        </p>
      </div>

      <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
        Moje zapisy na zajęcia
      </h2>
      <div className="flex gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-xl font-bold text-sm transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-stone-100 dark:bg-stone-800 text-text-main dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subscriptions === undefined ? (
        <p className="text-text-light dark:text-stone-400">Ładowanie…</p>
      ) : subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-stone-400 mb-4 block">
            fitness_center
          </span>
          <p className="text-text-light dark:text-stone-400 mb-6">
            Brak zapisów na zajęcia. Zapisz dziecko, aby zobaczyć aktywności.
          </p>
          <Link
            href="/dashboard/zapisy"
            className="inline-flex items-center gap-2 rounded-xl h-12 px-8 bg-primary text-primary-foreground font-bold hover:bg-primary-hover"
          >
            Zapisz się na zajęcia
          </Link>
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-8 text-center">
          <p className="text-text-light dark:text-stone-400">
            Brak zapisów w tej kategorii.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 overflow-hidden">
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {list.map((s) => {
              const cls = classMap.get(s.classId);
              const childName = s.childId
                ? childMap.get(s.childId) ?? "—"
                : "—";
              return (
                <li
                  key={s._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="font-bold text-text-main dark:text-white">
                      {cls?.name ?? "Zajęcia"}
                    </p>
                    <p className="text-sm text-text-light dark:text-stone-400">
                      {cls?.discipline ?? ""} · {childName}
                    </p>
                    <span
                      className={cn(
                        "inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full",
                        s.status === "active" &&
                          "bg-primary/20 text-primary",
                        s.status === "pending_payment" &&
                          "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
                        (s.status === "cancelled" || s.status === "ended") &&
                          "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400"
                      )}
                    >
                      {statusLabel(s.status)}
                    </span>
                  </div>
                  {canCancel(s) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() =>
                        cancelEnrollment({ subscriptionId: s._id })
                      }
                    >
                      Wypisz
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

    </div>
  );
}

export default function AktywnosciPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl">
          <p className="text-text-light dark:text-stone-400">Ładowanie…</p>
        </div>
      }
    >
      <AktywnosciPageInner />
    </Suspense>
  );
}
