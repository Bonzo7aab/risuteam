"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function AdminUstawieniaPage() {
  const settings = useQuery(api.siteSettings.get);
  const setEnabled = useMutation(
    api.siteSettings.setClassesRegistrationAndPaymentsEnabled
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled = settings?.classesRegistrationAndPaymentsEnabled ?? false;
  const loading = settings === undefined;

  const handleToggle = async (next: boolean) => {
    setError(null);
    setSaving(true);
    try {
      await setEnabled({ enabled: next });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się zapisać.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          Panel administratora
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-text-main dark:text-white sm:text-3xl">
          Ustawienia
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          Globalne przełączniki funkcji serwisu.
        </p>
      </header>

      <section
        className={cn(
          "rounded-2xl border border-stone-200/80 bg-white p-5 shadow-card",
          "dark:border-stone-800 dark:bg-[#2a2015]"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-text-main dark:text-white">
              Zapisy i płatności za zajęcia
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              Gdy wyłączone, ukryte są tylko przyciski zapisu na zajęcia (dla
              rodziców i adminów). Strony grafiku, cennika i płatności pozostają
              dostępne. Rejestracje na obozy i nocowanki działają bez zmian.
            </p>
            {!loading && (
              <p
                className={cn(
                  "mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold",
                  enabled
                    ? "bg-primary/15 text-primary"
                    : "bg-stone-200/80 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                )}
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  aria-hidden
                >
                  {enabled ? "check_circle" : "block"}
                </span>
                {enabled ? "Włączone" : "Wyłączone"}
              </p>
            )}
          </div>
          <Switch
            checked={enabled}
            disabled={loading || saving}
            onCheckedChange={handleToggle}
            aria-label="Zapisy i płatności za zajęcia"
          />
        </div>
        {error ? (
          <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
      </section>
    </div>
  );
}
