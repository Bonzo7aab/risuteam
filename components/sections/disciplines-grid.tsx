import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right";

const disciplines = [
  {
    title: "Judo",
    tagline: "DROGA ŁAGODNOŚCI",
    description:
      "Nauka równowagi, szacunku i technik samoobrony. Idealne do budowy siły i pewności siebie.",
    icon: "sports_martial_arts",
    href: "/rodzaje_zajec#judo",
  },
  {
    title: "Karate",
    tagline: "SIŁA I SKUPIENIE",
    description:
      "Rozwijaj dyscyplinę, szybkość i koncentrację przez tradycyjne formy i energetyczne kata.",
    icon: "sports_martial_arts",
    href: "/rodzaje_zajec#karate",
  },
  {
    title: "Gimnastyka",
    tagline: "PRZEWROTY I SKOKI",
    description:
      "Rozwijaj elastyczność, koordynację i siłę przy doskonałej zabawie.",
    icon: "accessibility_new",
    href: "/rodzaje_zajec#gimnastyka",
  },
];

export function DisciplinesGrid() {
  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16"
      id="disciplines"
    >
      <div className="flex flex-col gap-3 mb-10 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-text-main dark:text-white tracking-tight">
          Wybierz swoją ścieżkę mocy
        </h2>
        <p className="text-text-light dark:text-stone-400 text-base">
          W Risu wybierasz dyscyplinę, która pasuje do temperamentu Twojego dziecka. Razem z trenerami
          budujemy pewność siebie, dyscyplinę i radość z ruchu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {disciplines.map((d) => (
          <div
            key={d.title}
            className="flex flex-col gap-3 rounded-2xl bg-white/70 dark:bg-[#1c150d]/35 backdrop-blur border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-2xl">{d.icon}</span>
              </div>
              <h3 className="text-xl font-black text-text-main dark:text-white">
                {d.title}
              </h3>
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-text-light dark:text-stone-400 mt-1">
              {d.tagline}
            </p>

            <p className="text-sm text-text-light dark:text-stone-400 leading-relaxed">
              {d.description}
            </p>

            <Link
              href={d.href}
              className="inline-flex items-center gap-2 text-sm font-bold text-text-main dark:text-stone-300 hover:text-primary transition-colors mt-auto"
            >
              Poznaj ofertę
              <ArrowRightIcon className="text-primary text-[1em]" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
