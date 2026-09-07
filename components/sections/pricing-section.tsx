import { MembershipPlanCard } from "@/components/sections/membership-plan-card";

export function PricingSection() {
  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20"
      id="pricing"
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-3">
          <span className="material-symbols-outlined text-sm">model_training</span>
          Przejrzysty model współpracy
        </div>
        <h2 className="text-3xl md:text-4xl font-black leading-[1.1] text-text-main dark:text-white tracking-tight">
          Przejrzysty model współpracy
        </h2>
        <p className="text-text-light dark:text-stone-400 mt-2 max-w-2xl mx-auto">
          Jedno proste rozwiązanie: wybierasz abonament, a my dopasowujemy grafik i wspieramy progres Twojego dziecka.
        </p>
      </div>

      <MembershipPlanCard className="max-w-2xl mx-auto" />
    </section>
  );
}
