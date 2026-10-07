export type CampAboutAndAttractionsSectionProps = {
  description?: string | null;
  attractions?: string[] | null;
};

export function CampAboutAndAttractionsSection({
  description,
  attractions,
}: CampAboutAndAttractionsSectionProps) {
  const text = description?.trim() ?? "";
  const items = (attractions ?? []).filter((item) => item.trim().length > 0);
  if (!text && items.length === 0) return null;

  const both = Boolean(text) && items.length > 0;

  return (
    <section className="border-t border-stone-200 bg-white py-12 dark:border-stone-700 dark:bg-stone-900/50 md:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {both ? (
          <>
            <h2 className="mb-6 text-2xl font-bold text-stone-900 dark:text-white md:text-3xl">
              O obozie
            </h2>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-stone-700 dark:bg-stone-900/80">
              <div className="grid md:grid-cols-2">
                <div className="flex flex-col justify-center border-b border-stone-200 p-6 dark:border-stone-700 md:border-b-0 md:border-r md:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    Opis
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-stone-700 dark:text-stone-300">
                    {text}
                  </p>
                </div>
                <div className="bg-stone-50/90 p-6 dark:bg-stone-950/35 md:p-8">
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    Atrakcje
                  </h3>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    Oprócz programu dnia
                  </p>
                  <ol className="mt-5 divide-y divide-stone-200/80 dark:divide-stone-700/80">
                    {items.map((item, i) => (
                      <li
                        key={`${item}-${i}`}
                        className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
                      >
                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold tabular-nums text-primary">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-medium leading-snug text-stone-800 dark:text-stone-200">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </>
        ) : text ? (
          <>
            <h2 className="mb-6 text-2xl font-bold text-stone-900 dark:text-white md:text-3xl">
              O obozie
            </h2>
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft dark:border-stone-700 dark:bg-stone-900/80 md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                Opis
              </p>
              <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-stone-700 dark:text-stone-300">
                {text}
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white md:text-3xl">
              Atrakcje
            </h2>
            <p className="mt-2 mb-6 text-sm text-stone-500 dark:text-stone-400">
              Wspólne atrakcje i aktywności dla całej grupy — oprócz programu dnia.
            </p>
            <ol className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-stone-700 dark:bg-stone-900/80">
              {items.map((item, i) => (
                <li
                  key={`${item}-${i}`}
                  className="flex items-start gap-4 border-b border-stone-200 px-4 py-3.5 last:border-b-0 dark:border-stone-700 sm:gap-5 sm:px-5"
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold tabular-nums text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pt-0.5 text-sm font-semibold leading-snug text-stone-900 dark:text-white sm:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}
