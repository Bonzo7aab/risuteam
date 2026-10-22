"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  DEFAULT_MONTHLY_FEE_GROSZE,
  formatPlnFromGrosze,
  groszeToZlString,
} from "@/lib/pricing";

export function getMembershipPlan(amountGrosze: number = DEFAULT_MONTHLY_FEE_GROSZE) {
  const price = formatPlnFromGrosze(amountGrosze);
  return {
    title: "Abonament Miesięczny",
    price,
    priceAmount: groszeToZlString(amountGrosze),
    features: [
      "8 zajęć w miesiącu",
      "Judo, Karate lub Gimnastyka",
      "Grafik dopasowany do grupy",
      "Progres i wsparcie na każdym etapie",
    ],
  } as const;
}

/** @deprecated Prefer getMembershipPlan() — kept for static imports. */
export const MEMBERSHIP_PLAN = getMembershipPlan(DEFAULT_MONTHLY_FEE_GROSZE);

export function MembershipPlanCard({
  className,
}: {
  className?: string;
}) {
  const fee = useQuery(api.payments.getPublicMonthlyClassFee);
  const plan = getMembershipPlan(fee?.amountGrosze ?? DEFAULT_MONTHLY_FEE_GROSZE);

  return (
    <div
      className={cn(
        "relative flex flex-col gap-6 overflow-hidden py-2",
        "md:risu-card md:risu-card-hover md:rounded-2xl md:p-8",
        className
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-primary to-amber-300"
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-primary/10 blur-2xl" aria-hidden />
      <div>
        <h3 className="text-xl font-black text-text-main dark:text-white mb-2">
          {plan.title}
        </h3>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-4xl font-black tracking-tight text-primary">
            {plan.price}
          </span>
          <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">
            / miesiąc
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-3 flex-1">
        {plan.features.map((f, i) => (
          <li
            key={f}
            className="flex items-start gap-3 text-sm text-text-main dark:text-stone-300"
          >
            <BlurFade inView delay={0.08 + i * 0.07} offset={6} blur="0px" className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-lg">
                check_circle
              </span>
              <span className="leading-relaxed">{f}</span>
            </BlurFade>
          </li>
        ))}
      </ul>
    </div>
  );
}
