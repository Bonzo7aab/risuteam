import Hero from "@/components/hero";
import SummerCamp from "./obozy/letnie/page";

export default async function Home() {
  return (
    <main className="flex flex-col flex-1 gap-6 px-2">
      <Hero />
      <SummerCamp />
    </main>
  );
}
