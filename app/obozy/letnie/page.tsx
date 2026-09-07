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
  title: "Letni obóz Zakopane | Risu Team",
  description:
    "Rodzinny obóz w Zakopanem — treningi judo i karate, wycieczki w góry, Willa Basieńka. Zapisz się na letni obóz.",
};

const HERO_IMAGE = "/zakopane_2025_ver2_1.jpg";

const FEATURE_CARDS = [
  {
    icon: "fitness_center",
    title: "Pro coaching",
    description:
      "Treningi judo i karate dla dzieci, ćwiczenia wzmacniające dla dorosłych — kadra z wieloletnim doświadczeniem. Każdy znajdzie coś dla siebie.",
  },
  {
    icon: "terrain",
    title: "Przygoda na co dzień",
    description:
      "Wyjścia w góry i doliny, wizyta w Aqua Parku, gry zespołowe i spotkanie z góralskim gawędziarzem. Tatry i okolice Zakopanego czekają.",
  },
  {
    icon: "groups",
    title: "Nowe przyjaźnie",
    description:
      "Integracja rodzin, wieczorne ogniska, dyskoteka i animacje. Wspólnie tworzymy wspomnienia na długie lata.",
  },
];

const DAILY_SCHEDULE = [
  {
    time: "08:00",
    title: "Poranny rozruch",
    description: "Łagodna gimnastyka i rozruch na dobry początek dnia.",
  },
  {
    time: "09:00",
    title: "Trening judo / karate",
    description: "Zajęcia na macie dla dzieci i dorosłych.",
  },
  {
    time: "10:30",
    title: "Wycieczka lub gry zespołowe",
    description: "Wyjście w góry, doliny lub zabawy na świeżym powietrzu.",
  },
  {
    time: "13:00",
    title: "Obiad i sjesta",
    description: "Posiłek i chwila odpoczynku.",
    highlight: true,
  },
  {
    time: "15:00",
    title: "Zajęcia popołudniowe",
    description: "Warsztaty, animacje lub Aqua Park.",
  },
  {
    time: "19:00",
    title: "Kolacja i wieczór",
    description: "Wspólny posiłek, ognisko lub dyskoteka.",
  },
];

const WHAT_TO_BRING = [
  "Ubrania na zmianę",
  "Dobre buty do chodzenia",
  "Koszulka na trening",
  "Strój kąpielowy",
  "Ręcznik",
  "Nakrycie głowy",
  "Krem z filtrem",
];

const PRICE_INCLUDED = [
  "Zakwaterowanie 7 noclegów w Willi Basieńka",
  "Pełne wyżywienie – 3 posiłki dziennie",
  "Opieka kadry wychowawczej i trenerskiej",
  "Ubezpieczenie NNW",
  "Program zajęć i atrakcji",
];

const INSTRUCTORS = [
  {
    name: "Piotr Nowak",
    role: "Główny trener Judo, 2 dan",
    image:
      "https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Anna Kowalska",
    role: "Trenerka gimnastyki",
    image:
      "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Michał Wiśniewski",
    role: "Trener Karate",
    image:
      "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Katarzyna Lewandowska",
    role: "Asystentka trenera",
    image:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

const GALLERY_IMAGES = [
  { src: "/zakopane_2025_ver2_2.jpg", alt: "Obóz Zakopane" },
  { src: "/willabasienka.jpg", alt: "Willa Basieńka" },
  { src: "/zakopane_2025_ver2_1.jpg", alt: "Trening w górach" },
  { src: "/zakopane_2025_ver2_2.jpg", alt: "Uczestnicy obozu" },
];

export default function LetniObozPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900/30">
      <CampRegistrationClosedBanner slug="letnie" />
      <CampHero
        badge="LATO 2025"
        titlePart1="Letni Obóz Judo i Przygoda"
        titlePart2="Zakopane 2025"
        image={HERO_IMAGE}
        imageAlt="Letni obóz Risu Team w Zakopanem"
        meta={[
          { icon: "calendar_today", text: "5–12.07.2025" },
          { icon: "location_on", text: "Zakopane, Polska" },
          { icon: "person", text: "Rodziny z dziećmi" },
        ]}
        ctaPrimary={{
          label: "Zapisz się teraz",
          href: "/obozy/letnie/rejestracja",
        }}
        ctaSecondary={{
          label: "Pobierz ofertę PDF",
          href: "#",
        }}
      />

      <FeatureCards
        title="Dlaczego ten obóz?"
        subtitle="Rodzinny wypoczynek w sercu Tatr — sport, przygoda i wspólny czas."
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
        priceTitle="Cena wyjazdu"
        price="2 190 PLN"
        priceIncluded={PRICE_INCLUDED}
        bookButtonLabel="Zarezerwuj teraz"
        bookButtonHref="/obozy/letnie/rejestracja"
        showDropdowns={true}
      />

      {/* Payment details – compact */}
      <section className="py-8 bg-stone-50 dark:bg-stone-900/30 border-t border-stone-200 dark:border-stone-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-stone-600 dark:text-stone-400">
          <p className="font-semibold text-stone-800 dark:text-stone-300 mb-2">
            Transport własny. Liczba miejsc ograniczona. Płatności wyłącznie przelewem na konto.
          </p>
          <p className="mb-1">
            Płatności w ratach: zaliczka 200 zł/os, kolejne raty do 15.05, 15.06
            i 1.07.2025.
          </p>
          <p>
            Santander Bank: 28 1090 1694 0000 0001 3471 6556. Zapisy: 533-020-048
            / risu.biuro@gmail.com
          </p>
        </div>
      </section>

      <InstructorCards
        title="Kadra instruktorska"
        subtitle="Doświadczeni trenerzy i wychowawcy na obozie."
        instructors={INSTRUCTORS}
      />

      <CampGallery
        title="Galeria z poprzednich lat"
        mainImage={{
          src: HERO_IMAGE,
          alt: "Uczestnicy obozu w Zakopanem",
        }}
        gridImages={GALLERY_IMAGES}
      />
    </div>
  );
}
