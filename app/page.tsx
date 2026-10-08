import { HeroHome } from "@/components/sections/hero-home";
import { HomeFeaturedOffer } from "@/components/sections/home-featured-offer";
import { DisciplinesGrid } from "@/components/sections/disciplines-grid";
import { HomeSchedulePreview } from "@/components/sections/home-schedule-preview";
import { WhyKidsLove } from "@/components/sections/why-kids-love";
import { PricingSection } from "@/components/sections/pricing-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CtaSection } from "@/components/sections/cta-section";

export default function Home() {
  return (
    <div className="grow flex flex-col bg-[#FDFBF7] dark:bg-background-dark blob-bg">
      <HeroHome />
      <HomeFeaturedOffer />
      <DisciplinesGrid />
      <HomeSchedulePreview />
      <WhyKidsLove />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}
