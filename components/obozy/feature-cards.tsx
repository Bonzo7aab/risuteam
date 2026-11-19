import { cn } from "@/lib/utils";

export type FeatureCard = {
  icon: string;
  title: string;
  description: string;
};

export type FeatureCardsProps = {
  title: string;
  subtitle?: string;
  cards: FeatureCard[];
  cardsGridClassName?: string;
  /** Two-column phone grid: stretch a leftover last card across the row. */
  pairOnMobile?: boolean;
};

export function FeatureCards({
  title,
  subtitle,
  cards,
  cardsGridClassName,
  pairOnMobile = false,
}: FeatureCardsProps) {
  return (
    <section className="bg-stone-50 py-10 dark:bg-stone-900/30 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 text-center md:mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white md:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mx-auto mt-1.5 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-stone-400 md:mt-2 md:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className={cardsGridClassName ?? "grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6 lg:gap-8"}>
          {cards.map((card, index) => {
            const spansRow =
              pairOnMobile && cards.length % 2 === 1 && index === cards.length - 1;
            return (
              <div
                key={card.title}
                className={cn(
                  "h-full rounded-2xl bg-white p-3.5 shadow-[0_1px_2px_rgba(28,22,13,0.04),0_0_0_1px_rgba(28,22,13,0.06)] transition-shadow dark:bg-[#2c2419] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] md:border md:border-stone-200 md:bg-white md:p-6 md:shadow-card hover:md:shadow-card-hover lg:p-8 dark:md:border-white/12 dark:md:bg-surface-dark dark:md:shadow-card-dark",
                  spansRow && "max-lg:col-span-2 max-lg:flex max-lg:items-center max-lg:gap-3"
                )}
              >
                <div
                  className={cn(
                    "mb-2.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary md:mb-4 md:size-12 md:rounded-full md:bg-primary md:text-primary-foreground",
                    spansRow && "max-lg:mb-0"
                  )}
                >
                  <span
                    className="material-symbols-outlined text-[22px] md:text-2xl"
                    aria-hidden
                  >
                    {card.icon}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold leading-snug text-stone-900 dark:text-white md:mb-2 md:text-xl">
                    {card.title}
                  </h3>
                  {card.description ? (
                    <p className="mt-1 text-[13px] leading-relaxed text-stone-600 dark:text-stone-400 md:mt-0 md:text-sm">
                      {card.description}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
