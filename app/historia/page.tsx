import { Metadata } from "next";
import { HistoriaParentsTrust } from "@/components/sections/historia-parents-trust";
import { HistoriaTimelineReui } from "@/components/sections/historia-timeline-reui";

export const metadata: Metadata = {
  title: "O nas | Risu Team",
  description: "Historia, wartości i misja Risu Team — budowanie charakteru przez sport",
};

const pillars = [
  {
    icon: "favorite",
    title: "Zdrowie",
    desc: "Ruch, odporność i świadomość ciała od najmłodszych lat.",
  },
  {
    icon: "celebration",
    title: "Zabawa",
    desc: "Trening przez gry i zabawy — dzieci uczą się najlepiej, gdy się bawią.",
  },
  {
    icon: "self_improvement",
    title: "Dyscyplina",
    desc: "Szacunek, punktualność i wytrwałość — fundamenty na całe życie.",
  },
];

const timeline = [
  {
    period: "2018",
    title: "Powstanie klubu",
    description: "Pierwsze grupy Judo i Gimnastyki. Zaczęliśmy z pasji do sportu i pracy z dziećmi.",
  },
  {
    period: "2020",
    title: "Rozszerzenie o Karate",
    description: "Ponad 100 stałych uczestników. Współpraca z lokalnymi szkołami.",
  },
  {
    period: "2022",
    title: "Pierwsze obozy",
    description: "Obozy letnie i zimowe. Współpraca z lokalnymi szkołami.",
  },
  {
    period: "Dziś",
    title: "Risu Team dziś",
    description: "Trzy sale treningowe, kadra 4+ trenerów, setki zadowolonych rodzin.",
  },
];

export default function HistoriaPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <section className="relative px-6 py-16 md:py-24 overflow-hidden">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-text-main dark:text-white mb-4">
              Budujemy <span className="text-primary">mistrzów</span>
            </h1>
            <p className="text-lg text-text-light dark:text-stone-400 max-w-2xl mx-auto">
              Od 2018 roku pomagamy dzieciom budować charakter, zdrowie i pewność siebie przez sport.
            </p>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white text-center mb-10 md:mb-12">
            Nasza droga
          </h2>
          <div className="mb-20 md:mb-24">
            <HistoriaTimelineReui entries={timeline} />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-8 text-center"
              >
                <span className="material-symbols-outlined text-5xl text-primary mb-4 block">
                  {p.icon}
                </span>
                <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                  {p.title}
                </h3>
                <p className="text-text-light dark:text-stone-400">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mb-16">
            <HistoriaParentsTrust />
          </div>
        </div>
      </section>
    </div>
  );
}
