import { MembershipPlanCard } from "@/components/sections/membership-plan-card";
import { HomeSectionDivider } from "@/components/sections/home-section-divider";
import { BlurFade } from "@/components/ui/blur-fade";

export function PricingSection() {
  return (
    <section
      className="mx-auto w-full max-w-7xl border-t border-orange-200/80 bg-white px-4 py-14 dark:border-white/10 dark:bg-[#2c2419] sm:px-6 max-md:pt-0 md:border-t-0 md:bg-transparent md:dark:bg-transparent lg:px-8 lg:py-20"
      id="pricing"
    >
      <HomeSectionDivider />
      <BlurFade inView delay={0.04} offset={10} blur="0px" className="text-center mb-12">
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
      </BlurFade>

      <BlurFade inView delay={0.12} offset={16} blur="0px">
        <MembershipPlanCard className="max-w-2xl mx-auto" />
      </BlurFade>
    </section>
  );
}
