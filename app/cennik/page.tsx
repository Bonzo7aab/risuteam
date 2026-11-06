"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  DEFAULT_MONTHLY_FEE_GROSZE,
  formatPlnFromGrosze,
} from "@/lib/pricing";

const SIGNUP_HREF = "/dashboard/zapisy";

const bankDetails = {
  bankName: "Santander Bank Polska",
  accountNumber: "28 1090 1694 0000 0001 3471 6556",
  transferTitle: "Imię i Nazwisko Dziecka - Miesiąc",
};

const planFeatures = [
  "8 zajęć w miesiącu",
  "Judo, Karate lub Gimnastyka",
  "Grafik dopasowany do grupy",
  "Progres i wsparcie na każdym etapie",
] as const;

const highlights = [
  {
    icon: "event_available",
    title: "8 zajęć / miesiąc",
    text: "Stały pakiet treningów w wybranej dyscyplinie.",
  },
  {
    icon: "payments",
    title: "Płatność przelewem",
    text: "Prosty przelew na konto klubu — bez ukrytych opłat.",
  },
  {
    icon: "replay",
    title: "Odrabianie zajęć",
    text: "Niewykorzystane zajęcia możesz odrobić w uzgodnionym terminie.",
  },
] as const;

const startSteps = [
  "Załóż konto rodzica i dodaj profil dziecka.",
  "Wybierz zajęcia w grafiku lub zapisz się przez panel.",
  "Opłać abonament przelewem według danych poniżej.",
] as const;

const billingFaq = [
  {
    q: "Czy mogę anulować abonament w dowolnym momencie?",
    a: "Abonament miesięczny można wypowiedzieć z miesięcznym wyprzedzeniem. Abonament roczny podlega indywidualnym warunkom — skontaktuj się z nami.",
  },
  {
    q: "Co jeśli opuścimy zajęcia?",
    a: "Abonament obejmuje 8 zajęć w miesiącu. Jeśli dziecko nie uczestniczy, nie przepadają — można je odrobić w ciągu 2 miesięcy (po wcześniejszym uzgodnieniu).",
  },
  {
    q: "Czy ubezpieczenie jest obowiązkowe?",
    a: "Pełne ubezpieczenie sportowe jest wliczone w abonament i obejmuje uczestnika podczas zajęć. Nie trzeba wykupywać go osobno.",
  },
  {
    q: "Jak uzyskać zniżkę rodzinną?",
    a: "Przy zapisie drugiego dziecka z tej samej rodziny przysługuje 10% zniżki. Skontaktuj się z nami przez Zapisy lub Kontakt — dopasujemy ofertę.",
  },
];

function CopyField({
  label,
  value,
  icon,
  mono = false,
}: {
  label: string;
  value: string;
  icon: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        mono ? value.replace(/\s/g, "") : value
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/90 bg-stone-50/90 p-4 dark:border-white/12 dark:bg-black/20 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[20px]" aria-hidden>
              {icon}
            </span>
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
              {label}
            </p>
            <p
              className={cn(
                "mt-1.5 text-sm font-bold leading-snug text-text-main dark:text-white sm:text-[15px]",
                mono && "break-all font-mono tracking-[0.04em]"
              )}
            >
              {value}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 text-xs font-bold text-primary transition-colors hover:bg-primary/15 dark:border-primary/30 dark:bg-primary/15"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden>
            {copied ? "check" : "content_copy"}
          </span>
          {copied ? "Skopiowano" : "Kopiuj"}
        </button>
      </div>
    </div>
  );
}

export default function CennikPage() {
  const fee = useQuery(api.payments.getPublicMonthlyClassFee);
  const price = formatPlnFromGrosze(
    fee?.amountGrosze ?? DEFAULT_MONTHLY_FEE_GROSZE
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-background-dark">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40"
          aria-hidden
        >
          <div className="absolute -right-24 top-0 size-80 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -left-16 top-48 size-72 rounded-full bg-amber-200/25 blur-3xl dark:bg-amber-900/20" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-[calc(var(--risu-mobile-bottom-nav-h)+5.5rem)] pt-10 sm:px-6 md:pb-16 md:pt-16 lg:py-20">
          {/* Hero — price-led on mobile */}
          <header className="mb-10 md:mb-14 md:max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Cennik
            </p>
            <h1 className="mt-3 text-[2rem] font-black leading-[1.15] tracking-tight text-text-main dark:text-white sm:text-4xl md:text-5xl">
              Przejrzysty abonament,{" "}
              <span className="text-primary">bez niespodzianek</span>
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-stone-600 dark:text-stone-400 sm:mt-4 sm:text-base md:text-lg">
              Jeden miesięczny plan dla judo, karate lub gimnastyki — wszystko w
              cenie.
            </p>
          </header>

          {/* Plan + CTA block */}
          <section className="mb-12 md:mb-16">
            <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">
              <div className="relative overflow-hidden md:risu-card md:rounded-2xl md:p-8">
                <div className="pointer-events-none absolute -right-10 -top-10 hidden size-36 rounded-full bg-primary/10 blur-2xl md:block" aria-hidden />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                    <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                    Abonament miesięczny
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tight text-primary tabular-nums md:text-4xl">
                      {price}
                    </span>
                    <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">
                      / miesiąc
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 md:hidden">
                    Pełny pakiet treningów w wybranej dyscyplinie.
                  </p>

                  <ul className="mt-7 space-y-0 divide-y divide-stone-200/80 dark:divide-white/8 md:mt-6 md:space-y-3 md:divide-y-0">
                    {planFeatures.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0 md:py-0"
                      >
                        <span
                          className="material-symbols-outlined mt-0.5 text-[20px] text-primary"
                          aria-hidden
                        >
                          check_circle
                        </span>
                        <span className="text-[15px] font-medium leading-snug text-text-main dark:text-stone-200 md:text-sm md:font-normal md:text-stone-700 dark:md:text-stone-300">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 hidden gap-3 md:flex">
                    <Link
                      href={SIGNUP_HREF}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
                    >
                      Przejdź do zapisów
                      <ArrowRightIcon className="text-[1em]" />
                    </Link>
                    <Link
                      href="/kontakt"
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 text-sm font-bold text-text-main transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-white/14 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
                    >
                      Zapytaj o ofertę
                    </Link>
                  </div>
                </div>
              </div>

              {/* How to start — desktop sidebar / mobile section */}
              <div className="border-t border-stone-200/90 pt-10 dark:border-white/10 md:flex md:flex-col md:justify-between md:gap-6 md:rounded-2xl md:border md:border-orange-200/70 md:bg-white md:p-8 md:pt-8 md:shadow-card dark:md:border-white/12 dark:md:bg-surface-dark dark:md:shadow-card-dark">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    Jak zacząć
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-text-main dark:text-white">
                    Trzy proste kroki
                  </h2>
                  <ol className="mt-6 space-y-0 md:mt-5 md:space-y-4">
                    {startSteps.map((step, index) => (
                      <li
                        key={step}
                        className="relative flex gap-4 border-b border-stone-200/80 py-4 last:border-b-0 dark:border-white/8 md:border-0 md:py-0"
                      >
                        {index < startSteps.length - 1 ? (
                          <span
                            className="absolute left-[13px] top-11 hidden h-[calc(100%-0.5rem)] w-px bg-stone-200 dark:bg-white/12 md:block"
                            aria-hidden
                          />
                        ) : null}
                        <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-black text-primary-foreground">
                          {index + 1}
                        </span>
                        <span className="pt-0.5 text-[15px] leading-relaxed text-stone-600 dark:text-stone-300 md:text-sm">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <Link
                  href="/kontakt"
                  className="mt-8 hidden h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover md:inline-flex"
                >
                  Zapytaj o ofertę
                  <ArrowRightIcon className="text-[1em]" />
                </Link>
              </div>
            </div>
          </section>

          {/* Highlights */}
          <section className="mb-12 border-t border-stone-200/90 pt-10 dark:border-stone-800 md:mb-16 md:border-0 md:pt-0">
            <h2 className="mb-5 text-lg font-black tracking-tight text-text-main dark:text-white md:sr-only">
              Co obejmuje abonament
            </h2>
            <div className="grid gap-0 sm:grid-cols-3 sm:gap-4 md:gap-5">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3.5 border-b border-stone-200/80 py-4 last:border-b-0 dark:border-stone-800 sm:flex-col sm:border-0 sm:py-0 md:rounded-2xl md:border md:border-orange-200/70 md:bg-white/90 md:p-5 md:shadow-card dark:md:border-white/12 dark:md:bg-surface-dark/90 dark:md:shadow-card-dark"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <span
                      className="material-symbols-outlined text-[22px]"
                      aria-hidden
                    >
                      {item.icon}
                    </span>
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold text-text-main dark:text-white md:mt-4 md:text-base">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bank transfer */}
          <section className="mb-12 border-t border-stone-200/90 pt-10 dark:border-white/10 md:mb-16 md:rounded-2xl md:border md:border-orange-200/70 md:bg-white md:pt-0 md:shadow-card dark:md:border-white/12 dark:md:bg-surface-dark dark:md:shadow-card-dark">
            <div className="md:border-b md:border-stone-100 md:px-8 md:py-5 dark:md:border-white/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    Rozliczenia
                  </p>
                  <h2 className="mt-1 text-xl font-black tracking-tight text-text-main dark:text-white sm:text-2xl">
                    Dane do przelewu
                  </h2>
                  <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
                    Płatności wyłącznie przelewem bankowym.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-stone-50 px-3 py-1.5 text-xs font-bold text-stone-600 dark:border-white/12 dark:bg-black/20 dark:text-stone-300">
                  <span
                    className="material-symbols-outlined text-[16px] text-primary"
                    aria-hidden
                  >
                    lock
                  </span>
                  Przelew tradycyjny
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:mt-0 md:grid-cols-3 md:gap-4 md:p-8">
              <CopyField
                label="Nazwa banku"
                value={bankDetails.bankName}
                icon="account_balance"
              />
              <CopyField
                label="Numer konta"
                value={bankDetails.accountNumber}
                icon="credit_card"
                mono
              />
              <CopyField
                label="Tytuł przelewu"
                value={bankDetails.transferTitle}
                icon="edit_note"
              />
            </div>
          </section>

          {/* FAQ */}
          <section>
            <div className="mb-5 max-w-2xl md:mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                FAQ
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-text-main dark:text-white md:text-3xl">
                Pytania o płatności
              </h2>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                Abonament, odrabianie zajęć i zniżki rodzinne.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {billingFaq.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  value={`billing-${i}`}
                  className={cn(
                    "border-b border-stone-200/80 px-0 last:border-b-0 dark:border-stone-800",
                    "md:mb-3 md:overflow-hidden md:rounded-2xl md:border md:border-orange-200/70 md:bg-white md:px-5 md:shadow-card md:last:mb-0 md:last:border",
                    "dark:md:border-white/12 dark:md:bg-surface-dark dark:md:shadow-card-dark"
                  )}
                >
                  <AccordionTrigger className="py-4 text-left text-[15px] font-bold leading-snug text-text-main hover:no-underline dark:text-white md:py-5 md:text-base">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400 md:pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </div>

      {/* Mobile sticky CTA — sits above the site bottom nav */}
      <div
        className="fixed inset-x-0 z-40 border-t border-stone-200/80 bg-[#FDFBF7]/95 px-4 py-3 backdrop-blur-md dark:border-stone-800 dark:bg-background-dark/95 md:hidden"
        style={{ bottom: "var(--risu-mobile-bottom-nav-h)" }}
      >
        <div className="mx-auto flex max-w-lg gap-2">
          <Link
            href={SIGNUP_HREF}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm"
          >
            Zapisz się
            <ArrowRightIcon className="text-[1em]" />
          </Link>
          <Link
            href="/kontakt"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-text-main dark:border-white/12 dark:bg-surface-dark dark:text-white"
          >
            Kontakt
          </Link>
        </div>
      </div>
    </div>
  );
}
