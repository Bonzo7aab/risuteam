"use client";

import { useMemo } from "react";
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

function StepsList({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((s) => (
        <li key={s.step}>
          <Link
            href={s.href}
            className="group flex flex-col gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-card transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover motion-reduce:hover:translate-y-0 dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark dark:hover:shadow-card-dark-hover sm:flex-row sm:items-center sm:p-6"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl" aria-hidden>
                {s.icon}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                Krok {s.step}
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-text-main dark:text-white">
                {s.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                {s.description}
              </p>
            </div>
            <span className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm font-bold text-text-main transition-colors group-hover:border-primary/30 group-hover:text-primary dark:border-stone-700 dark:bg-stone-900/50 dark:text-stone-100">
              {s.cta}
              <ArrowRightIcon className="text-[1em]" />
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function ZapisyContent({ steps }: { steps: Step[] }) {
  const currentUser = useQuery(api.authHelpers.getCurrentUser);
  const siteSettings = useQuery(api.siteSettings.get);
  const classesEnabled =
    siteSettings?.classesRegistrationAndPaymentsEnabled ?? false;
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
    return new Map(
      allClasses.map((c) => [c._id, { name: c.name, discipline: c.discipline }])
    );
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
      <div className="grid gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-stone-200/70 dark:bg-stone-800"
          />
        ))}
      </div>
    );
  }

  if (isLoggedIn && hasChildren && (classes?.length ?? 0) > 0) {
    return (
      <div className="space-y-5">
        <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight text-text-main dark:text-white">
                Twoje zapisy na zajęcia
              </h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Aktywne i oczekujące na płatność.
              </p>
            </div>
            {classesEnabled ? (
              <Link
                href="/grafik"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
              >
                Zapisz na zajęcia
                <ArrowRightIcon className="text-[1em]" />
              </Link>
            ) : null}
          </div>

          {subscriptions === undefined ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">Ładowanie…</p>
          ) : activeSubscriptions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 px-4 py-10 text-center dark:border-stone-600">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Brak aktywnych zapisów.
              </p>
              {classesEnabled ? (
                <Link
                  href="/grafik"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-hover"
                >
                  Otwórz grafik
                  <ArrowRightIcon className="text-[1em]" />
                </Link>
              ) : null}
            </div>
          ) : (
            <ul className="space-y-3">
              {activeSubscriptions.map((s) => {
                const cls = classMap.get(s.classId);
                const childName = s.childId
                  ? (childMap.get(s.childId) ?? "—")
                  : "—";
                return (
                  <li
                    key={s._id}
                    className="flex flex-col gap-3 rounded-xl border border-stone-200/80 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-950/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-text-main dark:text-white">
                        {cls?.name ?? "Zajęcia"}
                      </p>
                      <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                        {childName}
                        {cls?.discipline ? ` · ${cls.discipline}` : ""}
                      </p>
                      <span
                        className={cn(
                          "mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                          s.status === "active" &&
                            "bg-primary/15 text-primary",
                          s.status === "pending_payment" &&
                            "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                        )}
                      >
                        {subscriptionStatusLabel(s.status)}
                      </span>
                    </div>
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
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/cennik"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-[#2a2015] dark:text-stone-200 dark:hover:bg-stone-900"
          >
            <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden>
              payments
            </span>
            Cennik
          </Link>
          <Link
            href="/grafik"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-[#2a2015] dark:text-stone-200 dark:hover:bg-stone-900"
          >
            <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden>
              schedule
            </span>
            Grafik zajęć
          </Link>
          <Link
            href="/obozy"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-[#2a2015] dark:text-stone-200 dark:hover:bg-stone-900"
          >
            <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden>
              hiking
            </span>
            Obozy
          </Link>
        </div>
      </div>
    );
  }

  if (isLoggedIn && !hasChildren) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-stone-200/80 bg-orange-50/70 p-6 shadow-card dark:border-stone-800 dark:bg-primary/10 dark:shadow-card-dark sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight text-text-main dark:text-white">
                Najpierw dodaj dziecko
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                Profil dziecka jest potrzebny, aby zapisać je na zajęcia
                abonamentowe.
              </p>
            </div>
            <Link
              href="/dashboard/dzieci"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
            >
              Moje dzieci
              <ArrowRightIcon className="text-[1em]" />
            </Link>
          </div>
        </div>
        <StepsList steps={steps} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-stone-200/80 bg-white p-5 text-center shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark sm:p-6">
        <p className="text-sm text-stone-600 dark:text-stone-300">
          Zaloguj się, aby zapisać dziecko i zarządzać aktywnością.
        </p>
        <Link
          href={`/logowanie?redirect=${encodeURIComponent("/dashboard/zapisy")}`}
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden>
            login
          </span>
          Zaloguj się
        </Link>
      </div>
      <StepsList steps={steps} />
    </div>
  );
}
