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
};

export function FeatureCards({ title, subtitle, cards, cardsGridClassName }: FeatureCardsProps) {
  return (
    <section className="py-16 md:py-24 bg-stone-50 dark:bg-stone-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
        <div className={cardsGridClassName ?? "grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"}>
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4">
                <span
                  className="material-symbols-outlined text-primary-foreground text-2xl"
                  aria-hidden
                >
                  {card.icon}
                </span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                {card.title}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
