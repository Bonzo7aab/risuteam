import Link from "next/link";

export type InstallmentRow = {
  label: string;
  /** e.g. "Przy zapisie", "Do 30 maja" */
  deadline?: string;
  amount: string;
};

export type CampPricePaymentSectionProps = {
  priceDescription: string;
  price: string;
  priceIncluded: string[];
  installments: InstallmentRow[];
  registrationHref: string;
  isRegistrationClosed: boolean;
};

export function CampPricePaymentSection({
  priceDescription,
  price,
  priceIncluded,
  installments,
  registrationHref,
  isRegistrationClosed,
}: CampPricePaymentSectionProps) {
  return (
    <section id="cennik" className="py-12 md:py-16 bg-stone-50 dark:bg-stone-900/30 border-t border-stone-200 dark:border-stone-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white mb-6">
          Cena i płatność
        </h2>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Wszystko w cenie */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 shadow-sm">
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
              {priceDescription}
            </p>
            <div className="flex flex-wrap items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-primary">
                {price}
              </span>
            </div>
            <ul className="space-y-2 mt-4">
              {priceIncluded.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                  <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0" aria-hidden>
                    check_circle
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Płatność w ratach */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">
              Płatność w ratach 0%
            </h3>
            <ul className="space-y-3">
              {installments.map((row) => (
                <li
                  key={row.label}
                  className="flex flex-wrap items-center justify-between gap-2 text-stone-700 dark:text-stone-300"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-stone-900 dark:text-white">
                      {row.label}
                    </span>
                    {row.deadline && (
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        {row.deadline}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-stone-900 dark:text-white shrink-0">
                    {row.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
