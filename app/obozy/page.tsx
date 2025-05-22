"use client";

import {
  Bath,
  BedDouble,
  BedSingle,
  Bike,
  CalendarDays,
  CircleCheck,
  Copy,
  Eye,
  List,
  MapPinned,
  Smile,
  Snowflake,
  Sun,
  SunSnow,
  Tag,
  Tv,
  Users,
  Wifi,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CampType, CAMP_DATA, TabType } from "../../lib/camps";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Link from "next/link";

const TABS: Record<TabType, { label: string; icon: React.ReactNode }> = {
  all: {
    label: "Wszystkie",
    icon: <List />,
  },
  polkolonie: {
    label: "Półkolonie",
    icon: <SunSnow />,
  },
  letnie: {
    label: "Obozy letnie",
    icon: <Sun />,
  },
  zimowe: {
    label: "Obozy zimowe",
    icon: <Snowflake />,
  },
  nocowanka: {
    label: "Nocowanka",
    icon: <BedSingle />,
  },
};

const DEFAULT_TAB: TabType = "all";

const CampContent = ({
  content,
}: {
  content: (typeof CAMP_DATA)[CampType];
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      function () {
        alert("Numer konta skopiowany do schowka!");
      },
      function (err) {
        alert("Nie udało się skopiować numeru konta. Spróbuj ręcznie.");
        console.error("Could not copy text: ", err);
      }
    );
  };

  return (
    <div className="text-center border-risu-400 border-y-2">
      <section className="py-8 px-4 md:pl-8 flex flex-col md:flex-row gap-8 md:gap-16">
        <div className="basis-full md:basis-2/3">
          <h1 className="text-3xl md:text-4xl text-risu-300 font-bold capitalize mb-6 md:mb-8">
            {content.title}
          </h1>
          <div className="text-base md:text-lg mb-6">{content.description}</div>
          {content.images && (
            <div className="relative flex-col md:flex-row flex gap-4 mb-6 justify-center w-full md:w-80 mx-auto">
              {content.images.map((image, index) => (
                <div key={index} className="relative mx-auto">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(image.src)}
                  />
                </div>
              ))}
            </div>
          )}
          <Dialog
            open={!!selectedImage}
            onOpenChange={() => setSelectedImage(null)}
          >
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none [&>button]:hidden">
              {selectedImage && (
                <div className="relative flex justify-center">
                  <div className="relative">
                    <Image
                      src={selectedImage}
                      alt="Expanded view"
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="w-auto h-auto max-h-[90vh]"
                    />
                    <button
                      className="absolute top-4 right-4 bg-black/50 hover:bg-gray-400 transition-colors duration-200 hover:text-black text-white rounded-full p-2"
                      onClick={() => setSelectedImage(null)}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col gap-4 basis-full md:basis-1/3">
          <div className="bg-risu-400 text-black p-4 flex flex-col gap-2">
            <span className="flex gap-2">
              <CalendarDays />
              <span className="text-base md:text-lg">Termin</span>
            </span>
            <span className="text-slate-600 text-right">{content.date}</span>
          </div>
          <div className="bg-risu-400 text-black p-4 flex flex-col gap-2">
            <span className="flex gap-2">
              <Tag />
              <span className="text-base md:text-lg">Cena</span>
            </span>
            <span className="text-slate-600 text-right">
              {content.price} zł
            </span>
          </div>
          <div className="bg-risu-400 text-black p-4 flex flex-col gap-2">
            <span className="flex gap-2">
              <MapPinned />
              <span className="text-base md:text-lg">Lokalizacja</span>
            </span>
            <span className="text-slate-600 text-right">
              {content.location.name}
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 text-center my-16 md:my-32 px-4">
        <div className="border-2 border-risu-300 p-4 rounded-lg">
          <div className="w-full flex justify-center">
            <Eye />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2 text-risu-400">
            Malownicze Tatry
          </h3>
          <p className="text-sm text-slate-100">Odkryjcie piękno polski.</p>
        </div>
        <div className="border-2 border-risu-300 p-4 rounded-lg">
          <div className="w-full flex justify-center">
            <Users />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2 text-risu-400">
            Wspólny Czas
          </h3>
          <p className="text-sm text-slate-100">
            Niezapomniane chwile dla całej rodziny.
          </p>
        </div>
        <div className="border-2 border-risu-300 p-4 rounded-lg">
          <div className="w-full flex justify-center">
            <Bike />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2 text-risu-400">
            Aktywny Wypoczynek
          </h3>
          <p className="text-sm text-slate-100">
            Sport, zabawa i ruch na świeżym powietrzu.
          </p>
        </div>
        <div className="border-2 border-risu-300 p-4 rounded-lg">
          <div className="w-full flex justify-center">
            <Smile />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2 text-risu-400">
            Relaks i Zabawa
          </h3>
          <p className="text-sm text-slate-100">
            Odpoczynek i radość dla każdego.
          </p>
        </div>
      </section>

      <section className="my-16 md:my-32 px-4">
        <h1 className="text-xl md:text-2xl mb-4">Program</h1>
        <ul className="p-4 md:p-8 relative">
          <div className="hidden xl:block absolute -top-4 -left-4 w-32 h-32 border-l-2 border-t-2 border-risu-500 opacity-70"></div>
          <div className="hidden xl:block absolute -bottom-4 -right-4 w-32 h-32 border-r-2 border-b-2 border-risu-500 opacity-70"></div>

          {content.program.map((item, index) => (
            <li key={index} className="flex mb-2 gap-2">
              <span className="text-risu-400">
                <CircleCheck />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="my-16 md:my-32 md:px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <img
                src="/willabasienka.jpg"
                alt="Willa Basieńka - zdjęcie poglądowe"
                className="rounded-xl w-full h-auto object-cover"
              />
            </div>
            <div className="bg-risu-400 p-4 md:p-8 rounded-xl shadow-md shadow-risu-400/50">
              <h3>Komfort i Wygoda w Sercu Gór</h3>
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-slate-800">
                Willa Basieńka
              </h2>
              <p className="mb-6 leading-relaxed">
                Willa Basieńka zlokalizowana jest w pięknej, zalesionej okolicy
                w pobliżu kompleksu Nosal oraz kolejki na Kasprowy Wierch. To
                idealne miejsce na odpoczynek i bazę wypadową do górskich
                wędrówek.
              </p>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-center gap-2">
                  <BedDouble />
                  Pokoje 2, 3, 4, 5 osobowe
                </li>
                <li className="flex items-center gap-2">
                  <Bath />
                  Pełny węzeł sanitarny w każdym pokoju
                </li>
                <li className="flex items-center gap-2">
                  <Tv />
                  Telewizor w każdym pokoju
                </li>
                <li className="flex items-center gap-2">
                  <Wifi />
                  Dostęp do bezpłatnego WiFi
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 md:mt-32 mb-8 md:mb-16 md:px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-risu-400 text-black rounded-t-lg p-2">
            <h2 className="text-lg md:text-xl">
              Plan Płatności – Zarezerwuj Swoje Miejsce!
            </h2>
            <p className="text-center text-base md:text-lg">
              Aby zagwarantować sobie udział w obozie, prosimy o dokonywanie
              wpłat w następujących ratach
            </p>
          </div>

          <div className="p-4 md:p-10 gap-y-8 flex flex-col">
            <div className="payment-step">
              <h3 className="text-lg md:text-xl font-semibold mb-1">
                I Rata (Zaliczka)
              </h3>
              <p className="text-xl md:text-2xl font-bold text-risu-600 mb-1">
                200 zł
              </p>
              <p className="text-sm text-slate-500 mb-2">
                Przy zapisie – gwarantuje miejsce na obozie.
              </p>
            </div>
            <div className="payment-step">
              <h3 className="text-lg md:text-xl font-semibold mb-1">II Rata</h3>
              <p className="text-xl md:text-2xl font-bold text-risu-600 mb-1">
                600 zł
              </p>
              <p className="text-sm text-slate-500 mb-2">
                Termin płatności: do 15.05.2025
              </p>
            </div>
            <div className="payment-step">
              <h3 className="text-lg md:text-xl font-semibold mb-1">
                III Rata
              </h3>
              <p className="text-xl md:text-2xl font-bold text-risu-600 mb-1">
                600 zł
              </p>
              <p className="text-sm text-slate-500 mb-2">
                Termin płatności: do 15.06.2025
              </p>
            </div>
            <div className="payment-step">
              <h3 className="text-lg md:text-xl font-semibold mb-1">IV Rata</h3>
              <p className="text-xl md:text-2xl font-bold text-risu-600 mb-1">
                790 zł
              </p>
              <p className="text-sm text-slate-500 mb-2">
                Termin płatności: do 01.07.2025
              </p>
            </div>

            <div>
              <div className="py-3 flex items-center text-risu-400 before:flex-1 before:border-t before:border-risu-700 before:me-6 after:flex-1 after:border-t after:border-risu-700 after:ms-6">
                Dane do Przelewu
              </div>

              <div className="p-4 md:p-6 font-mono text-sm md:text-base">
                <div className="mb-2 flex flex-col md:flex-row justify-center gap-2 md:gap-4">
                  <strong>Numer Konta:</strong>
                  <span className="text-slate-400">
                    28 1090 1694 0000 0001 3471 6556
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard("28 1090 1694 0000 0001 3471 6556")
                    }
                    className="text-risu-400 hover:text-risu-700 flex gap-1 justify-center md:justify-start"
                  >
                    <Copy /> Kopiuj
                  </button>
                </div>
                <div className="mb-2">
                  <strong>Odbiorca: </strong>
                  <span className="text-slate-400">Kacper Lewandowski</span>
                </div>
                <div className="mb-0">
                  <strong>Tytuł Przelewu:</strong>
                  <span className="text-slate-400 block md:inline p-3 rounded mt-1">
                    [Rodzinny obóz letni 5-12 lipca 2025], imiona i nazwiska
                    uczestników, [nr wpłacanej raty]
                  </span>
                </div>
              </div>

              <div className="my-4 flex flex-col">
                <span>Zapisy i więcej informacji:</span>
                <Link href="/kontakt" className="text-risu-400">
                  Kontakt
                </Link>
                <span>Do zobaczenia!</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Obozy = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(
    initialTab || DEFAULT_TAB
  );

  useEffect(() => {
    const selectedTab = searchParams.get("tab") as TabType;
    if (selectedTab && TABS[selectedTab]) {
      setActiveTab(selectedTab);
    } else {
      setActiveTab(DEFAULT_TAB);
    }
  }, [searchParams]);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);

    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("tab", tab);
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  return (
    <div className="max-w-7xl mx-auto md:p-4">
      <div className="flex justify-center pb-8">
        <nav
          className="flex md:gap-x-3 gap-x-8"
          aria-label="Tabs"
          role="tablist"
          aria-orientation="horizontal"
        >
          {Object.entries(TABS).map(([tab, { label, icon }]) => (
            <button
              key={tab}
              type="button"
              className={`py-4 px-1 inline-flex items-center gap-x-2 border-b-2 ${
                activeTab === tab
                  ? "border-risu-600 text-risu-600"
                  : "border-transparent text-gray-500"
              } text-sm whitespace-nowrap hover:text-risu-600 focus:outline-hidden focus:text-risu-600 disabled:opacity-50 disabled:pointer-events-none`}
              id={`tabs-with-icons-item-${tab}`}
              aria-selected={activeTab === tab}
              onClick={() => handleTabClick(tab as TabType)}
              role="tab"
            >
              {icon}
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-3 w-full flex justify-center">
        <div
          role="tabpanel"
          aria-labelledby={`tabs-with-icons-item-${activeTab}`}
          className="w-full"
        >
          {activeTab === "all" ? (
            <div className="space-y-12">
              {Object.entries(CAMP_DATA).map(([tab, content]) => (
                <div key={tab}>
                  <div className="flex items-center gap-2 mb-16 justify-center">
                    {TABS[tab as TabType].icon}
                    <h2 className="text-xl font-bold">
                      {TABS[tab as TabType].label}
                    </h2>
                  </div>
                  <CampContent content={content} />
                </div>
              ))}
            </div>
          ) : (
            <CampContent content={CAMP_DATA[activeTab]} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Obozy;
