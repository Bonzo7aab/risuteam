"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=600";

export function TrenerzyCoachesSection() {
  const coaches = useQuery(api.coaches.listActive);

  useEffect(() => {
    if (coaches === undefined) return;
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) return;
    let anchorId = raw;
    try {
      anchorId = decodeURIComponent(raw);
    } catch {
      /* keep raw */
    }
    const t = window.setTimeout(() => {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary", "rounded-2xl");
        window.setTimeout(() => {
          el.classList.remove("ring-2", "ring-primary", "rounded-2xl");
        }, 2200);
      }
    }, 100);
    return () => window.clearTimeout(t);
  }, [coaches]);

  if (coaches === undefined) {
    return (
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800/80"
          >
            <div className="aspect-[5/4] animate-pulse bg-stone-200 dark:bg-stone-700 sm:aspect-[16/10]" />
            <div className="space-y-3 p-6 sm:p-8">
              <div className="h-3 w-16 animate-pulse rounded bg-stone-200 dark:bg-stone-600" />
              <div className="h-8 w-3/4 max-w-xs animate-pulse rounded bg-stone-200 dark:bg-stone-600" />
              <div className="h-4 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-600" />
              <div className="h-4 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-600" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200 dark:bg-stone-600" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (coaches.length === 0) {
    return (
      <p className="py-12 text-center text-text-light dark:text-stone-400">
        Lista trenerów pojawi się wkrótce.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      {coaches.map((c, index) => {
        const bioText = c.bio?.trim();

        return (
          <article
            key={c._id}
            id={c._id}
            className="scroll-mt-28 flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft transition-shadow hover:shadow-glow dark:border-stone-700 dark:bg-stone-900/80"
          >
            <div className="relative aspect-[5/4] w-full shrink-0 sm:aspect-[16/10]">
              <Image
                src={c.photoUrl ?? FALLBACK_IMAGE}
                alt={c.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={index < 2}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <span className="material-symbols-outlined text-xl">
                  sports_martial_arts
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6 sm:p-8">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
                Sensei
              </p>
              <h3 className="text-2xl font-black tracking-tight text-text-main dark:text-white sm:text-3xl">
                {c.name}
              </h3>
              {c.disciplines.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.disciplines.map((d) => (
                    <span
                      key={d}
                      className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary dark:bg-primary/25 dark:text-amber-100"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              ) : null}
              {bioText ? (
                <p className="mt-5 flex-1 text-left text-base leading-relaxed text-text-light dark:text-stone-300 sm:text-[1.05rem] whitespace-pre-wrap">
                  {bioText}
                </p>
              ) : (
                <p className="mt-5 flex-1 text-base text-text-light dark:text-stone-400">
                  Więcej informacji wkrótce.
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
