import Hero from "@/components/hero";
import { fetchTestimonials } from "@/app/actions";

export default async function Home() {
  const { data: testimonials } = await fetchTestimonials();
  return (
    <main className="flex flex-col flex-1 gap-6 px-2">
      <Hero testimonials={testimonials || []} />
    </main>
  );
}
