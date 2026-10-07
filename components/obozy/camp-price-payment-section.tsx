import Link from "next/link";
import { Button } from "@/components/ui/button";
import { campRegistrationCtaHref } from "@/lib/camp-registration-links";

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
  const registerHref = campRegistrationCtaHref(
    registrationHref,
    isRegistrationClosed,
  );

  return (
    <section
      id="cennik"
      className="border-t border-stone-200 bg-stone-50 py-12 dark:border-stone-700 dark:bg-stone-900/30 md:py-16"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-stone-900 dark:text-white md:text-3xl">
          Cena i płatność
        </h2>

        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-stone-700 dark:bg-stone-900/80">
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col border-b border-stone-200 p-6 dark:border-stone-700 md:border-b-0 md:border-r md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                Cena za uczestnika
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
                {price}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                {priceDescription}
              </p>

              {priceIncluded.length > 0 ? (
                <ul className="mt-6 space-y-2.5">
                  {priceIncluded.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300"
                    >
                      <span
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        aria-hidden
                      >
                        <span className="material-symbols-outlined text-[16px] leading-none">
                          check
                        </span>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-auto pt-6">
                <Button
                  asChild
                  className="h-11 rounded-xl px-6 text-sm font-bold"
                  disabled={isRegistrationClosed}
                >
                  <Link
                    href={registerHref}
                    onClick={(e) => {
                      if (isRegistrationClosed) e.preventDefault();
                    }}
                    aria-disabled={isRegistrationClosed}
                    className={
                      isRegistrationClosed
                        ? "pointer-events-none cursor-not-allowed opacity-70"
                        : ""
                    }
                  >
                    {isRegistrationClosed ? "Rejestracja zakończona" : "Zapisz się"}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="bg-stone-50/90 p-6 dark:bg-stone-950/35 md:p-8">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Harmonogram wpłat
              </h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Raty 0% — bez dodatkowych kosztów
              </p>

              <ol className="mt-5 space-y-0">
                {installments.map((row, i) => {
                  const isLast = i === installments.length - 1;
                  return (
                    <li key={row.label} className="relative flex gap-3">
                      {!isLast ? (
                        <span
                          className="absolute left-[13px] top-7 bottom-0 w-px bg-stone-200 dark:bg-stone-700"
                          aria-hidden
                        />
                      ) : null}
                      <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <div
                        className={`flex min-w-0 flex-1 items-start justify-between gap-3 ${isLast ? "pb-0" : "pb-5"}`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-stone-900 dark:text-white">
                            {row.label}
                          </p>
                          {row.deadline ? (
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                              {row.deadline}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 text-sm font-bold tabular-nums text-stone-900 dark:text-white">
                          {row.amount}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
