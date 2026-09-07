"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import {
  MembershipPlanCard,
  MEMBERSHIP_PLAN,
} from "@/components/sections/membership-plan-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SIGNUP_HREF = "/dashboard/zapisy";

const bankDetails = {
  bankName: "Santander Bank Polska",
  accountNumber: "28 1090 1694 0000 0001 3471 6556",
  transferTitle: "Imię i Nazwisko Dziecka - Miesiąc",
};

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

export default function CennikPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* Hero */}
        <section className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-black leading-[1.15] tracking-tight text-text-main dark:text-white mb-4">
            Prosty <span className="text-primary">abonament</span>
          </h1>
          <p className="text-lg text-text-light dark:text-stone-400 max-w-xl">
            Jeden plan dla każdego małego mistrza. Przejrzysty cennik ze wszystkimi korzyściami w cenie.
          </p>
        </section>

        {/* Main: same as homepage membership + checkout card */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-16">
          <MembershipPlanCard className="bg-white dark:bg-stone-900/80 lg:h-full lg:justify-center" />

        </section>

        {/* Bank transfer card */}
        <section className="mb-16">
          <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50 shadow-soft overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">
                  Płatność przelewem
                </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-light dark:text-stone-500 mb-0.5">
                    Nazwa banku
                  </p>
                  <p className="text-text-main dark:text-stone-300 font-medium">
                    {bankDetails.bankName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-light dark:text-stone-500 mb-0.5">
                    Numer konta
                  </p>
                  <p className="text-text-main dark:text-stone-300 font-medium font-mono">
                    {bankDetails.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-light dark:text-stone-500 mb-0.5">
                    Tytuł przelewu
                  </p>
                  <p className="text-text-main dark:text-stone-300 font-medium">
                    {bankDetails.transferTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* FAQ */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white mb-1">
            Najczęściej zadawane pytania
          </h2>
          <p className="text-text-light dark:text-stone-400 mb-6">
            Wszystko o płatnościach i rozliczeniach
          </p>
          <Accordion type="single" collapsible className="space-y-2">
            {billingFaq.map((item, i) => (
              <AccordionItem
                key={i}
                value={`billing-${i}`}
                className="border rounded-xl px-4 bg-white dark:bg-stone-900/50 border-stone-200 dark:border-stone-700"
              >
                <AccordionTrigger className="text-left font-semibold text-text-main dark:text-white hover:no-underline py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-text-light dark:text-stone-400 pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
