import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

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
      <BlurFade inView delay={0.04} offset={10} blur="0px" className="flex flex-col gap-3 mb-10 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-text-main dark:text-white tracking-tight">
          Wybierz swoją ścieżkę mocy
        </h2>
        <p className="text-text-light dark:text-stone-400 text-base">
          W Risu wybierasz dyscyplinę, która pasuje do temperamentu Twojego dziecka. Razem z trenerami
          budujemy pewność siebie, dyscyplinę i radość z ruchu.
        </p>
      </BlurFade>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {disciplines.map((d, i) => (
          <BlurFade key={d.title} inView delay={0.08 + i * 0.08} offset={16} blur="0px">
            <Link
              href={d.href}
              className={cn(
                "risu-card risu-card-hover group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-6",
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
              >
                <span className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/55 to-transparent opacity-0 group-hover:animate-shine group-hover:opacity-100 dark:via-white/15" />
              </span>
              <div className="flex items-center gap-3">
                <div className="risu-icon-well size-11 transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100">
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

              <span className="inline-flex items-center gap-2 text-sm font-bold text-text-main dark:text-stone-300 transition-colors mt-auto group-hover:text-primary">
                Poznaj ofertę
                <ArrowRightIcon className="text-primary text-[1em] transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}
