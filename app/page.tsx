import Hero from "@/components/hero";
import SummerCamp from "./obozy/letnie/page";
import { CarouselPlugin } from "@/components/hero1";

export default async function Home() {
  return (
    <main className="flex flex-col flex-1 gap-6 px-2">
      <CarouselPlugin />
      <Hero />
      <SummerCamp />
    </main>
  );
}
