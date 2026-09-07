import { HeroHome } from "@/components/sections/hero-home";
import { DisciplinesGrid } from "@/components/sections/disciplines-grid";
import { WhyKidsLove } from "@/components/sections/why-kids-love";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { PricingSection } from "@/components/sections/pricing-section";

export default function Home() {
  return (
    <div className="flex-grow flex flex-col bg-[#FDFBF7] dark:bg-background-dark blob-bg">
      <HeroHome />
      <DisciplinesGrid />
      <WhyKidsLove />
      <PricingSection />
      <TestimonialsSection />
    </div>
  );
}
