"use client";

import type { ReactNode } from "react";

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 md:p-10">
      {children}
    </div>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white">
      {children}
    </h2>
  );
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-lg font-bold text-text-main dark:text-white mt-7 mb-3">
      {children}
    </h3>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <p className="text-text-light dark:text-stone-400 text-sm md:text-base leading-relaxed mb-4">
      {children}
    </p>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg bg-primary/15 dark:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wide">
      {children}
    </span>
  );
}

function Disclaimer() {
  return (
    <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/40 my-6">
      <p className="text-sm text-text-light dark:text-stone-400">
        To jest szablon polityki prywatnosci. Przed publikacja upewnij sie, ze
        odpowiada on faktycznym procesom w Twoim klubie oraz regulacjom prawnym.
        W razie watpliwosci skonsultuj dokument z prawnikiem.
      </p>
    </div>
  );
}

export function PrivacyPolicyContent() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <Badge>RODO</Badge>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-text-main dark:text-white mt-4">
          Polityka prywatnosci
        </h1>
        <p className="text-text-light dark:text-stone-400 mt-3 text-sm md:text-base max-w-2xl mx-auto">
          Informacje o przetwarzaniu danych osobowych w serwisie{" "}
          {"{{CLUB_NAME}}"}.
        </p>
      </div>

      <Card>
        <H2>1. Administrator danych</H2>
        <P>
          Administratorem danych osobowych jest{" "}
          <span className="font-semibold text-text-main dark:text-white">
            {"{{CLUB_NAME}}"}
          </span>{" "}
          z siedziba przy {"{{ADDRESS}}"} (dalej: „Administrator”).
        </P>
        <P>
          Kontakt w sprawach prywatnosci:{" "}
          <span className="font-semibold text-text-main dark:text-white">
            {"{{CONTACT_EMAIL}}"}
          </span>
          , tel.{" "}
          <span className="font-semibold text-text-main dark:text-white">
            {"{{CONTACT_PHONE}}"}
          </span>
          .
        </P>

        <Disclaimer />

        <H3>2. Definicje</H3>
        <ul className="list-disc pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
          <li>
            „RODO” — Rozporzadzenie Parlamentu Europejskiego i Rady (UE)
            2016/679.
          </li>
          <li>
            „Serwis” — strona internetowa i panel rodzica prowadzony przez
            Administratora.
          </li>
          <li>
            „Uczestnik” — dziecko biorace udzial w zajeciach, obozach lub
            nocowankach.
          </li>
          <li>
            „Opiekun” — rodzic/opiekun prawny dokonujacy zapisu oraz korzystajacy
            z konta.
          </li>
        </ul>

        <H3>3. Jakie dane przetwarzamy</H3>
        <P>
          Zakres danych zalezy od tego, z jakich funkcji korzystasz. W serwisie
          wystepuja w szczegolnosci nastepujace kategorie danych:
        </P>
        <ul className="list-disc pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
          <li>
            <span className="font-semibold text-text-main dark:text-white">
              Konto opiekuna
            </span>
            : imie i nazwisko (np. pole <code>name</code>), adres e-mail (pole{" "}
            <code>email</code>), ewentualnie rola w systemie (np.{" "}
            <code>user</code>/<code>admin</code>).
          </li>
          <li>
            <span className="font-semibold text-text-main dark:text-white">
              Zapisy na obozy/nocowanki
            </span>
            : dane dziecka (np. <code>childName</code>,{" "}
            <code>childSurname</code>, <code>childDob</code>, opcjonalnie{" "}
            <code>childPesel</code>), dane zdrowotne przekazane dobrowolnie (np.{" "}
            <code>dietary</code>, <code>allergies</code>,{" "}
            <code>medicalNotes</code>), dane opiekuna (np. <code>parentName</code>
            , <code>parentEmail</code>, opcjonalnie <code>parentPhone</code>),
            odpowiedzi na pytania dodatkowe oraz informacje o zgodach (np.
            medyczna, wizerunek) i akceptacji regulaminow.
          </li>
          <li>
            <span className="font-semibold text-text-main dark:text-white">
              Formularz kontaktowy
            </span>
            : adres e-mail, opcjonalnie imie/nazwisko, opcjonalnie numer
            telefonu, tresc wiadomosci oraz temat.
          </li>
          <li>
            <span className="font-semibold text-text-main dark:text-white">
              Newsletter i komunikacja e-mail
            </span>
            : adres e-mail do wysylki informacji (np. o obozach, nocowankach lub
            zmianach organizacyjnych) oraz ewentualny identyfikator/odnosnik do
            wypisu (jesli stosowany).
          </li>
          <li>
            <span className="font-semibold text-text-main dark:text-white">
              Reset hasla i wiadomosci transakcyjne
            </span>
            : adres e-mail, na ktory wysylany jest kod lub link do resetu hasla.
          </li>
        </ul>

        <H3>4. Cele i podstawy prawne przetwarzania</H3>
        <ol className="list-decimal pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
          <li>
            <span className="font-semibold text-text-main dark:text-white">
              Prowadzenie konta i panelu rodzica
            </span>{" "}
            — art. 6 ust. 1 lit. b RODO (wykonanie umowy / swiadczenie uslugi).
          </li>
          <li>
            <span className="font-semibold text-text-main dark:text-white">
              Realizacja zapisow i organizacja zajec/wyjazdow
            </span>{" "}
            — art. 6 ust. 1 lit. b RODO; w zakresie danych szczegolnych (np.
            zdrowotnych) podstawa moze wynikac z odrebnej zgody lub przepisow
            (do doprecyzowania).
          </li>
          <li>
            <span className="font-semibold text-text-main dark:text-white">
              Kontakt i obsluga zapytan
            </span>{" "}
            — art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes: komunikacja
            i obsluga zapytan) lub art. 6 ust. 1 lit. b RODO (dzialania przed
            zawarciem umowy).
          </li>
          <li>
            <span className="font-semibold text-text-main dark:text-white">
              Newsletter / komunikacja marketingowa
            </span>{" "}
            — art. 6 ust. 1 lit. a RODO (zgoda), jesli wymagane.
          </li>
          <li>
            <span className="font-semibold text-text-main dark:text-white">
              Ustalenie, dochodzenie lub obrona roszczen
            </span>{" "}
            — art. 6 ust. 1 lit. f RODO.
          </li>
          <li>
            <span className="font-semibold text-text-main dark:text-white">
              Obowiazki prawne (np. ksiegowosc)
            </span>{" "}
            — art. 6 ust. 1 lit. c RODO (jesli dotyczy).
          </li>
        </ol>

        <H3>5. Odbiorcy danych i podmioty przetwarzajace</H3>
        <P>
          Dane moga byc przekazywane podmiotom wspierajacym Administratora, w tym:
        </P>
        <ul className="list-disc pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
          <li>
            dostawcy uslug e-mail (np. Brevo) — w celu wysylki wiadomosci
            transakcyjnych, resetu hasla oraz newslettera,
          </li>
          <li>
            dostawcy infrastruktury/hostingu i bazy danych (np. Convex) — w celu
            utrzymania serwisu i kont uzytkownikow,
          </li>
          <li>
            podwykonawcy wspierajacy organizacje zajec i wyjazdow (np. obiekty,
            noclegi) — w zakresie niezbednym do realizacji uslugi (do
            doprecyzowania),
          </li>
          <li>
            organy publiczne — jesli wynika to z obowiazku prawnego.
          </li>
        </ul>

        <H3>6. Przekazywanie danych poza EOG</H3>
        <P>
          Jezeli dostawcy Administratora przekazuja dane poza Europejski Obszar
          Gospodarczy, odbywa sie to na podstawie odpowiednich mechanizmow
          prawnych (np. standardowych klauzul umownych) — do uzupelnienia w
          zaleznosci od uzywanych dostawcow.
        </P>

        <H3>7. Okres przechowywania danych</H3>
        <ul className="list-disc pl-5 space-y-2 text-text-light dark:text-stone-400 text-sm md:text-base">
          <li>
            dane konta — przez okres posiadania konta oraz do czasu rozliczenia
            roszczen,
          </li>
          <li>
            dane zapisow/uczestnictwa — przez okres realizacji uslugi oraz przez
            czas niezbedny do rozliczen i obrony roszczen,
          </li>
          <li>
            korespondencja — przez okres niezbedny do obslugi sprawy i
            archiwizacji,
          </li>
          <li>
            newsletter — do czasu wypisania sie lub cofniecia zgody.
          </li>
        </ul>

        <H3>8. Prawa osob, ktorych dane dotycza</H3>
        <P>
          Przysluguja Ci prawa: dostepu do danych, sprostowania, usuniecia,
          ograniczenia przetwarzania, przenoszenia danych, sprzeciwu (w
          przypadkach przewidzianych prawem), a takze prawo do cofniecia zgody w
          dowolnym momencie (bez wplywu na zgodnosc przetwarzania przed
          cofnieciem zgody).
        </P>
        <P>
          Masz rowniez prawo wniesienia skargi do Prezesa Urzedu Ochrony Danych
          Osobowych (UODO).
        </P>

        <H3>9. Zautomatyzowane podejmowanie decyzji i profilowanie</H3>
        <P>
          {"{{AUTOMATED_DECISIONS_PLACEHOLDER}}"} (np. „Administrator nie stosuje
          zautomatyzowanego podejmowania decyzji ani profilowania.”).
        </P>

        <H3>10. Cookies i technologie</H3>
        <P>
          Serwis moze zapisywac ustawienia techniczne, takie jak preferencje
          motywu (jasny/ciemny) oraz informacje niezbedne do dzialania sesji
          logowania. Jesli korzystasz z blokowania cookies, czesc funkcji moze
          nie dzialac prawidlowo.
        </P>
        <P>
          Serwis nie deklaruje stosowania narzedzi analitycznych/reklamowych,
          jesli nie zostaly one wdrozone. Jezeli dodasz takie narzedzia (np.
          Google Analytics), uzupelnij te sekcje oraz wdroz mechanizm zgody na
          cookies.
        </P>

        <H3>11. Bezpieczenstwo</H3>
        <P>
          Administrator stosuje srodki techniczne i organizacyjne majace na celu
          ochrone danych osobowych przed nieuprawnionym dostepem, utrata lub
          naruszeniem. Pamiętaj, by stosowac silne hasla i nie udostepniac ich
          osobom trzecim.
        </P>

        <H3>12. Kontakt</H3>
        <P>
          W sprawach zwiazanych z prywatnoscia skontaktuj sie z nami:{" "}
          <span className="font-semibold text-text-main dark:text-white">
            {"{{CONTACT_EMAIL}}"}
          </span>
          .
        </P>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-8">
          Wzor do uzupelnienia: {"{{CLUB_NAME}}"}, {"{{ADDRESS}}"}, {"{{NIP}}"},{" "}
          {"{{CONTACT_EMAIL}}"}, {"{{CONTACT_PHONE}}"}.
        </p>
      </Card>
    </div>
  );
}
