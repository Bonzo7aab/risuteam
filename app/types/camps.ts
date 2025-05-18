import { ReactNode } from "react";

export type CampType = "polkolonie" | "letnie" | "zimowe" | "nocowanka";
export type TabType = CampType | "all";

export interface CampImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface CampPayment {
  installment: string;
  amount: number;
  currency: string;
  dueDate?: string;
  description?: string;
}

export interface CampLocation {
  name: string;
  description: string;
  address: string;
}

export interface CampIncluded {
  title: string;
  items: string[];
}

export interface CampContent {
  title: string;
  date: string;
  description: string;
  images: CampImage[];
  price: number;
  program: string[];
  location: CampLocation;
  included: CampIncluded;
  payments: CampPayment[];
  paymentInfo: string;
}

export interface CampTab {
  type: TabType;
  label: string;
  icon: ReactNode;
  content: CampContent;
}

export const CAMP_DATA: Record<CampType, CampContent> = {
  letnie: {
    title: "Obóz rodzinny Zakopane 2025",
    date: "27.04.2025 - 01.05.2025",
    description: "Rodzinny obóz w Zakopanem – niezapomniane wakacje dla całej rodziny! Czy marzycie o aktywnym wypoczynku w otoczeniu malowniczych Tatr? Zapraszamy na rodzinny obóz w Zakopanem w dniach 5-12 lipca 2025! To wyjątkowa okazja, aby spędzić czas razem, na sportowo, ciesząc się pięknem gór, świetną zabawą i chwilami relaksu.",
    images: [
      {
        src: "/zakopane_2025_ver2_1.jpg",
        alt: "Obozy",
        width: 300,
        height: 300
      },
      {
        src: "/zakopane_2025_ver2_2.jpg",
        alt: "Obozy",
        width: 300,
        height: 300
      }
    ],
    price: 2190,
    location: {
      name: "Willa Basieńka w Zakopanem",
      description: "Zlokalizowana jest w pięknej, zalesionej okolicy w pobliżu kompleksu Nosal oraz kolejki na Kasprowy Wierch. Zakwaterowanie w pokojach 2,3,4,5 osobowych z pełnym węzłem sanitarnym, TV, WiFi.",
      address: "Jana Michalsakie 32, Warszawa"
    },
    included: {
      title: "Cena zawiera",
      items: [
        "Zakwaterowanie 7 noclegów",
        "Pełne wyżywienie – 3 posiłki dziennie",
        "Opiekę kadry wychowawczej i trenerskiej",
        "Ubezpieczenie NNW",
        "Program"
      ]
    },
    program: [
      "Wyjścia w góry i doliny - odkryjcie urok tatrzańskich szlaków, podziwiając zapierające dech w piersiach widoki.",
      "Treningi na macie – dla dzieci: judo i karate, dla dorosłych: ćwiczenia wzmacniające dla każdego, niezależnie od wieku i kondycji.",
      "Gry zespołowe – integracja, zdrowa rywalizacja i mnóstwo śmiechu podczas gier dla małych i dużych.",
      "Wizyta w Aqua Parku – wodne szaleństwo i relaks w basenach dla całej rodziny.",
      "Dyskoteka – wieczór pełen tańca, muzyki i dobrej energii",
      "Spotkanie z góralskim gawędziarzem – posłuchajcie fascynujących opowieści o tradycjach, kulturze i historii Podhala.",
      "Animacje dla dzieci i dorosłych – kreatywne warsztaty, zabawy i konkursy, które zagwarantują uśmiech na twarzach wszystkich uczestników."
    ],
    payments: [
      {
        installment: "I rata",
        amount: 200,
        currency: "zł",
        description: "zaliczka gwarantuje miejsce na obozie"
      },
      {
        installment: "II rata",
        amount: 600,
        currency: "zł",
        dueDate: "15.05.2025"
      },
      {
        installment: "III rata",
        amount: 600,
        currency: "zł",
        dueDate: "15.06.2025"
      },
      {
        installment: "IV rata",
        amount: 790,
        currency: "zł",
        dueDate: "1.07.2025"
      }
    ],
    paymentInfo: "Opłaty prosimy dokonywać na poniższy nr konta w tytule 'Rodzinny obóz letni 5-12 lipca 2025, imiona i nazwiska uczestników, nr wpłacanej raty'"
  },
  polkolonie: {
    title: "Półkolonie 2025",
    description: "Zapraszamy na wakacyjne półkolonie dla dzieci! Nasze półkolonie to połączenie aktywnego wypoczynku, nauki i świetnej zabawy pod okiem wykwalifikowanej kadry.",
    images: [
      {
        src: "/zakopane_2025_ver2_1.jpg",
        alt: "Obozy",
        width: 300,
        height: 300
      },
      {
        src: "/zakopane_2025_ver2_2.jpg",
        alt: "Obozy",
        width: 300,
        height: 300
      }
    ],
    included: {
      title: "Terminy",
      items: [
        "Turnus 1: 1-5 lipca 2025",
        "Turnus 2: 8-12 lipca 2025",
        "Turnus 3: 15-19 lipca 2025"
      ]
    },
    program: [
      "Wyjścia w góry i doliny - odkryjcie urok tatrzańskich szlaków, podziwiając zapierające dech w piersiach widoki.",
      "Treningi na macie – dla dzieci: judo i karate, dla dorosłych: ćwiczenia wzmacniające dla każdego, niezależnie od wieku i kondycji.",
      "Gry zespołowe – integracja, zdrowa rywalizacja i mnóstwo śmiechu podczas gier dla małych i dużych.",
      "Wizyta w Aqua Parku – wodne szaleństwo i relaks w basenach dla całej rodziny.",
      "Dyskoteka – wieczór pełen tańca, muzyki i dobrej energii",
      "Spotkanie z góralskim gawędziarzem – posłuchajcie fascynujących opowieści o tradycjach, kulturze i historii Podhala.",
      "Animacje dla dzieci i dorosłych – kreatywne warsztaty, zabawy i konkursy, które zagwarantują uśmiech na twarzach wszystkich uczestników."
    ],
    price: 880,
    location: {
      name: "Willa Basieńka w Zakopanem",
      description: "Zlokalizowana jest w pięknej, zalesionej okolicy w pobliżu kompleksu Nosal oraz kolejki na Kasprowy Wierch. Zakwaterowanie w pokojach 2,3,4,5 osobowych z pełnym węzłem sanitarnym, TV, WiFi.",
      address: "Jana Michalsakie 32, Warszawa"
    },
    payments: [
      {
        installment: "I rata",
        amount: 200,
        currency: "zł",
        description: "zaliczka gwarantuje miejsce na obozie"
      },
      {
        installment: "II rata",
        amount: 600,
        currency: "zł",
        dueDate: "15.05.2025"
      },
      {
        installment: "III rata",
        amount: 600,
        currency: "zł",
        dueDate: "15.06.2025"
      },
      {
        installment: "IV rata",
        amount: 790,
        currency: "zł",
        dueDate: "1.07.2025"
      }
    ],
    paymentInfo: "Opłaty prosimy dokonywać na poniższy nr konta w tytule 'Rodzinny obóz letni 5-12 lipca 2025, imiona i nazwiska uczestników, nr wpłacanej raty'",
    date: "27.04.2025 - 01.05.2025"
  },
  zimowe: {
    title: "Obozy zimowe 2025",
    description: "Informacje o obozach zimowych pojawią się wkrótce. Zapraszamy do śledzenia naszej strony!",
    images: [
      {
        src: "/zakopane_2025_ver2_1.jpg",
        alt: "Obozy",
        width: 300,
        height: 300
      },
      {
        src: "/zakopane_2025_ver2_2.jpg",
        alt: "Obozy",
        width: 300,
        height: 300
      }
    ],
    price: 2213,
    location: {
      name: "Willa Basieńka w Zakopanem",
      description: "Zlokalizowana jest w pięknej, zalesionej okolicy w pobliżu kompleksu Nosal oraz kolejki na Kasprowy Wierch. Zakwaterowanie w pokojach 2,3,4,5 osobowych z pełnym węzłem sanitarnym, TV, WiFi.",
      address: "Jana Michalsakie 32, Warszawa"
    },
    included: {
      title: "Cena zawiera",
      items: [
        "Zakwaterowanie 7 noclegów",
        "Pełne wyżywienie – 3 posiłki dziennie",
        "Opiekę kadry wychowawczej i trenerskiej",
        "Ubezpieczenie NNW",
        "Program"
      ]
    },
    program: [
      "Wyjścia w góry i doliny - odkryjcie urok tatrzańskich szlaków, podziwiając zapierające dech w piersiach widoki.",
      "Treningi na macie – dla dzieci: judo i karate, dla dorosłych: ćwiczenia wzmacniające dla każdego, niezależnie od wieku i kondycji.",
      "Gry zespołowe – integracja, zdrowa rywalizacja i mnóstwo śmiechu podczas gier dla małych i dużych.",
      "Wizyta w Aqua Parku – wodne szaleństwo i relaks w basenach dla całej rodziny.",
      "Dyskoteka – wieczór pełen tańca, muzyki i dobrej energii",
      "Spotkanie z góralskim gawędziarzem – posłuchajcie fascynujących opowieści o tradycjach, kulturze i historii Podhala.",
      "Animacje dla dzieci i dorosłych – kreatywne warsztaty, zabawy i konkursy, które zagwarantują uśmiech na twarzach wszystkich uczestników."
    ],
    payments: [
      {
        installment: "I rata",
        amount: 200,
        currency: "zł",
        description: "zaliczka gwarantuje miejsce na obozie"
      },
      {
        installment: "II rata",
        amount: 600,
        currency: "zł",
        dueDate: "15.05.2025"
      },
      {
        installment: "III rata",
        amount: 600,
        currency: "zł",
        dueDate: "15.06.2025"
      },
      {
        installment: "IV rata",
        amount: 790,
        currency: "zł",
        dueDate: "1.07.2025"
      }
    ],
    paymentInfo: "Opłaty prosimy dokonywać na poniższy nr konta w tytule 'Rodzinny obóz letni 5-12 lipca 2025, imiona i nazwiska uczestników, nr wpłacanej raty'",
    date: "27.04.2025 - 01.05.2025"
  },
  nocowanka: {
    title: "Nocowanki 2025",
    description: "Informacje o nocowankach pojawią się wkrótce. Zapraszamy do śledzenia naszej strony!",
    images: [
      {
        src: "/zakopane_2025_ver2_1.jpg",
        alt: "Obozy",
        width: 300,
        height: 300
      },
      {
        src: "/zakopane_2025_ver2_2.jpg",
        alt: "Obozy",
        width: 300,
        height: 300
      }
    ],
    price: 1800,
    location: {
      name: "Willa Basieńka w Zakopanem",
      description: "Zlokalizowana jest w pięknej, zalesionej okolicy w pobliżu kompleksu Nosal oraz kolejki na Kasprowy Wierch. Zakwaterowanie w pokojach 2,3,4,5 osobowych z pełnym węzłem sanitar",
      address: "Jana Michalsakie 32, Warszawa"
    },
    included: {
      title: "Cena zawiera",
      items: [
        "Zakwaterowanie 7 noclegów",
        "Pełne wyżywienie – 3 posiłki dziennie",
        "Opiekę kadry wychowawczej i trenerskiej",
        "Ubezpieczenie NNW",
        "Program"
      ]
    },
    program: [
      "Wyjścia w góry i doliny - odkryjcie urok tatrzańskich szlaków, podziwiając zapierające dech w piersiach widoki.",
      "Treningi na macie – dla dzieci: judo i karate, dla dorosłych: ćwiczenia wzmacniające dla każdego, niezależnie od wieku i kondycji.",
      "Gry zespołowe – integracja, zdrowa rywalizacja i mnóstwo śmiechu podczas gier dla małych i dużych.",
      "Wizyta w Aqua Parku – wodne szaleństwo i relaks w basenach dla całej rodziny.",
      "Dyskoteka – wieczór pełen tańca, muzyki i dobrej energii",
      "Spotkanie z góralskim gawędziarzem – posłuchajcie fascynujących opowieści o tradycjach, kulturze i historii Podhala.",
      "Animacje dla dzieci i dorosłych – kreatywne warsztaty, zabawy i konkursy, które zagwarantują uśmiech na twarzach wszystkich uczestników."
    ],
    payments: [
      {
        installment: "I rata",
        amount: 200,
        currency: "zł",
        description: "zaliczka gwarantuje miejsce na obozie"
      },
      {
        installment: "II rata",
        amount: 600,
        currency: "zł",
        dueDate: "15.05.2025"
      },
      {
        installment: "III rata",
        amount: 600,
        currency: "zł",
        dueDate: "15.06.2025"
      },
      {
        installment: "IV rata",
        amount: 790,
        currency: "zł",
        dueDate: "1.07.2025"
      }
    ],
    paymentInfo: "Opłaty prosimy dokonywać na poniższy nr konta w tytule 'Rodzinny obóz letni 5-12 lipca 2025, imiona i nazwiska uczestników, nr wpłacanej raty'",
    date: "27.04.2025 - 01.05.2025"
  }
}; 