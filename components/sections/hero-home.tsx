import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { RisuTeamLogoTitleMark } from "@/components/brand/risu-team-logo-title";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { BlurFade } from "@/components/ui/blur-fade";
import RadialCarousel from "@/components/shadcn-studio/carousel/carousel-12";

const HERO_SLIDES = [
  {
    image: "/images/652855775_122163406388748139_8085305856522333687_n.jpg",
    title: "Zajęcia judo",
    category: "Judo",
  },
  {
    image: "/images/654197779_122163407402748139_2742728780677275494_n.jpg",
    title: "Bezpieczny trening",
    category: "Risu Team",
  },
  {
    image: "/hero-facebook.jpg",
    title: "Dzieci w Risu",
    category: "Społeczność",
  },
];

const HERO_MAIN_IMAGE = "/images/652855775_122163406388748139_8085305856522333687_n.jpg";

function MainHeroImage({ className }: { className?: string }) {
  const remoteSrc = process.env.NEXT_PUBLIC_HERO_IMAGE_URL?.trim();
  const useRemote = Boolean(remoteSrc && remoteSrc.startsWith("http"));

  return (
    <div className={`relative size-full overflow-hidden bg-[#e8bdbd] dark:bg-stone-800 ${className ?? ""}`}>
      {useRemote ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={remoteSrc}
          alt="Risu Team — zajęcia dla dzieci"
          className="absolute inset-0 size-full object-cover motion-safe:animate-kenburns"
          style={{ objectPosition: "center 28%" }}
          decoding="async"
        />
      ) : (
        <Image
          src={HERO_MAIN_IMAGE}
          alt="Risu Team — zajęcia dla dzieci"
          fill
          priority
          className="object-cover motion-safe:animate-kenburns"
          sizes="(max-width: 1024px) min(90vw, 380px), 380px"
          style={{ objectPosition: "center 28%" }}
        />
      )}
    </div>
  );
}

function HeroImageSection() {
  const remoteSrc = process.env.NEXT_PUBLIC_HERO_IMAGE_URL?.trim();
  const slides =
    remoteSrc?.startsWith("http")
      ? [
          {
            image: remoteSrc,
            title: "Risu Team",
            category: "Zajęcia",
          },
          ...HERO_SLIDES.slice(1),
        ]
      : HERO_SLIDES;

  return (
    <div className="relative mx-auto w-full">
      <RadialCarousel slides={slides} />
    </div>
  );
}

function HeroCtaButtons({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Link
        href="/dashboard/zapisy"
        className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_8px_24px_-6px_rgba(244,157,37,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_12px_28px_-6px_rgba(244,157,37,0.65)] motion-reduce:hover:translate-y-0"
      >
        Zapisz się
        <ArrowRightIcon className="text-[1.15em] transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function HeroTrustRow() {
  return (
    <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-stone-200/80 pt-6 dark:border-stone-700/60 lg:justify-start">
      <li className="text-left">
        <p className="text-lg font-black tracking-tight text-text-main dark:text-white">
          <AnimatedCounter value={500} suffix="+" />
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
          Dzieci
        </p>
      </li>
      <li className="text-left">
        <p className="text-lg font-black tracking-tight text-text-main dark:text-white">
          <AnimatedCounter value={3} duration={0.8} />
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
          Dyscypliny
        </p>
      </li>
      <li className="text-left">
        <p className="text-lg font-black tracking-tight text-text-main dark:text-white">
          Kadra
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
          Certyfikowana
        </p>
      </li>
    </ul>
  );
}

export function HeroHome() {
  return (
    <section
      className="w-full bg-[#faf8f5] dark:bg-background-dark"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(244, 157, 37, 0.08), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 50%, rgba(59, 130, 246, 0.06), transparent 50%)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 pb-8 pt-0 sm:px-6 sm:pb-12 sm:pt-0 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:py-16">
        {/* Mobile hero visual */}
        <div className="w-full lg:hidden">
          <div className="relative isolate -mx-4 overflow-hidden sm:-mx-6">
            <div className="relative h-[calc(100svh-5.25rem-env(safe-area-inset-bottom)+2.5rem)] min-h-144 w-full">
              <MainHeroImage />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.1)_0%,rgba(15,23,42,0.42)_40%,rgba(33,25,16,0.82)_80%,rgba(33,25,16,0.96)_100%)]" />
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(33,25,16,0.78)_0%,rgba(33,25,16,0.42)_20%,rgba(33,25,16,0.08)_40%,transparent_58%)]"
                aria-hidden
              />
              <div className="absolute inset-0 bg-primary/8 mix-blend-soft-light" />
              <div className="absolute inset-x-0 top-0 z-10 flex justify-center px-5 pt-[max(env(safe-area-inset-top),1rem)]">
                <RisuTeamLogoTitleMark priority />
              </div>
              <div className="absolute inset-x-0 bottom-16 mx-auto max-w-xl px-6 pt-16 text-center">
                <BlurFade delay={0.08} offset={10}>
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1 text-[11px] font-extrabold uppercase leading-none tracking-[0.16em] text-text-main shadow-card ring-1 ring-black/4">
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    Rozpocznij sezon
                  </div>
                </BlurFade>
                <BlurFade delay={0.16} offset={12}>
                  <h1 className="w-full text-4xl font-black leading-[1.04] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
                    Uwolnij moc
                    <br />
                    <span className="text-primary">swojego dziecka</span>
                    <br />
                    <span className="text-white">z nami!</span>
                  </h1>
                </BlurFade>
                <BlurFade delay={0.24} offset={10}>
                  <p className="mt-4 w-full text-base font-medium leading-relaxed text-white/90">
                    Bezpieczne, energiczne zajęcia z sztuk walki i gimnastyki dla dzieci w każdym wieku.
                  </p>
                </BlurFade>
                <BlurFade delay={0.32} offset={8}>
                  <HeroCtaButtons className="mt-6 flex flex-col gap-3" />
                </BlurFade>
              </div>
            </div>
          </div>
        </div>

        {/* Left column (desktop) */}
        <div className="hidden w-full flex-col gap-5 text-center lg:flex lg:w-1/2 lg:text-left">
          <BlurFade delay={0.06} offset={8} className="self-center lg:self-start">
            <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-orange-200/80 bg-orange-100/90 px-4 py-1.5 text-[11px] font-bold uppercase leading-none tracking-wider text-orange-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-orange-800/60 dark:bg-orange-950/50 dark:text-orange-100 dark:shadow-none">
              <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              Rozpocznij przygodę
            </div>
          </BlurFade>

          <BlurFade delay={0.14} offset={12}>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-text-main dark:text-white sm:text-5xl lg:text-6xl">
              Uwolnij moc
              <br />
              <span className="text-primary italic">swojego dziecka</span>{" "}
              <span className="text-primary not-italic">z Risu!</span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.22} offset={10}>
            <p className="mx-auto max-w-xl text-base font-medium leading-relaxed text-stone-600 dark:text-stone-300 lg:mx-0 lg:text-lg">
              Bezpieczne, energiczne zajęcia z sztuk walki i gimnastyki dla dzieci w każdym wieku.
              Buduj pewność siebie, dyscyplinę i zawieraj nowe przyjaźnie!
            </p>
          </BlurFade>

          <BlurFade delay={0.3} offset={8}>
            <HeroCtaButtons className="flex flex-col justify-center gap-3 pt-2 sm:flex-row sm:gap-4 lg:justify-start" />
          </BlurFade>
          <BlurFade delay={0.38} offset={8}>
            <HeroTrustRow />
          </BlurFade>
        </div>

        {/* Right column — main visual + floating proof (desktop) */}
        <div className="hidden w-full justify-center pb-2 lg:flex lg:w-1/2 lg:justify-end lg:pb-0">
          <BlurFade delay={0.18} offset={18} direction="left" className="w-full max-w-[560px]">
            <HeroImageSection />
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
