"use client";

import { useState, type ReactNode } from "react";

type TabId = "zajecia" | "obozy";

type Props = {
  initialTab: TabId;
};

const tabs: { id: TabId; label: string }[] = [
  { id: "zajecia", label: "Regulamin zajec" },
  { id: "obozy", label: "Regulamin obozow i nocowanek" },
];

function CardWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 md:p-10">
      {children}
    </div>
  );
}

function DocDisclaimer() {
  return (
    <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/40 mb-6">
      <p className="text-sm text-text-light dark:text-stone-400">
        Dokument jest szablonem i powinien zostać dostosowany do realnych zasad klubu (m.in. terminy,
        cennik, zasady zwrotow, zapisy oraz wymagania organizacyjne). W przypadku wdrozenia
        regulaminu prawnego skonsultuj go z profesjonalnym prawnikiem.
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-lg font-bold text-text-main dark:text-white mt-7 mb-3">
      {children}
    </h3>
  );
}

function RegulaminZajec() {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white">
        Regulamin zajec dla dzieci
      </h2>
      <p className="text-text-light dark:text-stone-400 mt-3 text-sm md:text-base">
        Okresla zasady uczestnictwa w zajeciach sportowych organizowanych przez{" "}
        <span className="font-semibold text-text-main dark:text-white">
          {"{{CLUB_NAME}}"}
        </span>
        .
      </p>

      <DocDisclaimer />

      <SectionTitle>1. Postanowienia ogolne</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Organizatorem zajec jest{" "}
          <span className="font-semibold text-text-main dark:text-white">
            {"{{CLUB_NAME}}"}
          </span>{" "}
          z siedziba przy ul.{" "}
          <span className="font-semibold">{"{{ADDRESS}}"}</span> (dalej: „Klub”).
        </li>
        <li>
          Zajecia obejmuja treningi/dyscypliny prowadzone w grupach dzieci oraz mlodziezy, w tym m.in.
          Judo, Karate i gimnastyke.
        </li>
        <li>
          Uczestnikiem zajec jest dziecko, ktore zostalo zapisane przez rodzica/opiekuna prawnego.
        </li>
      </ol>

      <SectionTitle>2. Zasady zapisu i uczestnictwa</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Zapis odbywa sie w formie internetowej lub kontaktowej, zgodnie z aktualnymi instrukcjami
          dostępnymi na stronie Klubu.
        </li>
        <li>
          Rodzic/opiekun prawny zobowiazuje sie do podania aktualnych danych dziecka oraz informacji
          istotnych dla bezpieczenstwa (w szczegolnosci alergie, choroby przewlekle, zalecenia
          dotyczace wysilku).
        </li>
        <li>
          O zakwalifikowaniu dziecka do grupy decyduje trener oraz aktualna dostepnosc miejsc,
          uwzgledniajac wiek, poziom umiejetnosci oraz bezpieczenstwo treningu.
        </li>
      </ol>

      <SectionTitle>3. Prawa i obowiazki rodzica/opiekuna</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Rodzic/opiekun jest zobowiazany do doprowadzenia i odebrania dziecka w umowionym czasie,
          w miejscu prowadzenia zajec.
        </li>
        <li>
          Rodzic/opiekun odpowiada za terminowe uiszczanie oplat zgodnie z cennikiem i wybranym wariantem
          (abonament/plan).
        </li>
        <li>
          W przypadku wystapienia przeciwwskazan zdrowotnych rodzic/opiekun niezwlocznie informuje Klub
          przed planowanym treningiem lub w dniu zajec, w zaleznosci od mozliwosci kontaktu.
        </li>
        <li>
          Rodzic/opiekun wyraza zgody wymagane w procesie zapisu, w tym na udzielenie pierwszej pomocy
          i/lub zabiegow medycznych w razie koniecznosci, oraz zgodę na fotografowanie/publikacje wizerunku
          (jesli dotyczy).
        </li>
      </ol>

      <SectionTitle>4. Zasady bezpieczenstwa</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Dziecko uczestniczy w zajeciach w stroju sportowym oraz w obuwiu wskazanym przez Klub.
        </li>
        <li>
          Podczas treningow dziecko powinno wykonywac polecenia trenera i dbac o bezpieczenstwo w grupie
          (bez biegana po sali, bez uzywania sprzetu bez zgody trenera).
        </li>
        <li>
          W razie kontuzji lub pogorszenia samopoczucia trener podejmuje odpowiednie kroki i kontaktuje sie
          z rodzicem/opiekunem.
        </li>
      </ol>

      <SectionTitle>5. Dyscyplina i zasady wspolpracy</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Klub ma prawo wprowadzic zasady porzadkowe wynikajace z charakteru treningow oraz regulaminu obiektu,
          w ktorym odbywaja sie zajecia.
        </li>
        <li>
          W przypadku zachowan zagrażajacych bezpieczenstwu innych uczestnikow, Klub moze zastosowac
          upomnienie, rozmowe z rodzicem/opiekunem, a w sytuacjach skrajnych - czasowe wylaczenie z zajec.
        </li>
      </ol>

      <SectionTitle>6. Oplaty, zwroty i rezygnacja</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Szczegolowe zasady platnosci (kwoty, terminy, tytul przelewu) okresla cennik Klubu i potwierdzenie rejestracji.
        </li>
        <li>
          Rezygnacja/wypowiedzenie powinny byc zgloszone z zachowaniem okresu rozliczeniowego wskazanego w cenniku.
        </li>
      </ol>

      <SectionTitle>7. Ochrona danych osobowych i wizerunek</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Administratorem danych jest Klub. Dane przetwarzane sa w celu realizacji umowy/uczestnictwa oraz obslugi zapisu.
        </li>
        <li>
          Szczegolowe zasady przetwarzania danych i prawa osob, ktorych dane dotycza, opisuje odrebny dokument
          „Polityka prywatnosci”.
        </li>
        <li>
          Zgody na publikacje wizerunku przysluguja na podstawie oswiadczen rodzica/opiekuna i moga byc wycofane
          w sposob wskazany w polityce prywatnosci.
        </li>
      </ol>

      <SectionTitle>8. Postanowienia koncowe</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Klub zastrzega sobie prawo do zmiany regulaminu w razie uzasadnionych powodow organizacyjnych
          lub prawnych. Zmiany beda publikowane na stronie internetowej.
        </li>
        <li>
          W sprawach nieuregulowanych regulaminem zastosowanie maja przepisy prawa powszechnie obowiazujace.
        </li>
      </ol>

      <p className="text-xs text-stone-500 dark:text-stone-400 mt-8">
        Wzor do uzupelnienia: {"{{NIP}}"}, {"{{CONTACT_EMAIL}}"}, {"{{CONTACT_PHONE}}"}.
      </p>
    </div>
  );
}

function RegulaminObozyINocowanki() {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white">
        Regulamin obozow i nocowanek
      </h2>
      <p className="text-text-light dark:text-stone-400 mt-3 text-sm md:text-base">
        Okresla zasady uczestnictwa w obozach sportowych oraz nocowankach organizowanych przez{" "}
        <span className="font-semibold text-text-main dark:text-white">
          {"{{CLUB_NAME}}"}
        </span>
        .
      </p>

      <DocDisclaimer />

      <SectionTitle>1. Postanowienia ogolne</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Organizatorem jest{" "}
          <span className="font-semibold text-text-main dark:text-white">
            {"{{CLUB_NAME}}"}
          </span>{" "}
          z siedziba przy ul. <span className="font-semibold">{"{{ADDRESS}}"}</span>.
        </li>
        <li>
          Obozy/nocowanki prowadzone sa przez wykwalifikowana kadre trenerska oraz osoby odpowiedzialne za opieke
          nad uczestnikami.
        </li>
        <li>
          Uczestnikiem jest dziecko zapisane przez rodzica/opiekuna prawnego.
        </li>
      </ol>

      <SectionTitle>2. Warunki uczestnictwa</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Zapis odbywa sie zgodnie z formularzem rejestracji oraz dostepnoscia miejsc.
        </li>
        <li>
          Rodzic/opiekun prawny jest zobowiazany do przekazania kompletu informacji zdrowotnych,
          w tym alergii, chorob przewleklych, wad postawy, zalecen dotyczacych wysilku oraz informacji o potrzebie
          lekow (jesli dotyczy).
        </li>
        <li>
          W przypadku przeciwwskazan zdrowotnych Klub moze odmowic udzialu w obozie/nocowance lub zastosowac
          ograniczenia organizacyjne (po weryfikacji z opiekunem/rodzicem).
        </li>
      </ol>

      <SectionTitle>3. Zgody i dokumentacja</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Rodzic/opiekun wyraza zgody wymagane w procesie zapisow, w szczegolnosci na udzielenie pierwszej pomocy
          i/lub zabiegow medycznych w razie koniecznosci.
        </li>
        <li>
          Jesli dziecko wymaga podawania lekow, rodzic/opiekun zobowiazany jest przekazac je w opakowaniach
          zgodnych z zaleceniami, wraz z instrukcja dawkowania oraz wskazaniem osoby odpowiedzialnej za podanie
          (zgodnie z ustaleniami organizatora).
        </li>
      </ol>

      <SectionTitle>4. Obowiazki rodzica/opiekuna</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Przekazac dziecku komplet wyposazenia zgodnie z lista przygotowana przez Klub (w tym odziez, obuwie,
          srodki higieny, rzeczy osobiste oraz ewentualne potrzeby zdrowotne).
        </li>
        <li>
          Wplacic nalezna kwote w terminie wskazanym w potwierdzeniu zapisu lub ofercie obozu/nocowanki.
        </li>
        <li>
          Zapewnic mozliwosc kontaktu (numer telefonu) w trakcie trwania wyjazdu.
        </li>
        <li>
          Poinformowac organizatora o wszelkich zmianach dot. zdrowia, zachowania lub szczegolnych potrzeb
          uczestnika przed wyjazdem.
        </li>
      </ol>

      <SectionTitle>5. Zasady zachowania uczestnika</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Uczestnik powinien stosowac sie do polecen kadry i przestrzegac zasad bezpieczenstwa.
        </li>
        <li>
          Zakazane jest zachowanie stwarzajace zagrozenie dla siebie lub innych, agresja oraz niszczenie mienia.
        </li>
        <li>
          Dziecko nie powinno samodzielnie opuszczac terenu obozu/obiektu ani oddalac sie od grupy bez zgody opiekuna.
        </li>
        <li>
          Uczestnik dba o czystosc i porzadek w pokojach/miejscach zakwaterowania.
        </li>
      </ol>

      <SectionTitle>6. Program, warunki i organizacja czasu</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Harmonogram moze ulec zmianie w zaleznosci od warunkow pogodowych, logistyki lub spraw organizacyjnych,
          przy zachowaniu bezpieczenstwa uczestnikow.
        </li>
        <li>
          Aktywnosci sportowe i gry ruchowe sa dostosowane do wieku i mozliwosci uczestnikow.
        </li>
      </ol>

      <SectionTitle>7. Zasady odpowiedzialnosci i bezpieczenstwa</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Kadra sprawuje opieke zgodnie z przyjetymi standardami i dba o bezpieczenstwo podczas zajec.
        </li>
        <li>
          W razie wypadku, kontuzji lub pogorszenia stanu zdrowia Klub podejmuje dzialania adekwatne do sytuacji
          i kontaktuje sie z rodzicem/opiekunem.
        </li>
        <li>
          Organizator zastrzega, ze rodzic/opiekun odpowiada za przekazanie informacji o stanie zdrowia oraz za
          przygotowanie dziecka do wyjazdu (w tym zapewnienie potrzebnych lekow i dokumentacji).
        </li>
      </ol>

      <SectionTitle>8. Kontakt z rodzicem i informowanie</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Rodzic/opiekun moze kontaktowac sie z organizatorem w godzinach ustalonych w informacji o obozie/nocowance,
          a w sprawach pilnych - niezwlocznie.
        </li>
        <li>
          Klub moze przesylac aktualizacje (zdjecia/wpisy) na wskazany kanal komunikacji zgodnie z przyjetymi zgodami.
        </li>
      </ol>

      <SectionTitle>9. Oplaty, zwroty i rezygnacja</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Cena obozu/nocowanki obejmuje wskazane w ofercie elementy (m.in. zajecia sportowe, opieke, zakwaterowanie, wyzywienie).
        </li>
        <li>
          Szczegolowe zasady zwrotow i rezygnacji powinny byc wskazane w ofercie danego wyjazdu.
        </li>
      </ol>

      <SectionTitle>10. Ochrona danych osobowych i wizerunek</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Administratorem danych jest Klub. Dane przetwarzane sa w celu realizacji uczestnictwa i kontaktu.
        </li>
        <li>
          Szczegoly opisuje „Polityka prywatnosci”.
        </li>
        <li>
          Zgody na publikacje zdjec/wizerunku podlegaja odrebnym oświadczeniom w trakcie zapisow.
        </li>
      </ol>

      <SectionTitle>11. Postanowienia koncowe</SectionTitle>
      <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
        <li>
          Klub zastrzega sobie prawo do wprowadzenia zmian regulaminu w zakresie niezbędnym dla organizacji oraz z przyczyn prawnych.
        </li>
        <li>
          W sprawach nieuregulowanych zastosowanie maja przepisy prawa powszechnie obowiazujace.
        </li>
      </ol>

      <p className="text-xs text-stone-500 dark:text-stone-400 mt-8">
        Wzor do uzupelnienia: {"{{NIP}}"}, {"{{CONTACT_EMAIL}}"}, {"{{CONTACT_PHONE}}"}.
      </p>
    </div>
  );
}

export function RegulaminContent({ initialTab }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-text-main dark:text-white">
          Regulaminy
        </h1>
        <p className="text-text-light dark:text-stone-400 mt-3 text-sm md:text-base max-w-2xl mx-auto">
          Dwa dokumenty: osobno dla zajec oraz osobno dla obozow i nocowanek.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {tabs.map((t) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-stone-100 dark:bg-stone-800 text-text-main dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <CardWrapper>
        {activeTab === "zajecia" ? <RegulaminZajec /> : <RegulaminObozyINocowanki />}
      </CardWrapper>
    </div>
  );
}

