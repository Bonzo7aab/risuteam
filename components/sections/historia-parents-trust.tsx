import Image from "next/image";
import { Shield, Users, HeartHandshake } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Certyfikowani specjaliści",
    description:
      "Wszyscy trenerzy mają uprawnienia, przechodzą szkolenia i są sprawdzeni w pracy z dziećmi.",
    iconWrap: "bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400",
  },
  {
    icon: Users,
    title: "Małe grupy",
    description:
      "Utrzymujemy niski stosunek dzieci do trenera, żeby każde dziecko miało indywidualną uwagę.",
    iconWrap: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
  },
  {
    icon: HeartHandshake,
    title: "Społeczność",
    description:
      "Jesteśmy jak rodzina — rodzice mogą obserwować zajęcia, a my spotykamy się też poza salą.",
    iconWrap: "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400",
  },
] as const;

const gallery = [
  {
    src: "/images/652855775_122163406388748139_8085305856522333687_n.jpg",
    alt: "Dzieci na zajęciach Risu Team",
  },
  {
    src: "/images/654197779_122163407402748139_2742728780677275494_n.jpg",
    alt: "Zajęcia sportowe dla dzieci",
  },
  {
    src: "/willabasienka.jpg",
    alt: "Trening z trenerem Risu Team",
  },
  {
    src: "/hero-facebook.jpg",
    alt: "Grupa dzieci podczas aktywności",
  },
] as const;

export function HistoriaParentsTrust() {
  return (
    <section className="rounded-[2rem] border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 sm:p-8 md:p-12 lg:p-14 shadow-soft">
      <div className="grid gap-10 lg:gap-14 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-text-main dark:text-stone-300">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            Wybór rodziców
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-black leading-tight tracking-tight text-text-main dark:text-white">
            Dlaczego rodzice{" "}
            <span className="text-primary">ufają Risu Team</span>
          </h2>
          <p className="text-base text-stone-600 dark:text-stone-400 max-w-xl leading-relaxed">
            Od lat budujemy zaufanie przez transparentność, bezpieczeństwo i
            prawdziwą relację z rodzinami — nie tylko na macie, ale też w
            codziennej komunikacji.
          </p>
          <ul className="space-y-4">
            {features.map(({ icon: Icon, title, description, iconWrap }) => (
              <li
                key={title}
                className="flex gap-4 rounded-2xl border border-stone-100 dark:border-stone-700/80 bg-stone-50/80 dark:bg-stone-800/40 p-4 sm:p-5"
              >
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-full ${iconWrap}`}
                >
                  <Icon className="size-6" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 pt-0.5">
                  <h3 className="font-bold text-text-main dark:text-white text-base">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-3 sm:gap-4 pt-0 sm:pt-8">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] dark:shadow-none ring-1 ring-black/5 dark:ring-white/10">
                <Image
                  src={gallery[0].src}
                  alt={gallery[0].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 45vw, 280px"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-[1.75rem] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] dark:shadow-none ring-1 ring-black/5 dark:ring-white/10">
                <Image
                  src={gallery[2].src}
                  alt={gallery[2].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 45vw, 280px"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative aspect-square overflow-hidden rounded-[1.75rem] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] dark:shadow-none ring-1 ring-black/5 dark:ring-white/10">
                <Image
                  src={gallery[1].src}
                  alt={gallery[1].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 45vw, 280px"
                />
              </div>
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.75rem] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] dark:shadow-none ring-1 ring-black/5 dark:ring-white/10">
                <Image
                  src={gallery[3].src}
                  alt={gallery[3].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 45vw, 280px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
