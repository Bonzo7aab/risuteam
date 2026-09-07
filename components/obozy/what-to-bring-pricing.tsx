import Link from "next/link";

export type WhatToBringPricingProps = {
  whatToBringTitle: string;
  whatToBringItems: string[];
  priceTitle: string;
  price: string;
  priceIncluded: string[];
  bookButtonLabel: string;
  bookButtonHref: string;
  showBookButton?: boolean;
  showDropdowns?: boolean;
  availabilityLabel?: string;
  availabilityPercent?: number;
  /** e.g. "Rabat early bird: 10%" */
  earlyBirdLabel?: string;
  /** e.g. "Maks. 30 miejsc" */
  maxParticipantsLabel?: string;
};

export function WhatToBringPricing({
  whatToBringTitle,
  whatToBringItems,
  priceTitle,
  price,
  priceIncluded,
  bookButtonLabel,
  bookButtonHref,
  showBookButton = true,
  showDropdowns = true,
  availabilityLabel,
  availabilityPercent,
  earlyBirdLabel,
  maxParticipantsLabel,
}: WhatToBringPricingProps) {
  return (
    <section className="py-16 md:py-24 bg-stone-50 dark:bg-stone-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Co zabrać */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              {whatToBringTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {whatToBringItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-stone-700 dark:text-stone-300"
                >
                  <span
                    className="material-symbols-outlined text-primary shrink-0"
                    aria-hidden
                  >
                    check_circle
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Cena wyjazdu */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-orange-50 dark:bg-orange-900/20 p-6 md:p-8 shadow-md">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white mb-4">
              {priceTitle}
            </h2>
            <p className="text-3xl md:text-4xl font-bold text-primary mb-4">
              {price}
            </p>
            <ul className="space-y-1 text-sm text-stone-600 dark:text-stone-400 mb-4">
              {priceIncluded.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {(earlyBirdLabel || maxParticipantsLabel) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600 dark:text-stone-400 mb-6">
                {earlyBirdLabel && <span>{earlyBirdLabel}</span>}
                {maxParticipantsLabel && <span>{maxParticipantsLabel}</span>}
              </div>
            )}
            {showDropdowns && (
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Termin
                </label>
                <select
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-stone-900 dark:text-white"
                  aria-label="Wybierz termin"
                >
                  <option>5–12.07.2025</option>
                </select>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Uczestnicy
                </label>
                <select
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-stone-900 dark:text-white"
                  aria-label="Liczba uczestników"
                >
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </div>
            )}
            {availabilityLabel != null && availabilityPercent != null && (
              <div className="mb-6">
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  {availabilityLabel}
                </p>
                <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, availabilityPercent))}%` }}
                  />
                </div>
              </div>
            )}
            {showBookButton ? (
              <Link
                href={bookButtonHref}
                className="block w-full text-center rounded-xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {bookButtonLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
