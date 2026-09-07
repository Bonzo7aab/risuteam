/** Static fallback content for public nocowanka pages (legacy slugs). */
export type NocowankaStaticContent = {
  title: string;
  badge: string;
  titlePart1: string;
  titlePart2: string;
  description: string;
  dates: string;
  location: string;
  stats: { value: string; label: string }[];
  attractions: { icon: string; title: string; description: string }[];
  whatToBring: string[];
  price: string;
  priceIncluded: string[];
  availabilityPercent: number;
  schedule: { time: string; title: string; description: string }[];
};

export const NOCOWANKI_STATIC: Record<string, NocowankaStaticContent> = {
  klubowa: {
    title: "Klubowa Nocowanka",
    badge: "EVENT JEDNODNIOWY",
    titlePart1: "Klubowa",
    titlePart2: "Nocowanka",
    description:
      "Dołącz do nas na najbardziej ekscytującą noc pełną gier, pizzy i nocnych przygód z Risu Team!",
    dates: "6-7 Marca",
    location: "B.P. w Zamienniku",
    stats: [
      { value: "19:00", label: "START IMPREZY" },
      { value: "14h", label: "ŚWIETNEJ ZABAWY" },
      { value: "Unlimited", label: "PIZZA I GRY" },
      { value: "170 ZŁ", label: "PEŁNA CENA" },
    ],
    attractions: [
      { icon: "sports_esports", title: "Gry i Zabawy", description: "" },
      { icon: "local_pizza", title: "Uczta Pizza", description: "" },
      { icon: "movie", title: "Seanse Kinowe", description: "" },
      { icon: "celebration", title: "Dyskoteka", description: "" },
      { icon: "nightlight", title: "Spanie na Macie", description: "" },
    ],
    whatToBring: [
      "Śpiwór",
      "Poduszka",
      "Ubranie na zmianę",
      "Przybory toaletowe",
      "Ulubiona przytulanka",
    ],
    price: "170 PLN",
    priceIncluded: [
      "Pizza i napoje",
      "Gry i atrakcje",
      "Opieka kadry",
      "Śniadanie",
    ],
    availabilityPercent: 75,
    schedule: [
      { time: "19:00", title: "Przyjazd i Zakwaterowanie", description: "" },
      { time: "20:00", title: "Czas na Pizzę", description: "" },
      { time: "21:00", title: "Kino & Gry", description: "" },
      { time: "22:30", title: "Cisza Nocna", description: "" },
      { time: "08:00", title: "Śniadanie i Odbiór", description: "" },
    ],
  },
};

export const NOCOWANKA_CONTACT = {
  phone: "533-020-048",
  email: "risu.biuro@gmail.com",
};
