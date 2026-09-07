"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_CATEGORIES = [
  "Ogólne",
  "Płatności",
  "Sprzęt",
  "Bezpieczeństwo",
] as const;

type Category = (typeof FAQ_CATEGORIES)[number];

const faqData: { category: Category; question: string; answer: string }[] = [
  // Ogólne
  {
    category: "Ogólne",
    question: "Od jakiego wieku mogę zapisać dziecko na zajęcia?",
    answer:
      "Zajęcia gimnastyczne oferujemy od 3. roku życia. Judo od 5 lat, a Karate od 6 lat. Każda grupa wiekowa ma dostosowany program treningowy.",
  },
  {
    category: "Ogólne",
    question: "Jak zapisać dziecko na zajęcia?",
    answer:
      "Wejdź na stronę Cennik i wybierz abonament miesięczny (240 zł, 8 zajęć w miesiącu). Następnie skontaktuj się z nami przez Zapisy lub Kontakt — nie prowadzimy lekcji próbnych, zapisujemy od razu na abonament. Odpowiadamy w ciągu 24h.",
  },
  {
    category: "Ogólne",
    question: "Czy są lekcje próbne?",
    answer:
      "Nie oferujemy darmowych lekcji próbnych. Zapisy prowadzimy na abonament miesięczny (8 zajęć, 240 zł). Więcej informacji na stronach Cennik i Zapisy.",
  },
  {
    category: "Ogólne",
    question: "Gdzie odbywają się zajęcia?",
    answer:
      "Adresy i mapę znajdziesz w zakładce Lokalizacja. Zajęcia prowadzimy w kilku punktach (m.in. w szkołach). Aktualny podział grup i miejsc — w zakładce Grafik.",
  },
  {
    category: "Ogólne",
    question: "Gdzie sprawdzić grafik zajęć?",
    answer:
      "Aktualny grafik grup i terminów jest w zakładce Grafik.",
  },
  {
    category: "Ogólne",
    question: "Czy organizujecie obozy lub półkolonie?",
    answer:
      "Tak, organizujemy obozy letnie, zimowe i półkolonie. Terminy i zapisy znajdziesz w zakładce Obozy.",
  },
  {
    category: "Ogólne",
    question: "Co dziecko powinno mieć na pierwsze zajęcia?",
    answer:
      "Wystarczy wygodny strój sportowy (np. dres), bielizna na zmianę i butelka wody. Na karate i judo z czasem potrzebne będzie kimono — doradzimy przy zakupie.",
  },
  {
    category: "Ogólne",
    question: "Jak często odbywają się treningi?",
    answer:
      "Zazwyczaj 1–2 razy w tygodniu w zależności od grupy i dyscypliny. Szczegółowy grafik znajdziesz w zakładce Grafik.",
  },
  {
    category: "Ogólne",
    question: "Czy prowadzicie zapisy przez cały rok?",
    answer:
      "Tak, zapisujemy na zajęcia regularne przez cały rok. Do niektórych obozów i eventów mogą obowiązywać terminy zapisów.",
  },
  // Płatności
  {
    category: "Płatności",
    question: "Jakie formy płatności akceptujecie?",
    answer:
      "Przyjmujemy wyłącznie przelewy bankowe na podane konto. Numer konta i zasady tytułu przelewu znajdziesz na stronie Cennik.",
  },
  {
    category: "Płatności",
    question: "Czy można płacić miesięcznie czy tylko z góry?",
    answer:
      "Oferujemy jeden plan: abonament miesięczny 240 zł (8 zajęć). Płatność co miesiąc — szczegóły w zakładce Cennik.",
  },
  {
    category: "Płatności",
    question: "Czy są zniżki dla rodzeństwa?",
    answer:
      "Tak, drugie i kolejne dziecko z rodziny ma 15% zniżki na abonament. Szczegóły w zakładce Cennik.",
  },
  {
    category: "Płatności",
    question: "Czy mogę anulować abonament?",
    answer:
      "Abonament miesięczny można wypowiedzieć z miesięcznym wyprzedzeniem. Szczegóły w Cenniku.",
  },
  // Sprzęt
  {
    category: "Sprzęt",
    question: "Gdzie kupić kimono na judo/karate?",
    answer:
      "Polecamy sprawdzone sklepy i możemy podać konkretne modele. Na pierwszych zajęciach można ćwiczyć w dresie.",
  },
  {
    category: "Sprzęt",
    question: "Czy klub zapewnia sprzęt treningowy?",
    answer:
      "Mata, worek, tarcze i podstawowy sprzęt są w klubie. Uczestnik przynosi własne obuwie zmienne i strój.",
  },
  {
    category: "Sprzęt",
    question: "Czy potrzebna jest ochraniacz na zęby?",
    answer:
      "Na karate w grupach starszych zalecamy ochraniacz. Na judo i gimnastykę zazwyczaj nie jest wymagany.",
  },
  // Bezpieczeństwo
  {
    category: "Bezpieczeństwo",
    question: "Jak dbacie o bezpieczeństwo dzieci?",
    answer:
      "Wszyscy trenerzy mają uprawnienia i doświadczenie. Sale są dostosowane do treningów, sprzęt regularnie kontrolowany. Rodzice mogą obserwować zajęcia.",
  },
  {
    category: "Bezpieczeństwo",
    question: "Czy trenerzy są przeszkoleni z pierwszej pomocy?",
    answer:
      "Tak, kadra posiada aktualne szkolenia z pierwszej pomocy przedmedycznej.",
  },
  {
    category: "Bezpieczeństwo",
    question: "Czy muszę wypełnić zgodę medyczną?",
    answer:
      "Tak, przed rozpoczęciem zajęć wymagana jest zgoda rodzica/opiekuna oraz podstawowe informacje medyczne (alergie, choroby przewlekłe).",
  },
];

export function FaqContent() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "Wszystkie">(
    "Wszystkie"
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const byCat =
      activeCategory === "Wszystkie"
        ? faqData
        : faqData.filter((item) => item.category === activeCategory);
    if (!q) return byCat;
    return byCat.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [search, activeCategory]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-[1fr_340px] gap-12">
        <div>
          {/* Hero + search */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-text-main dark:text-white mb-4">
              Jak możemy Ci pomóc?
            </h1>
            <p className="text-lg text-text-light dark:text-stone-400 mb-6">
              Znajdź odpowiedzi o grafikach, sprzęcie, bezpieczeństwie i płatnościach. Nie znalazłeś odpowiedzi? Skontaktuj się z nami.
            </p>
            <div className="relative max-w-xl">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                search
              </span>
              <Input
                placeholder="Szukaj w FAQ…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 rounded-xl border-2 bg-background"
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory("Wszystkie")}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                activeCategory === "Wszystkie"
                  ? "bg-primary text-primary-foreground"
                  : "bg-stone-100 dark:bg-stone-800 text-text-main dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
              }`}
            >
              Wszystkie
            </button>
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-stone-100 dark:bg-stone-800 text-text-main dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion */}
          {filtered.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-2">
              {filtered.map((item, i) => (
                <AccordionItem
                  key={`${item.category}-${item.question}`}
                  value={`faq-${i}`}
                  className="border rounded-xl px-4 bg-white dark:bg-stone-900/50 border-stone-200 dark:border-stone-700"
                >
                  <AccordionTrigger className="text-left font-semibold text-text-main dark:text-white hover:no-underline py-6">
                    <div className="flex w-full items-center gap-3 mr-2">
                      <span className="pr-2 flex-1 text-left">{item.question}</span>
                      <span className="text-xs font-normal text-primary shrink-0 ml-auto">
                        {item.category}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-text-light dark:text-stone-400 pb-6">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-600 p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-stone-400 mb-4 block">
                search_off
              </span>
              <p className="text-text-light dark:text-stone-400 font-medium">
                Brak wyników dla „{search}” w tej kategorii. Spróbuj innej frazy
                lub{" "}
                <Link href="/kontakt" className="text-primary font-bold risu-underline">
                  skontaktuj się z nami
                </Link>
                .
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 h-fit space-y-6">
          <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className="font-bold text-text-main dark:text-white text-lg">
                  Potrzebujesz pomocy?
                </h3>
                <p className="text-sm text-text-light dark:text-stone-400">
                  Zespół Risu Team odpowiada w ciągu 24h
                </p>
              </div>
            </div>
            <Link
              href="/kontakt"
              className="flex items-center justify-center gap-2 rounded-xl h-12 bg-primary text-primary-foreground font-bold hover:bg-primary-hover transition-colors mb-4"
            >
              <span className="material-symbols-outlined">mail</span>
              Kontakt
            </Link>
            <a
              href="tel:+48777888999"
              className="flex items-center justify-center gap-2 text-sm text-text-light dark:text-stone-400 hover:text-primary font-medium"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              +48 777 888 999
            </a>
          </div>
          <div className="relative hidden lg:block rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100 dark:bg-stone-800">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwuRdVARpR_0ExfqHNPi_eE5De9yCF9EgcnSwwoPw1-ph3hHx0dWsJyCgpw70Zg1V5vAmIb7sxPn4a91VxOXiY7I8Xn4kIxH_SN-TkSko7I8vQs9L9eFR52DfMSeB4DUU9AXEYf3rK0X38QY46kebX2g3ixUIEE8PxA8gczZfX6nJP9aXtsYn2HxCbNQ8NpB2vi_blIV4jICf3e2Wl5YWtx41vRXTxV2cJ0C2-kck_zI99lPpxKUmRWoyb8ykkiIaS-MCPnRAQ5bed"
              alt="Risu Team maskotka"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white font-bold text-sm">Risu — Twój przyjaciel w sporcie</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
