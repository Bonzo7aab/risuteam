import Link from "next/link";
import { Metadata } from "next";
import { ZapisyPageContent } from "./zapisy-page-content";

export const metadata: Metadata = {
  title: "Zapisy | Risu Team",
  description:
    "Zapisz dziecko na zajęcia lub obóz — abonament miesięczny, grupy i rejestracje",
};

const steps = [
  {
    step: 1,
    title: "Wybierz abonament",
    description:
      "Abonament miesięczny 240 zł — 8 zajęć. Judo, Karate lub Gimnastyka. Szczegóły i zniżki dla rodzeństwa w Cenniku.",
    href: "/cennik",
    cta: "Zobacz cennik",
    icon: "payments",
  },
  {
    step: 2,
    title: "Moje dzieci",
    description:
      "Dodaj dziecko w panelu, jeśli jeszcze nie ma profilu. Dzięki temu dopasujemy grupę wiekową i dyscyplinę.",
    href: "/dashboard/dzieci",
    cta: "Moje dzieci",
    icon: "group",
  },
  {
    step: 3,
    title: "Potwierdź zapis",
    description:
      "Skontaktuj się z nami, aby dokończyć zapis i dopasować grupę oraz termin. Odpowiadamy w ciągu 24h.",
    href: "/kontakt",
    cta: "Kontakt",
    icon: "mail",
  },
];

export default function ZapisyPage() {
  return (
    <div className="max-w-[800px]">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-text-main dark:text-white mb-2">
          Zapisy
        </h1>
        <p className="text-lg text-text-light dark:text-stone-400">
          Zapisz dziecko na zajęcia (abonament), obóz lub nocowankę. Wybierz zakładkę poniżej.
        </p>
      </div>

      <ZapisyPageContent steps={steps} />

      <div className="mt-10 text-center">
        <Link
          href="/grafik"
          className="inline-flex items-center gap-2 text-text-light dark:text-stone-400 hover:text-primary font-medium text-sm"
        >
          <span className="material-symbols-outlined text-lg">schedule</span>
          Zobacz grafik zajęć
        </Link>
      </div>
    </div>
  );
}
