import Hero from "@/components/hero";
import { fetchTestimonials } from "@/app/actions";

export default async function Home() {
  const { data: testimonialsDb } = await fetchTestimonials();
  const testimonials = (testimonialsDb || []).map((t) => ({
    name: t.name,
    date: t.date,
    location: t.location_name,
    src: t.src,
    tab: t.tab,
  }));
  return (
    <main className="flex flex-col flex-1 gap-6 px-2">
      <Hero testimonials={testimonials} />
    </main>
  );
}
