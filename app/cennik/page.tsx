"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { MembershipPlanCard } from "@/components/sections/membership-plan-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const SIGNUP_HREF = "/dashboard/zapisy";

const bankDetails = {
  bankName: "Santander Bank Polska",
  accountNumber: "28 1090 1694 0000 0001 3471 6556",
  transferTitle: "Imię i Nazwisko Dziecka - Miesiąc",
};

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
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/40">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
          {label}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden>
            {copied ? "check" : "content_copy"}
          </span>
          {copied ? "Skopiowano" : "Kopiuj"}
        </button>
      </div>
      <p
        className={cn(
          "text-sm font-semibold text-text-main dark:text-stone-100 sm:text-base",
          mono && "font-mono tracking-tight"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function CennikPage() {
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

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:py-20">
          <header className="mb-10 max-w-3xl md:mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Cennik
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-text-main dark:text-white md:text-5xl">
              Przejrzysty abonament,{" "}
              <span className="text-primary">bez niespodzianek</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-stone-400 sm:text-lg">
              Jeden miesięczny plan dla zajęć judo, karate lub gimnastyki —
              ze wszystkimi korzyściami w cenie.
            </p>
          </header>

          <section className="mb-12 grid gap-4 sm:grid-cols-3 md:mb-16">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-stone-200/80 bg-white/90 p-5 shadow-card dark:border-stone-800 dark:bg-[#2a2015]/90 dark:shadow-card-dark"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[22px]" aria-hidden>
                    {item.icon}
                  </span>
                </span>
                <h2 className="mt-4 text-base font-bold text-text-main dark:text-white">
                  {item.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                  {item.text}
                </p>
              </div>
            ))}
          </section>

          <section className="mb-14 grid items-stretch gap-6 lg:mb-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">
            <MembershipPlanCard className="h-full bg-white dark:bg-[#2a2015]" />

            <div className="flex flex-col justify-between gap-6 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark sm:p-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  Jak zacząć
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-text-main dark:text-white">
                  Zapisz dziecko w kilku krokach
                </h2>
                <ol className="mt-5 space-y-4">
                  {[
                    "Załóż konto rodzica i dodaj profil dziecka.",
                    "Wybierz zajęcia w grafiku lub zapisz się przez panel.",
                    "Opłać abonament przelewem według danych poniżej.",
                  ].map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={SIGNUP_HREF}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
                >
                  Przejdź do zapisów
                  <ArrowRightIcon className="text-[1em]" />
                </Link>
                <Link
                  href="/kontakt"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 text-sm font-bold text-text-main transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-950/40 dark:text-white dark:hover:bg-stone-900"
                >
                  Zapytaj o ofertę
                </Link>
              </div>
            </div>
          </section>

          <section className="mb-14 md:mb-16">
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark">
              <div className="border-b border-stone-100 px-6 py-5 dark:border-stone-800 sm:px-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                      Rozliczenia
                    </p>
                    <h2 className="mt-1 text-xl font-black tracking-tight text-text-main dark:text-white sm:text-2xl">
                      Dane do przelewu
                    </h2>
                    <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
                      Płatności przyjmujemy wyłącznie przelewem bankowym.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden>
                      account_balance
                    </span>
                    Przelew
                  </span>
                </div>
              </div>

              <div className="grid gap-3 p-6 sm:grid-cols-1 sm:p-8 md:grid-cols-3">
                <CopyField label="Nazwa banku" value={bankDetails.bankName} />
                <CopyField
                  label="Numer konta"
                  value={bankDetails.accountNumber}
                  mono
                />
                <CopyField
                  label="Tytuł przelewu"
                  value={bankDetails.transferTitle}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="mb-6 max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                FAQ
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-text-main dark:text-white md:text-3xl">
                Najczęściej zadawane pytania
              </h2>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 sm:text-base">
                Wszystko o płatnościach, rozliczeniach i warunkach abonamentu.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {billingFaq.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  value={`billing-${i}`}
                  className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white px-5 shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark"
                >
                  <AccordionTrigger className="py-5 text-left text-sm font-bold text-text-main hover:no-underline dark:text-white sm:text-base">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </div>
    </div>
  );
}
