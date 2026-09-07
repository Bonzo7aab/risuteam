import { Metadata } from "next";
import { TrenerzyCoachesSection } from "@/components/trenerzy/trenerzy-coaches-section";

export const metadata: Metadata = {
  title: "Trenerzy | Risu Team",
  description:
    "Poznaj naszych sensei — wykwalifikowani trenerzy Judo, Karate i Gimnastyki",
};

export default function TrenerzyPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <section className="relative mx-auto w-full max-w-7xl overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary dark:bg-orange-900/30">
            <span className="material-symbols-outlined text-sm">groups</span>
            Kadra
          </div>
          <h1 className="mb-4 text-3xl font-black leading-[1.1] tracking-tight text-text-main dark:text-white md:text-4xl">
            Poznaj <span className="text-primary">sensei</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-text-light dark:text-stone-400">
            Pasjonaci z misją rozwoju Twojego dziecka. Nasz zespół prowadzi najmłodszych z
            cierpliwością, energią i uśmiechem.
          </p>
        </div>

        <TrenerzyCoachesSection />
      </section>
    </div>
  );
}
