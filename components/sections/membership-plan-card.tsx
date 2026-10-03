import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/ui/blur-fade";

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
        "risu-card risu-card-hover relative overflow-hidden rounded-2xl p-8 flex flex-col gap-6",
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
          {MEMBERSHIP_PLAN.title}
        </h3>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-4xl font-black tracking-tight text-primary">
            {MEMBERSHIP_PLAN.price}
          </span>
          <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">
            / miesiąc
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-3 flex-1">
        {MEMBERSHIP_PLAN.features.map((f, i) => (
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
