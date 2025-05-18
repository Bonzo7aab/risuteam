import React from "react";

interface KarateRank {
  rank: string; // e.g., "9 KYU", "1 DAN"
  beltColor: string; // e.g., "Biały", "Czarny"
  color: string; // e.g., "Biały", "Czarny"
  neededTraining: string; // e.g., "Półtora miesiąca min. 12 treningów"
  criteria: string; // e.g., "Bez ograniczeń"
  age: string; // e.g., "Bez ograniczeń", "Min. 14 lat"
}

const KARATE_RANKS: KarateRank[] = [
  {
    rank: "9 KYU",
    beltColor: "Biały",
    color: "white",
    neededTraining: "Półtora miesiąca min. 12 treningów",
    criteria: "Bez ograniczeń",
    age: "Bez ograniczeń",
  },
  {
    rank: "8 KYU",
    beltColor: "Żółty",
    color: "yellow",
    neededTraining: "Trzy miesiące min. 24 treningi",
    criteria: "Umiejętność zastosowania najprostszych akcji i technik",
    age: "Bez ograniczeń",
  },
  {
    rank: "7 KYU",
    beltColor: "Pomarańczowy",
    color: "orange",
    neededTraining: "Trzy miesiące min. 24 treningi",
    criteria: "Dalszy rozwój podstawowych umiejętności technicznych",
    age: "Bez ograniczeń",
  },
  {
    rank: "6 KYU",
    beltColor: "Zielony",
    color: "green",
    neededTraining: "Trzy miesiące min. 24 treningi",
    criteria: "Dalszy rozwój podstawowych umiejętności technicznych",
    age: "Bez ograniczeń",
  },
  {
    rank: "5 KYU",
    beltColor: "Niebieski I",
    color: "blue",
    neededTraining: "Trzy miesiące min. 24 treningi",
    criteria: "Dalszy rozwój podstawowych umiejętności technicznych",
    age: "Bez ograniczeń",
  },
  {
    rank: "4 KYU",
    beltColor: "Niebieski II",
    color: "black",
    neededTraining: "Trzy miesiące min. 24 treningi",
    criteria: "Dalszy rozwój podstawowych umiejętności technicznych",
    age: "Bez ograniczeń",
  },
  {
    rank: "3 KYU",
    beltColor: "Brązowy I",
    color: "white",
    neededTraining: "Trzy miesiące min. 24 treningi",
    criteria:
      "Rozwój zdolności współzawodnictwa wg przepisów sędziowskich ITKF. Udział w zawodach z kalendarza PZKT.",
    age: "Bez ograniczeń",
  },
  {
    rank: "2 KYU",
    beltColor: "Brązowy II",
    color: "white",
    neededTraining: "Trzy miesiące min. 24 treningi",
    criteria:
      "Rozwój zdolności współzawodnictwa wg przepisów sędziowskich ITKF. Udział w zawodach z kalendarza PZKT.",
    age: "Bez ograniczeń",
  },
  {
    rank: "1 KYU",
    beltColor: "Brązowy III",
    color: "white",
    neededTraining: "Cztery miesiące min. 32 treningi",
    criteria:
      "Rozwój zdolności współzawodnictwa wg przepisów sędziowskich ITKF. Udział w zawodach z kalendarza PZKT.",
    age: "Bez ograniczeń",
  },
  {
    rank: "1 DAN",
    beltColor: "Czarny",
    color: "white",
    neededTraining: "Jeden rok min. 100 treningów",
    criteria:
      "Rozwój kime oraz realności technik. Udział w zawodach z kalendarza PZKT.",
    age: "Min. 14 lat",
  },
  {
    rank: "2 DAN",
    beltColor: "Czarny",
    color: "white",
    neededTraining: "Dwa lata min. 200 treningów",
    criteria:
      "Umiejętność indywidualnego wzmacniania preferowanych technik i akcji. Udział w zawodach z kalendarza PZKT.",
    age: "Min. 16 lat",
  },
  {
    rank: "3 DAN",
    beltColor: "Czarny",
    color: "white",
    neededTraining: "Trzy lata min. 300 treningów",
    criteria:
      "Umiejętność indywidualnego wzmacniania preferowanych technik i akcji. Udział w zawodach z kalendarza PZKT.",
    age: "Min. 21 lat",
  },
  {
    rank: "4 DAN",
    beltColor: "Czarny",
    color: "white",
    neededTraining: "Cztery lata",
    criteria:
      "Znajomość zasad ruchów ciała i technik oraz umiejętność ich zastosowania w różnych warunkach do tego stopnia, że można kierować przeciwnikiem. Licencjonowany instruktor PZKT.",
    age: "Min. 25 lat",
  },
  {
    rank: "5 DAN",
    beltColor: "Czarny",
    color: "white",
    neededTraining: "Pięć lat",
    criteria:
      "Dalsze pogłębianie zasad ruchów ciała i technik oraz ich rozwój zgodnie z indywidualną psychiką. Wybitne osiągnięcia szkoleniowe lub sportowe. Licencjonowany instruktor PZKT i ITKF.",
    age: "Min. 30 lat",
  },
  {
    rank: "6 DAN",
    beltColor: "Czarny",
    color: "white",
    neededTraining: "Sześć lat",
    criteria:
      "Dalszy nieprzerwany rozwój techniczny oraz wybitne osiągnięcia szkoleniowe lub sportowe. Licencjonowany instruktor PZKT i ITKF.",
    age: "Min. 36 lat",
  },
  {
    rank: "7 DAN",
    beltColor: "Czarny",
    color: "white",
    neededTraining: "Siedem lat",
    criteria:
      "Dalszy nieprzerwany rozwój techniczny oraz wybitne osiągnięcia szkoleniowe lub sportowe. Licencjonowany instruktor PZKT i ITKF.",
    age: "Min. 43 lat",
  },
  {
    rank: "8 DAN",
    beltColor: "Czarny",
    color: "white",
    neededTraining: "Osiem lat",
    criteria:
      "Dalszy nieprzerwany rozwój techniczny oraz wybitne osiągnięcia szkoleniowe lub sportowe. Licencjonowany instruktor PZKT i ITKF.",
    age: "Min. 51 lat",
  },
  {
    rank: "9 DAN",
    beltColor: "Czarny",
    color: "white",
    neededTraining: "Dziewięć lat",
    criteria:
      "Dalszy nieprzerwany rozwój techniczny oraz wybitne osiągnięcia szkoleniowe lub sportowe. Licencjonowany instruktor PZKT i ITKF.",
    age: "Min. 61 lat",
  },
  {
    rank: "10 DAN",
    color: "white",
    beltColor: "Czarny",
    neededTraining:
      "Jest to stopień oznaczający osiągnięcie ideału na drodze karate, w praktyce przyznawany pośmiertnie.",
    criteria: "", // Or a more descriptive string if preferred for consistency
    age: "", // Or a more descriptive string
  },
];

const Exams = () => {
  return (
    <div className="max-w-4xl mx-auto my-8 px-2 md:px-0">
      <div className="text-center text-2xl mb-16 flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">
          Egzaminy na pasy - zasady
        </h1>
      </div>
      <div className="flex pl-16 pb-4">
        <div className="basis-1/3 pl-1">Stopień oraz minimalny wiek</div>
        <div className="basis-1/3 pl-2">Zasadnicze kryteria</div>
        <div className="basis-1/3">Okres treningu między egzaminami</div>
      </div>
      {KARATE_RANKS.map((ranking, index) => (
        <div key={index} className="flex gap-x-6 group">
          <div className="relative last:after:hidden after:absolute after:top-10 after:bottom-0 after:start-5 after:w-0.5 after:-translate-x-[0.5px] after:transition-all after:duration-300 after:ease-in-out after:bg-risu-300 group-hover:after:bg-risu-700">
            <div className="relative z-10 size-10 flex justify-center items-center">
              <span
                className={`flex size-10 border-2 transition-all duration-300 ease-in-out border-risu-300 group-hover:border-risu-700 rounded-full bg-${ranking.color}-400`}
              />
            </div>
          </div>

          <div className="divide-x-2 group-hover:divide-black divide-risu-400/50 bg-risu-400/5 flex mb-8 rounded-md text-sm leading-6 border border-risu-600 group-hover:bg-risu-700 p-4 w-full transition-all duration-300 ease-in-out">
            <div className="basis-1/3">
              <h3 className="flex mb-2 font-semibold text-lg">
                {ranking.rank} - {ranking.beltColor}
              </h3>
              <div>
                <span className="text-gray-400">Wiek: </span>
                {ranking.age}
              </div>
            </div>
            <div className="basis-1/3 pl-4">
              <span className="text-sm">{ranking.criteria}</span>
            </div>
            <div className="basis-1/3 pl-4">{ranking.neededTraining}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Exams;
