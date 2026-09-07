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
  title: "Obóz rowerowy Mazury | Rowerowe Szaleństwo | Risu Team",
  description:
    "Intensywny obóz rowerowy dla dzieci 10–14 lat. Nauka techniki jazdy, serwisowania i bezpiecznego poruszania się w terenie. Mazury, sierpień.",
};

const HERO_IMAGE =
  "https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=600";

const FEATURE_CARDS = [
  {
    icon: "directions_bike",
    title: "Technika i bezpieczeństwo",
    description:
      "Nauka poprawnej techniki jazdy, serwis roweru i zasady bezpiecznego poruszania się po szlakach. Kadra z doświadczeniem w kolarstwie górskim i szosowym.",
  },
  {
    icon: "terrain",
    title: "Przygoda w terenie",
    description:
      "Wycieczki po Mazurach — lasy, ścieżki i trasy dostosowane do wieku. Codzienne wyprawy rowerowe z przewodnikiem.",
  },
  {
    icon: "groups",
    title: "Drużynowy duch",
    description:
      "Wspólne wyjazdy, gry na dwóch kółkach i wieczorne ogniska. Nowe przyjaźnie i wspomnienia na długie lata.",
  },
];

const DAILY_SCHEDULE = [
  {
    time: "08:00",
    title: "Śniadanie i rozruch",
    description: "Posiłek i krótka rozgrzewka przed wyjazdem.",
  },
  {
    time: "09:30",
    title: "Wycieczka rowerowa",
    description: "Trasa dostosowana do pogody i grupy. Nauka techniki w terenie.",
  },
  {
    time: "12:30",
    title: "Obiad i odpoczynek",
    description: "Posiłek i chwila na regenerację.",
    highlight: true,
  },
  {
    time: "14:30",
    title: "Zajęcia popołudniowe",
    description: "Serwis roweru, gry zespołowe lub druga krótsza trasa.",
  },
  {
    time: "18:00",
    title: "Kolacja i wieczór",
    description: "Wspólny posiłek, ognisko i podsumowanie dnia.",
  },
];

const WHAT_TO_BRING = [
  "Sprawny rower (lub wypożyczenie)",
  "Kask rowerowy",
  "Bidon i przekąski na trasę",
  "Ubrania na zmianę",
  "Kurtka przeciwdeszczowa",
  "Nakrycie głowy i krem z filtrem",
  "Ręcznik i przybory toaletowe",
];

const PRICE_INCLUDED = [
  "Zakwaterowanie na czas trwania obozu",
  "Pełne wyżywienie – 3 posiłki dziennie",
  "Opieka kadry i przewodników rowerowych",
  "Ubezpieczenie NNW",
  "Program zajęć i wycieczek",
];

const INSTRUCTORS = [
  {
    name: "Piotr Nowak",
    role: "Główny instruktor, kolarstwo górskie",
    image:
      "https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Anna Kowalska",
    role: "Trenerka, opieka wychowawcza",
    image:
      "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Michał Wiśniewski",
    role: "Instruktor techniki jazdy",
    image:
      "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

const GALLERY_IMAGES = [
  { src: HERO_IMAGE, alt: "Obóz rowerowy Mazury" },
  {
    src: "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Wycieczka rowerowa",
  },
  {
    src: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Uczestnicy obozu",
  },
];

export default function ZimoweObozPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900/30">
      <CampRegistrationClosedBanner slug="zimowe" />
      <CampHero
        badge="LATO 2025"
        titlePart1="Rowerowe Szaleństwo"
        titlePart2="Obóz rowerowy – Mazury"
        image={HERO_IMAGE}
        imageAlt="Obóz rowerowy Risu Team na Mazurach"
        meta={[
          { icon: "calendar_today", text: "5–12.08.2025" },
          { icon: "location_on", text: "Mazury, Polska" },
          { icon: "person", text: "10–14 lat" },
        ]}
        ctaPrimary={{
          label: "Zapisz się teraz",
          href: "/obozy/zimowe/rejestracja",
        }}
        ctaSecondary={{
          label: "Pobierz ofertę PDF",
          href: "#",
        }}
      />

      <FeatureCards
        title="Dlaczego ten obóz?"
        subtitle="Intensywny obóz rowerowy dla małych pasjonatów dwóch kółek — technika, przygoda i bezpieczeństwo."
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
        price="1 650 PLN"
        priceIncluded={PRICE_INCLUDED}
        bookButtonLabel="Zarezerwuj teraz"
        bookButtonHref="/obozy/zimowe/rejestracja"
        showDropdowns={true}
      />

      <section className="py-8 bg-stone-50 dark:bg-stone-900/30 border-t border-stone-200 dark:border-stone-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-stone-600 dark:text-stone-400">
          <p className="font-semibold text-stone-800 dark:text-stone-300 mb-2">
            Transport własny. Liczba miejsc ograniczona. Płatności wyłącznie przelewem na konto.
          </p>
          <p className="mb-1">
            Płatności w ratach: zaliczka 200 zł/os, kolejne raty do uzgodnienia.
          </p>
          <p>
            Santander Bank: 28 1090 1694 0000 0001 3471 6556. Zapisy: 533-020-048
            / risu.biuro@gmail.com
          </p>
        </div>
      </section>

      <InstructorCards
        title="Kadra instruktorska"
        subtitle="Doświadczeni instruktorzy i opieka na obozie rowerowym."
        instructors={INSTRUCTORS}
      />

      <CampGallery
        title="Galeria z poprzednich edycji"
        mainImage={{
          src: HERO_IMAGE,
          alt: "Uczestnicy obozu rowerowego na Mazurach",
        }}
        gridImages={GALLERY_IMAGES}
      />
    </div>
  );
}
