import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { RisuTeamLogoTitleMark } from "@/components/brand/risu-team-logo-title";

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
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: "center 28%" }}
          decoding="async"
        />
      ) : (
        <Image
          src={HERO_MAIN_IMAGE}
          alt="Risu Team — zajęcia dla dzieci"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) min(90vw, 380px), 380px"
          style={{ objectPosition: "center 28%" }}
        />
      )}
    </div>
  );
}

function FloatingProofCard() {
  return (
    <div
      className="absolute bottom-5 right-0 z-10 flex max-w-[min(100%,280px)] translate-x-3 items-center gap-3 rounded-3xl bg-white p-3.5 pr-4 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.18)] dark:border dark:border-stone-700 dark:bg-stone-900 dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.45)] sm:bottom-7 sm:translate-x-6 sm:gap-3.5 sm:p-4"
    >
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/80"
        aria-hidden
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-inner ring-2 ring-emerald-500/30">
          <Check className="size-4 stroke-[3]" strokeLinecap="round" strokeLinejoin="round" />
        </span>
      </div>
      <div className="min-w-0 text-left">
        <p className="text-base font-bold leading-tight tracking-tight text-text-main dark:text-stone-100 sm:text-lg">
          Ponad 500+
        </p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 sm:text-[11px]">
          Zadowolonych dzieci
        </p>
      </div>
    </div>
  );
}

function HeroImageSection() {
  return (
    <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[380px]">
      <div className="relative aspect-square overflow-hidden rounded-3xl shadow-[0_20px_50px_-20px_rgba(15,23,42,0.2)] ring-1 ring-black/5 dark:ring-white/10">
        <MainHeroImage />
      </div>
      <FloatingProofCard />
    </div>
  );
}

function HeroCtaButtons({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Link
        href="/dashboard/zapisy"
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_8px_24px_-6px_rgba(244,157,37,0.55)] transition-all hover:bg-primary-hover"
      >
        Zapisz się
        <ArrowRightIcon className="text-[1.15em]" />
      </Link>

    </div>
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
            <div className="relative h-[calc(100svh-5.25rem-env(safe-area-inset-bottom)+2.5rem)] min-h-[36rem] w-full">
              <MainHeroImage />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.12)_0%,rgba(15,23,42,0.5)_42%,rgba(33,25,16,0.86)_82%,rgba(33,25,16,1)_100%)]" />
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(33,25,16,0.92)_0%,rgba(33,25,16,0.55)_22%,rgba(33,25,16,0.15)_42%,transparent_58%)]"
                aria-hidden
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-soft-light" />
              <div className="absolute inset-x-0 top-0 z-10 flex justify-center px-5 pt-[max(env(safe-area-inset-top),1rem)]">
                <RisuTeamLogoTitleMark priority />
              </div>
              <div className="absolute inset-x-0 bottom-16 mx-auto max-w-xl px-6 pt-16 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-text-main shadow-md">
                  <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                  Rozpocznij sezon
                </div>
                <h1 className="w-full text-4xl font-black leading-[1.04] tracking-tight text-white">
                  Uwolnij moc
                  <br />
                  <span className="text-primary">swojego dziecka</span>
                  <br />
                  <span className="text-white">z nami!</span>
                </h1>
                <p className="mt-4 w-full text-base font-medium leading-relaxed text-white/88">
                  Bezpieczne, energiczne zajęcia z sztuk walki i gimnastyki dla dzieci w każdym wieku.
                </p>
                <HeroCtaButtons className="mt-6 flex flex-col gap-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Left column (desktop) */}
        <div className="hidden w-full flex-col gap-5 text-center lg:flex lg:w-1/2 lg:text-left">
          <div className="inline-flex items-center justify-center self-center rounded-full border border-orange-200/80 bg-orange-100/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-900 dark:border-orange-800/60 dark:bg-orange-950/50 dark:text-orange-100 lg:self-start">
            Rozpocznij przygodę
          </div>

          <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-text-main dark:text-white sm:text-5xl lg:text-6xl">
            Uwolnij moc
            <br />
            <span className="text-primary italic">swojego dziecka</span>{" "}
            <span className="text-primary not-italic">z Risu!</span>
          </h1>

          <p className="mx-auto max-w-xl text-base font-medium leading-relaxed text-stone-600 dark:text-stone-300 lg:mx-0 lg:text-lg">
            Bezpieczne, energiczne zajęcia z sztuk walki i gimnastyki dla dzieci w każdym wieku.
            Buduj pewność siebie, dyscyplinę i zawieraj nowe przyjaźnie!
          </p>

          <HeroCtaButtons className="flex flex-col justify-center gap-3 pt-2 sm:flex-row sm:gap-4 lg:justify-start" />
        </div>

        {/* Right column — main visual + floating proof (desktop) */}
        <div className="hidden w-full justify-center pb-2 lg:flex lg:w-1/2 lg:justify-end lg:pb-0">
          <HeroImageSection />
        </div>
      </div>
    </section>
  );
}
