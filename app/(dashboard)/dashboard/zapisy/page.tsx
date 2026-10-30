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
    title: "Sprawdź cennik",
    description:
      "Abonament miesięczny obejmuje 8 zajęć — judo, karate lub gimnastyka. Szczegóły i zniżki dla rodzeństwa znajdziesz w Cenniku.",
    href: "/cennik",
    cta: "Zobacz cennik",
    icon: "payments",
  },
  {
    step: 2,
    title: "Dodaj dziecko",
    description:
      "Utwórz profil dziecka w panelu, aby dopasować grupę wiekową i dyscyplinę przy zapisie.",
    href: "/dashboard/dzieci",
    cta: "Moje dzieci",
    icon: "group",
  },
  {
    step: 3,
    title: "Zapisz na zajęcia",
    description:
      "Wybierz grupę w grafiku lub skontaktuj się z nami — pomożemy dobrać termin.",
    href: "/grafik",
    cta: "Otwórz grafik",
    icon: "calendar_month",
  },
];

export default function ZapisyPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-2 max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          Panel rodzica
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-text-main dark:text-white md:text-4xl">
          Zapisy
        </h1>
      </header>

      <ZapisyPageContent steps={steps} />
    </div>
  );
}
