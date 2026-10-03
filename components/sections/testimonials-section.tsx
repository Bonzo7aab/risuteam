"use client";

import { useLayoutEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "@/components/icons/arrow-left";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { BlurFade } from "@/components/ui/blur-fade";

const testimonials = [
  {
    id: "1",
    quote:
      "Mój syn Tymek zyskał tyle pewności siebie na zajęciach Judo. Trenerzy są niesamowici! Kiedyś był nieśmiały, a teraz prowadzi rozgrzewkę.",
    author: "Anna Kowalska",
    childName: "Tymek",
    childAge: 6,
    relation: "mama" as const,
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
  },
  {
    id: "2",
    quote:
      "Córka uwielbia gimnastykę. Trenerki są cierpliwe i serdeczne. Widzę postępy z tygodnia na tydzień.",
    author: "Magdalena Wiśniewska",
    childName: "Zuzia",
    childAge: 5,
    relation: "mama" as const,
    avatar: "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100",
  },
  {
    id: "3",
    quote:
      "Świetna atmosfera, profesjonalna kadra. Syn z niecierpliwością czeka na każdy trening karate.",
    author: "Tomasz Nowak",
    childName: "Franek",
    childAge: 10,
    relation: "tata" as const,
    avatar: "https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=100",
  },
  {
    id: "4",
    quote:
      "Obozy letnie to strzał w dziesiątkę — dziecko wraca zmęczone, ale szczęśliwe i pełne wrażeń.",
    author: "Joanna Michalak",
    childName: "Olek",
    childAge: 9,
    relation: "mama" as const,
    avatar: "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=100",
  },
];

const STARS = Array(5).fill(0);

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {STARS.map((_, i) => (
        <span key={i} className="material-symbols-outlined text-primary text-lg">
          star
        </span>
      ))}
    </div>
  );
}

const MD_BREAKPOINT = 768;

const CARD_TINTS = [
  "",
  "bg-primary/6! dark:bg-[#2a2015]!",
  "bg-amber-50/80! dark:bg-[#2a2015]!",
] as const;

export function TestimonialsSection() {
  const [startIndex, setStartIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [direction, setDirection] = useState(1);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`);
    const sync = () => setCardsPerView(mq.matches ? 3 : 1);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const maxStart = Math.max(0, testimonials.length - cardsPerView);
  useLayoutEffect(() => {
    setStartIndex((i) => Math.min(i, maxStart));
  }, [maxStart]);

  const visible = testimonials.slice(startIndex, startIndex + cardsPerView);
  const dotCount = Math.ceil(testimonials.length / cardsPerView) || 1;
  const activeDot = Math.min(Math.floor(startIndex / cardsPerView), dotCount - 1);

  return (
    <section id="opinie" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <BlurFade inView delay={0.04} offset={10} blur="0px" className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black leading-[1.1] tracking-tight text-text-main dark:text-white mb-4">
          Opinie rodziców
        </h2>
        <p className="text-lg text-text-light dark:text-stone-400 max-w-2xl mx-auto mb-8">
          Zaufało nam już ponad <span className="text-primary font-bold">500 rodzin</span>. Zobacz, co mówią o treningach w Risu Team!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <StarRating />
          <div className="flex -space-x-2">
            {testimonials.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="relative w-8 h-8 rounded-full ring-2 ring-white shadow-xs dark:ring-stone-900 overflow-hidden bg-stone-200"
              >
                <Image
                  src={t.avatar}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
            ))}
          </div>
          <span className="text-sm font-bold text-text-main dark:text-white">
            4.9/5 Średnia ocen
          </span>
        </div>
      </BlurFade>

      <div className="mb-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => {
            setDirection(-1);
            setStartIndex((i) => Math.max(0, i - 1));
          }}
          disabled={startIndex === 0}
          className="flex size-10 items-center justify-center rounded-full bg-white text-text-main shadow-card ring-1 ring-black/4 transition-all duration-300 hover:-translate-y-0.5 hover:text-primary disabled:pointer-events-none disabled:opacity-50 motion-reduce:hover:translate-y-0 dark:bg-[#2a2015] dark:text-stone-300 dark:shadow-card-dark dark:ring-white/10"
          aria-label="Poprzednie opinie"
        >
          <ArrowLeftIcon className="text-[1.1em]" />
        </button>
        <button
          type="button"
          onClick={() => {
            setDirection(1);
            setStartIndex((i) => Math.min(maxStart, i + 1));
          }}
          disabled={startIndex >= maxStart}
          className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_20px_-6px_rgba(244,157,37,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50 motion-reduce:hover:translate-y-0"
          aria-label="Następne opinie"
        >
          <ArrowRightIcon className="text-[1.1em]" />
        </button>
      </div>

      <div className="mb-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={`${startIndex}-${cardsPerView}`}
            custom={direction}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "grid gap-6",
              cardsPerView === 1 ? "grid-cols-1" : "md:grid-cols-3",
            )}
          >
          {visible.map((t, idx) => {
            const variantIdx = (startIndex + idx) % 3;
            return (
              <article
                key={t.id}
                className={cn(
                  "risu-card risu-card-hover relative flex min-h-[240px] flex-col rounded-2xl p-6 sm:min-h-[280px] md:p-7",
                  CARD_TINTS[variantIdx],
                )}
              >
                <div className="absolute right-4 top-4 text-primary/20 dark:text-primary/25">
                  <span className="material-symbols-outlined text-5xl">format_quote</span>
                </div>
                <StarRating />
                <blockquote className="mt-3 flex-1 pr-8 leading-relaxed text-text-main dark:text-white">
                  „{t.quote}"
                </blockquote>
                <footer className="mt-4 flex items-center gap-3">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-stone-200 shadow-xs ring-2 ring-white dark:bg-stone-700 dark:ring-stone-800">
                    <Image
                      src={t.avatar}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <cite className="block text-sm font-bold not-italic text-text-main dark:text-white">
                      {t.author}
                    </cite>
                    <p className="text-xs uppercase tracking-wider text-text-light dark:text-stone-400">
                      {t.relation === "mama" ? "MAMA" : "TATA"} {t.childName.toUpperCase()} ({t.childAge}{" "}
                      LAT)
                    </p>
                  </div>
                </footer>
              </article>
            );
          })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: dotCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i * cardsPerView > startIndex ? 1 : -1);
              setStartIndex(i * cardsPerView);
            }}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300",
              i === activeDot ? "w-6 bg-primary" : "w-2.5 bg-stone-300 dark:bg-stone-600"
            )}
            aria-label={`Slajd ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
