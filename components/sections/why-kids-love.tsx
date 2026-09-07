import Image from "next/image";

/** Left collage — reuse paths from hero / homepage (`public/`). */
const IMAGE_BACK = "/hero-facebook.jpg";
const IMAGE_FRONT = "/images/654197779_122163407402748139_2742728780677275494_n.jpg";

type PhilosophyItem = {
  icon: string;
  title: string;
  description: string;
};

const philosophyItems: PhilosophyItem[] = [
  {
    icon: "gpp_good",
    title: "Bezpieczeństwo przede wszystkim",
    description:
      "Certyfikowana kadra trenerska i atestowany sprzęt zapewniają pełny komfort ćwiczeń.",
  },
  {
    icon: "sentiment_satisfied",
    title: "Nauka przez zabawę",
    description:
      "Metodyka dostosowana do wieku, która sprawia, że dzieci nie mogą doczekać się kolejnych zajęć.",
  },
  {
    icon: "rocket_launch",
    title: "Wszechstronny rozwój",
    description:
      "Dbamy o kondycję fizyczną, ale też o skupienie, samodyscyplinę i współpracę w grupie.",
  },
];

const wellIconSize = "max(1.35rem, min(58cqw, 48cqh, 2.5rem))" as const;

function IconWell({ icon }: { icon: string }) {
  return (
    <div
      className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-stone-100 bg-white shadow-sm [container-type:size] dark:border-stone-700 dark:bg-stone-900 sm:size-16"
      aria-hidden
    >
      <span
        className="material-symbols-outlined pointer-events-none select-none leading-none text-primary"
        style={{ fontSize: wellIconSize }}
      >
        {icon}
      </span>
    </div>
  );
}

function PhilosophyVisuals() {
  return (
    <div className="relative mx-auto w-full max-w-lg min-h-0 sm:min-h-[340px] lg:min-h-[400px] lg:max-w-none">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-stone-200/80 bg-stone-100 shadow-lg dark:border-stone-700 dark:bg-stone-800 sm:w-[64%] sm:max-w-[280px] lg:w-[62%] lg:max-w-[300px]">
        <Image
          src={IMAGE_BACK}
          alt="Dzieci podczas zajęć Risu Team"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 55vw, 300px"
          style={{ objectPosition: "center 28%" }}
        />
      </div>
      {/* Keep overlap from small screens up; hide on mobile. */}
      <div className="absolute right-0 top-[26%] hidden w-[44%] max-w-[158px] translate-x-0.5 sm:bottom-0 sm:block sm:w-[58%] sm:max-w-[248px] sm:translate-x-3 sm:translate-y-3 lg:w-[64%] lg:max-w-[288px] lg:translate-x-4 lg:translate-y-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-stone-200/80 bg-stone-100 shadow-xl dark:border-stone-700 dark:bg-stone-800">
          <Image
            src={IMAGE_FRONT}
            alt="Trening i bezpieczny ruch w Risu Team"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 38vw, (max-width: 1024px) 45vw, 288px"
            style={{ objectPosition: "center 35%" }}
          />
        </div>
      </div>
    </div>
  );
}

export function WhyKidsLove() {
  return (
    <section className="w-full bg-[#FDFBF7] dark:bg-background-dark">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="order-2 lg:order-1">
            <PhilosophyVisuals />
          </div>

          <div className="order-1 max-w-xl lg:order-2 lg:max-w-none">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
              NASZA FILOZOFIA
            </p>
            <h2 className="mt-3 text-3xl font-black leading-[1.12] tracking-tight text-text-main dark:text-white sm:text-4xl lg:text-[2.35rem] xl:text-4xl">
              Miejsce, gdzie Twoje dziecko rośnie w siłę i uśmiech
            </h2>

            <ul className="mt-8 flex flex-col gap-7 sm:gap-8">
              {philosophyItems.map((item) => (
                <li key={item.title} className="flex gap-4 sm:gap-5">
                  <IconWell icon={item.icon} />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h3 className="text-base font-bold text-text-main dark:text-white sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
