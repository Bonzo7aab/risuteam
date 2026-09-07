import { cn } from "@/lib/utils";

export const MEMBERSHIP_PLAN = {
  title: "Abonament Miesięczny",
  price: "249 zł",
  priceAmount: "249",
  features: [
    "8 zajęć w miesiącu",
    "Judo, Karate lub Gimnastyka",
    "Grafik dopasowany do grupy",
    "Progres i wsparcie na każdym etapie",
  ],
} as const;

export function MembershipPlanCard({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-8 flex flex-col gap-6 border border-stone-100 dark:border-stone-800 bg-white/70 dark:bg-[#15100a]/55 shadow-soft",
        className
      )}
    >
      <div>
        <h3 className="text-xl font-black text-text-main dark:text-white mb-2">
          {MEMBERSHIP_PLAN.title}
        </h3>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-4xl font-black text-primary">
            {MEMBERSHIP_PLAN.price}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-3 flex-1">
        {MEMBERSHIP_PLAN.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-3 text-sm text-text-main dark:text-stone-300"
          >
            <span className="material-symbols-outlined text-primary text-lg">
              check_circle
            </span>
            <span className="leading-relaxed">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
