import { Metadata } from "next";
import {
  CampHero,
  FeatureCards,
  DailyProgram,
  WhatToBringPricing,
  InstructorCards,
  CampGallery,
} from "@/components/obozy";
import { CampRegistrationClosedBanner } from "@/components/obozy/camp-registration-closed-banner";

export const metadata: Metadata = {
  title: "Półkolonie letnie Warszawa | Risu Team",
  description:
    "Aktywne półkolonie w Warszawie — sport, zabawy i nowe znajomości. Opieka od rana do popołudnia. Zapisz dziecko na półkolonie letnie.",
};

const HERO_IMAGE =
  "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=600";

const FEATURE_CARDS = [
  {
    icon: "sports_soccer",
    title: "Sport i ruch",
    description:
      "Treningi judo, gimnastyka, gry zespołowe i zajęcia na świeżym powietrzu. Każdy dzień to dawka zdrowego ruchu i dobrej zabawy.",
  },
  {
    icon: "celebration",
    title: "Zabawy i animacje",
    description:
      "Warsztaty plastyczne, gry integracyjne i atrakcje dostosowane do wieku. Dzieci nie mają czasu na nudę.",
  },
  {
    icon: "shield",
    title: "Bezpieczna opieka",
    description:
      "Kadra z doświadczeniem w pracy z dziećmi. Opieka od rana do popołudnia w małych grupach.",
  },
];

const DAILY_SCHEDULE = [
  {
    time: "08:00",
    title: "Przyjazd i powitanie",
    description: "Zbiórka, krótka rozgrzewka i plan dnia.",
  },
  {
    time: "09:00",
    title: "Zajęcia sportowe",
    description: "Trening judo, gimnastyka lub gry zespołowe.",
  },
  {
    time: "10:30",
    title: "Przerwa i drugie śniadanie",
    description: "Posiłek i chwila odpoczynku.",
  },
  {
    time: "11:00",
    title: "Zajęcia tematyczne",
    description: "Warsztaty, animacje lub wyjście na świeże powietrze.",
  },
  {
    time: "13:00",
    title: "Obiad",
    description: "Wspólny posiłek.",
    highlight: true,
  },
  {
    time: "14:00",
    title: "Zajęcia popołudniowe",
    description: "Gry, zabawy lub zajęcia ruchowe.",
  },
  {
    time: "16:00",
    title: "Odbiór dzieci",
    description: "Zakończenie dnia, odbiór przez rodziców.",
  },
];

const WHAT_TO_BRING = [
  "Ubrania na zmianę",
  "Obuwie sportowe",
  "Nakrycie głowy i krem z filtrem",
  "Bidon lub butelka na wodę",
  "Drugie śniadanie (opcjonalnie)",
  "Ręcznik i przybory toaletowe",
];

const PRICE_INCLUDED = [
  "Opieka od 08:00 do 16:00",
  "Obiad w cenie",
  "Program zajęć sportowych i animacji",
  "Ubezpieczenie NNW",
  "Materiały na warsztaty",
];

const INSTRUCTORS = [
  {
    name: "Piotr Nowak",
    role: "Główny trener Judo",
    image:
      "https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Anna Kowalska",
    role: "Trenerka gimnastyki, animatorka",
    image:
      "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

const GALLERY_IMAGES = [
  { src: HERO_IMAGE, alt: "Półkolonie letnie Warszawa" },
  {
    src: "https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Zajęcia sportowe",
  },
  {
    src: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Uczestnicy półkolonii",
  },
];

export default function PolkoloniePage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900/30">
      <CampRegistrationClosedBanner slug="polkolonie" />
      <CampHero
        badge="LATO 2025"
        titlePart1="Półkolonie letnie"
        titlePart2="Warszawa"
        image={HERO_IMAGE}
        imageAlt="Półkolonie letnie Risu Team w Warszawie"
        meta={[
          { icon: "calendar_today", text: "Lipiec–sierpień 2025" },
          { icon: "location_on", text: "Warszawa" },
          { icon: "person", text: "6–12 lat" },
        ]}
        ctaPrimary={{
          label: "Zapisz się teraz",
          href: "/obozy/polkolonie/rejestracja",
        }}
        ctaSecondary={{
          label: "Pobierz ofertę PDF",
          href: "#",
        }}
      />

      <FeatureCards
        title="Dlaczego półkolonie z nami?"
        subtitle="Aktywne półkolonie w Warszawie — sport, zabawy i nowe znajomości w bezpiecznej atmosferze."
        cards={FEATURE_CARDS}
      />

      <DailyProgram
        title="Program dnia"
        subtitle="Przykładowy plan dnia (może ulec zmianom)"
        items={DAILY_SCHEDULE}
      />

      <WhatToBringPricing
        whatToBringTitle="Co zabrać?"
        whatToBringItems={WHAT_TO_BRING}
        priceTitle="Cena"
        price="600 PLN / tydz."
        priceIncluded={PRICE_INCLUDED}
        bookButtonLabel="Zarezerwuj miejsce"
        bookButtonHref="/obozy/polkolonie/rejestracja"
        showDropdowns={true}
      />

      <section className="py-8 bg-stone-50 dark:bg-stone-900/30 border-t border-stone-200 dark:border-stone-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-stone-600 dark:text-stone-400">
          <p className="font-semibold text-stone-800 dark:text-stone-300 mb-2">
            Liczba miejsc ograniczona. Płatności wyłącznie przelewem na konto.
          </p>
          <p className="mb-1">
            Możliwość wykupienia pojedynczych tygodni. Zapisy na wybrane turnusy.
          </p>
          <p>
            Santander Bank: 28 1090 1694 0000 0001 3471 6556. Zapisy: 533-020-048
            / risu.biuro@gmail.com
          </p>
        </div>
      </section>

      <InstructorCards
        title="Kadra"
        subtitle="Doświadczeni trenerzy i animatorzy na półkoloniach."
        instructors={INSTRUCTORS}
      />

      <CampGallery
        title="Galeria z poprzednich edycji"
        mainImage={{
          src: HERO_IMAGE,
          alt: "Uczestnicy półkolonii letnich w Warszawie",
        }}
        gridImages={GALLERY_IMAGES}
      />
    </div>
  );
}
