import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zajęcia | Risu Team",
  description: "Judo, Karate, Gimnastyka — buduj charakter przez sport",
};

const disciplines = [
  {
    id: "judo",
    title: "Judo",
    subtitle: "Droga łagodności",
    description:
      "Judo to nie tylko rzuty — to nauka bezpiecznego upadania i wstawania. Nasz program koncentruje się na efektywnym wykorzystaniu energii, bezpieczeństwie i wzajemnym szacunku od pierwszego dnia.",
    benefits: [
      { title: "Bezpieczne upadki", desc: "Kluczowa umiejętność w każdym sporcie i zabawie." },
      { title: "Równowaga i szacunek", desc: "Ukłony partnerom i kontrola równowagi." },
      { title: "Odporność", desc: "Rozwijanie siły mentalnej przez praktykę." },
    ],
    ages: "5-14 lat",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC-O6KzyU5cNmAdR-ZwaLKlHC4jTt4j-4DVZcYB1QLJ32qEo475WXIKClC3qHjPsS5UyjQXt-SoiRduNF0t9GLlSDI-uAhRSx-oaE2f00b0NQJZwU4Ut3-z1OdGSVPdNHT-F3PMJbcxJ6ocx2GBzzZfHlhKKNriY8zW__9d8uh_wurwOjoyb95E47TOj55lb6-90CcDR6iqxDZFJ3E6MN_Hv5kxnubtZ-imulOXSy3PSvYuTx1KtlCDDKA7w1lt8Cu8AwKn6kX-9bIZ",
    imageAlt: "Dzieci trenujące judo",
    layout: "normal",
    icon: "self_improvement",
  },
  {
    id: "karate",
    title: "Karate",
    subtitle: "Siła i skupienie",
    description:
      "Karate uczy dzieci, jak kierować energię w precyzyjne ruchy. Buduje siłę, poprawia koncentrację i daje głęboką pewność siebie przez osiągnięcia.",
    benefits: [
      { title: "Koordynacja", desc: "Złożone ruchy rozwijające umysł i ciało." },
      { title: "Koncentracja", desc: "Nauka słuchania, obserwacji i wykonania." },
      { title: "Samoobrona", desc: "Praktyczne umiejętności dla bezpieczeństwa i pewności." },
    ],
    ages: "6-16 lat",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDbHyD4aJoYl3RIFQUbLx8-EIoY6dKAhroGHntilR2b9JLA7WJQBoCJQvPRuALIcJ8gtKh0rDWCZptlkrW97OVc2QwIDOO8L_msO0BGcnKvyofDdXXEZ_uOgNbtVlXXmFs4P0V5zjJ02_99CAoS1Occxs5UOHd8Mak8n292FXM6U0ZeeAbwbwe_2C0l52VeR0Mk3E5i_W2SCODpMykT60wyryhO9I-OnmyYYW-DDfobrV__X98A-PJ-1KTyLVGzsCjpOvopFVHLcxuf",
    imageAlt: "Dziewczynka wykonująca kopnięcie w karate",
    layout: "reverse",
    icon: "do_not_step",
  },
  {
    id: "gimnastyka",
    title: "Gimnastyka",
    subtitle: "Elastyczność i zabawa",
    description:
      "Doskonała podstawa dla każdego sportowca. Gimnastyka buduje świadomość ciała, elastyczność i siłę. Dzieci uczą się ufać swojemu ciału przy świetnej zabawie w przewrotach i skokach.",
    benefits: [
      { title: "Zwinność", desc: "Szybkie i sprawne poruszanie się z równowagą." },
      { title: "Pewność siebie", desc: "Opanowanie nowych umiejętności jak przewroty i salta." },
      { title: "Umiejętności społeczne", desc: "Czekanie na swoją kolej i dopingowanie przyjaciołom." },
    ],
    ages: "3-12 lat",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQYu3XuE4ASh4UL4IC8wHo0NeGzuJK_31-IYyxP8wRAlFAQDB5LHb6aDiKwUo2AsHmktQREE1UVfnwe4lX8dH1GhhxM7g243dZn327flpiPn3sa8yYm5vk1qUGcFrGFmPhxFbAwsmQSXZ-bmF4VVXb9CkDcZnsC5vpXlK4ZGFDoteeid2axgHjUQouSGe1wofhfZy3EQ5LYmuOdrwJywfs7iIBt1-exkjM0ErTfMWjIhcN0yu0MIQvzRBlzJSV7D3yaVWSFYsdrMom",
    imageAlt: "Dziewczynka z wstążką gimnastyczną",
    layout: "normal",
    icon: "accessibility_new",
  },
];

export default function RodzajeZajecPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative px-6 py-12 md:py-20 lg:py-24 bg-background-light dark:bg-background-dark overflow-hidden">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 flex flex-col gap-6 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-primary text-xs font-bold uppercase tracking-wider w-fit mx-auto md:mx-0">
              <span className="material-symbols-outlined text-sm">trophy</span>
              Światowej klasy trening
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-text-main dark:text-white">
              Buduj charakter
              <br />
              <span className="text-primary">przez sport</span>
            </h1>
            <p className="text-lg md:text-xl text-text-light dark:text-stone-400 font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
              Odkryj ścieżkę dla swojego dziecka. Judo, Karate czy Gimnastyka —
              pewność siebie zaczyna się tutaj.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
              <Link
                href="/dashboard/zapisy"
                className="flex items-center justify-center rounded-xl h-12 px-8 bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary-hover transition-all"
              >
                Zapisz się na zajęcia
              </Link>
              <Link
                href="/grafik"
                className="flex items-center justify-center rounded-xl h-12 px-8 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 text-text-main dark:text-white font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
              >
                Zobacz grafik
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full max-w-[600px] relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full transform scale-90" />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-8">
                <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xl relative">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwuRdVARpR_0ExfqHNPi_eE5De9yCF9EgcnSwwoPw1-ph3hHx0dWsJyCgpw70Zg1V5vAmIb7sxPn4a91VxOXiY7I8Xn4kIxH_SN-TkSko7I8vQs9L9eFR52DfMSeB4DUU9AXEYf3rK0X38QY46kebX2g3ixUIEE8PxA8gczZfX6nJP9aXtsYn2HxCbNQ8NpB2vi_blIV4jICf3e2Wl5YWtx41vRXTxV2cJ0C2-kck_zI99lPpxKUmRWoyb8ykkiIaS-MCPnRAQ5bed"
                    alt="Dziecko w karate"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xl relative">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlbRn92vGdbX1QHQKejfR1_MwhDVwqnKB1l9dIsAbob6ALTveqNAvqsdOEERYLonMB8y4kksowHuqr-1IhwsUbcCpYJOtVICppi0lBazp9-H9ugB5wj-YNrbWMqtygyqvB8BbsYxWNDr53cPFFR__igx-MulvIr52bKPtyX6rmHoXUb9ytjHE9P5Jk-samiwBABtvQi4pgOEVxJ342Ds-osWIo3azhtwxCJpSMYBvHvT61Lu_iFZ5gJcg_WOQMT4q5OI-h34yP6QHk"
                    alt="Dziewczynka na równoważni"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full rotate-180 fill-white dark:fill-[#2c241b]">
          <svg
            className="relative block w-[calc(100%+1.3px)] h-[60px]"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
          </svg>
        </div>
      </section>

      {/* Discipline sections */}
      {disciplines.map((d, i) => (
        <section
          key={d.id}
          id={d.id}
          className={`relative py-20 ${
            i % 2 === 0
              ? "bg-white dark:bg-[#2c241b]"
              : "bg-background-light dark:bg-background-dark"
          }`}
        >
          <div className="max-w-[1100px] mx-auto px-6">
            <div
              className={`flex flex-col md:flex-row gap-12 lg:gap-20 items-center ${
                d.layout === "reverse" ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1 w-full">
                <div className="relative group">
                  <div
                    className={`absolute -inset-4 rounded-[2rem] rotate-3 group-hover:rotate-1 transition-transform duration-500 ${
                      d.id === "judo"
                        ? "bg-primary/10"
                        : d.id === "karate"
                          ? "bg-orange-200 dark:bg-orange-900/20 -rotate-2"
                          : "bg-pink-100 dark:bg-pink-900/20 rotate-2"
                    }`}
                  />
                  <div className="relative w-full aspect-video md:aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={d.image}
                      alt={d.imageAlt}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                      <span className="flex items-center gap-2 text-sm font-bold text-primary">
                        <span className="material-symbols-outlined">verified</span>
                        {d.ages}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex items-center gap-2 text-primary font-bold tracking-wider uppercase text-sm">
                  <span className="p-1 rounded bg-primary/10">
                    <span className="material-symbols-outlined text-[20px]">
                      {d.icon}
                    </span>
                  </span>
                  Dyscyplina #{String(i + 1).padStart(2, "0")}
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-text-main dark:text-white leading-tight">
                  {d.title}:{" "}
                  <span className="text-primary">{d.subtitle}</span>
                </h2>
                <p className="text-lg text-text-light dark:text-stone-400 leading-relaxed">
                  {d.description}
                </p>
                <div
                  className={`p-6 rounded-2xl border border-dashed border-stone-200 dark:border-stone-700 ${
                    i % 2 === 0
                      ? "bg-background-light dark:bg-background-dark"
                      : "bg-white dark:bg-[#2c241b]"
                  }`}
                >
                  <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">
                    Korzyści dla dziecka:
                  </h3>
                  <ul className="space-y-3">
                    {d.benefits.map((b) => (
                      <li key={b.title} className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">
                            check
                          </span>
                        </span>
                        <div>
                          <strong className="text-text-main dark:text-white font-bold">
                            {b.title}:
                          </strong>{" "}
                          <span className="text-text-light dark:text-stone-400 text-sm">
                            {b.desc}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={`/grafik?dyscyplina=${encodeURIComponent(d.title)}`}
                  className="flex items-center justify-center rounded-xl h-12 px-8 bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary-hover w-fit transition-all"
                >
                  Zapisz się na zajęcia — {d.title}
                </Link>
              </div>
            </div>
          </div>
          {i < disciplines.length - 1 && (
            <div className="absolute bottom-0 left-0 w-full rotate-180 overflow-hidden">
              <svg
                className="relative block w-full h-[60px] fill-current text-background-light dark:text-background-dark"
                preserveAspectRatio="none"
                viewBox="0 0 1200 120"
              >
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
              </svg>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
