"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@/components/icons/arrow-right";

type Step = {
  step: number;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: string;
};

function subscriptionStatusLabel(status: string): string {
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

export function ZapisyContent({ steps }: { steps: Step[] }) {
  const currentUser = useQuery(api.authHelpers.getCurrentUser);
  const classes = useQuery(api.classes.getClasses, { activeOnly: true });
  const allClasses = useQuery(
    api.classes.getClasses,
    currentUser ? { activeOnly: false } : "skip"
  );
  const myChildren = useQuery(
    api.children.listMyChildren,
    currentUser ? {} : "skip"
  );
  const subscriptions = useQuery(
    api.subscriptions.listMySubscriptions,
    currentUser ? {} : "skip"
  );
  const cancelEnrollment = useMutation(api.subscriptions.cancelEnrollment);

  const isLoggedIn = currentUser !== undefined && currentUser !== null;
  const hasChildren = (myChildren?.length ?? 0) > 0;

  const classMap = useMemo(() => {
    if (!allClasses) return new Map<Id<"classes">, { name: string; discipline: string }>();
    return new Map(allClasses.map((c) => [c._id, { name: c.name, discipline: c.discipline }]));
  }, [allClasses]);

  const childMap = useMemo(() => {
    if (!myChildren) return new Map<Id<"children">, string>();
    return new Map(
      myChildren.map((ch) => [ch._id, `${ch.firstName} ${ch.lastName}`])
    );
  }, [myChildren]);

  const activeSubscriptions = useMemo(() => {
    if (!subscriptions) return [];
    return subscriptions.filter(
      (s) => s.status === "pending_payment" || s.status === "active"
    );
  }, [subscriptions]);

  if (currentUser === undefined) {
    return (
      <p className="text-text-light dark:text-stone-400 text-center py-8">
        Ładowanie…
      </p>
    );
  }

  if (isLoggedIn && hasChildren && (classes?.length ?? 0) > 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 shadow-soft">
          <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
            Twoje zapisy na zajęcia
          </h2>
          {subscriptions === undefined ? (
            <p className="text-text-light dark:text-stone-400 text-sm">Ładowanie…</p>
          ) : activeSubscriptions.length === 0 ? (
            <p className="text-text-light dark:text-stone-400 text-sm">
              Brak zapisów na zajęcia. Zapisz dziecko poniżej.
            </p>
          ) : (
            <ul className="space-y-3 mb-6">
              {activeSubscriptions.map((s) => {
                const cls = classMap.get(s.classId);
                const childName = s.childId
                  ? childMap.get(s.childId) ?? "—"
                  : "—";
                return (
                  <li
                    key={s._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-text-main dark:text-white">
                        {cls?.name ?? "Zajęcia"} · {childName}
                      </p>
                      <span
                        className={cn(
                          "inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
                          s.status === "active" && "bg-primary/20 text-primary",
                          s.status === "pending_payment" &&
                            "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        )}
                      >
                        {subscriptionStatusLabel(s.status)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 w-fit"
                      onClick={() => cancelEnrollment({ subscriptionId: s._id })}
                    >
                      Wypisz
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }

  if (isLoggedIn && !hasChildren) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-primary/30 bg-orange-50/50 dark:bg-orange-900/20 border-stone-200 dark:border-stone-700 p-6">
          <p className="text-text-main dark:text-stone-200 mb-4">
            Dodaj dziecko w panelu, aby móc zapisać je na zajęcia.
          </p>
          <Link
            href="/dashboard/dzieci"
            className="inline-flex items-center gap-2 rounded-xl h-11 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary-hover"
          >
            Moje dzieci
          </Link>
        </div>
        <div className="space-y-6">
          {steps.map((s) => (
            <Link
              key={s.step}
              href={s.href}
              className="block rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 shadow-soft hover:shadow-glow hover:border-primary/50 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-2xl">
                    {s.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Krok {s.step}
                  </span>
                  <h2 className="text-xl font-bold text-text-main dark:text-white mt-1">
                    {s.title}
                  </h2>
                  <p className="text-text-light dark:text-stone-400 mt-2 text-sm">
                    {s.description}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-primary font-bold risu-underline shrink-0">
                  {s.cta}
                  <ArrowRightIcon className="text-[1.1em]" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 rounded-2xl border border-primary/30 bg-orange-50/50 dark:bg-orange-900/20 p-4 text-center">
        <Link
          href={`/sign-in?redirect=${encodeURIComponent("/dashboard/zapisy")}`}
          className="inline-flex items-center gap-2 font-bold text-primary risu-underline"
        >
          <span className="material-symbols-outlined">login</span>
          Zaloguj się, aby zapisać się od razu
        </Link>
      </div>
      <div className="space-y-6">
        {steps.map((s) => (
          <Link
            key={s.step}
            href={s.href}
            className="block rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 shadow-soft hover:shadow-glow hover:border-primary/50 transition-all group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-2xl">
                  {s.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Krok {s.step}
                </span>
                <h2 className="text-xl font-bold text-text-main dark:text-white mt-1">
                  {s.title}
                </h2>
                <p className="text-text-light dark:text-stone-400 mt-2 text-sm">
                  {s.description}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-primary font-bold risu-underline shrink-0">
                {s.cta}
                <ArrowRightIcon className="text-[1.1em]" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
