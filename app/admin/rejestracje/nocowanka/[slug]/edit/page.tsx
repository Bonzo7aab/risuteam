"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NocowankaEditor } from "../../nocowanka-form";

function formatAdminTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function decodeSlug(raw: string | string[] | undefined): string {
  if (!raw) return "";
  const s = Array.isArray(raw) ? raw[0] ?? "" : raw;
  try {
    return decodeURIComponent(String(s)).trim();
  } catch {
    return String(s).trim();
  }
}

export default function AdminEditNocowankaPage() {
  const params = useParams();
  const slug = decodeSlug(params.slug as string | string[] | undefined);
  const doc = useQuery(
    api.nocowanki.getBySlug,
    slug ? { slug } : "skip"
  );

  const actionBtnClass = "h-9 min-h-9 rounded-lg px-3 text-sm font-semibold";
  const title = doc?.name ?? "Edycja nocowanki";
  const isOpen = doc ? doc.isActive !== false : true;

  return (
    <div className="w-full min-w-0 max-w-5xl space-y-6 text-left">
      <nav className="text-sm text-stone-500 dark:text-stone-400">
        <Link
          href="/admin/wydarzenia"
          className="font-medium transition-colors hover:text-primary"
        >
          Wydarzenia
        </Link>
        <span className="mx-2 text-stone-300 dark:text-stone-600">/</span>
        <span className="font-medium text-stone-900 dark:text-white">{title}</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white md:text-3xl">
              {title}
            </h1>
            {doc ? (
              <span
                className={cn(
                  "inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                  isOpen
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400",
                )}
              >
                {isOpen ? "Otwarta" : "Zamknięta"}
              </span>
            ) : null}
          </div>
          {doc ? (
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              Ostatnia zmiana: {formatAdminTimestamp(doc.updatedAt ?? doc._creationTime)}
            </p>
          ) : slug ? (
            <p className="mt-2 font-mono text-sm text-stone-500 dark:text-stone-400">
              {slug}
            </p>
          ) : null}
        </div>
        {slug ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className={actionBtnClass} asChild>
              <Link href={`/admin/wydarzenia/nocowanka/${encodeURIComponent(slug)}/pytania`}>
                Pytania
              </Link>
            </Button>
            <Button variant="outline" size="sm" className={actionBtnClass} asChild>
              <Link href={`/admin/rejestracje/nocowanka/${encodeURIComponent(slug)}`}>
                Rejestracje
              </Link>
            </Button>
            <Button
              type="submit"
              form="nocowanka-form"
              size="sm"
              className={actionBtnClass}
            >
              Zapisz
            </Button>
          </div>
        ) : null}
      </div>

      <NocowankaEditor variant="edit" doc={doc} editSlug={slug} />
    </div>
  );
}
