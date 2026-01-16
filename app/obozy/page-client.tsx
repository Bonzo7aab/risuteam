"use client";

import {
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
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { fetchCamps, fetchPlaces } from "@/app/actions";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Camp, PlaceType, TabType } from "../types/types";

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

function formatDateRange(date_from: string, date_to: string) {
  const from = new Date(date_from);
  const to = new Date(date_to);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(from.getDate())}.${pad(from.getMonth() + 1)}.${from.getFullYear()} - ${pad(to.getDate())}.${pad(to.getMonth() + 1)}.${to.getFullYear()}`;
}

const CampContent = ({ camp, places }: { camp: Camp; places: PlaceType[] }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const placeName =
    places.find((p) => p.id === camp.hotel_id)?.name || camp.hotel_id;

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
            {camp.title || "Brak tytułu"}
          </h1>
          <div className="text-base md:text-lg mb-6">
            {camp.description || "Brak opisu"}
          </div>
          {camp.images && camp.images.length > 0 ? (
            <div className="relative flex-col md:flex-row flex gap-4 mb-6 justify-center w-full md:w-80 mx-auto">
              {camp.images.map((img, index) => (
                <div key={index} className="relative mx-auto">
                  <img
                    src={typeof img === "string" ? img : img.url}
                    alt={camp.title || "Obóz"}
                    className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity w-48 h-32 object-cover"
                    onClick={() =>
                      setSelectedImage(typeof img === "string" ? img : img.url)
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 mb-6">Brak zdjęć</div>
          )}
          <Dialog
            open={!!selectedImage}
            onOpenChange={() => setSelectedImage(null)}
          >
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none [&>button]:hidden">
              {selectedImage && (
                <div className="relative flex justify-center">
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Expanded view"
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
          <div className="bg-risu-500 backdrop-blur-sm p-4 flex flex-col gap-2">
            <span className="flex gap-2">
              <CalendarDays />
              <span className="text-base md:text-lg">Termin</span>
            </span>
            <span className="text-slate-200 text-right">
              {camp.date_from && camp.date_to
                ? formatDateRange(camp.date_from, camp.date_to)
                : "Brak daty"}
            </span>
          </div>
          <div className="bg-risu-500 p-4 flex flex-col gap-2">
            <span className="flex gap-2">
              <Tag />
              <span className="text-base md:text-lg">Cena</span>
            </span>
            <span className="text-slate-200 text-right">
              {camp.price !== undefined && camp.price !== null
                ? `${camp.price} zł`
                : "Brak ceny"}
            </span>
          </div>
          <div className="bg-risu-500 p-4 flex flex-col gap-2">
            <span className="flex gap-2">
              <MapPinned />
              <span className="text-base md:text-lg">Lokalizacja</span>
            </span>
            <span className="text-slate-200 text-right">
              {placeName || "Brak lokalizacji"}
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 text-center my-16 md:my-32 px-4">
        <div className="border-2 border-risu-300 p-4 rounded-lg">
          <div className="w-full flex justify-center mb-2">
            <Eye />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2 text-risu-400">
            Malownicze widoki
          </h3>
          <p className="text-sm text-slate-100">Odkryjcie piękno Polski.</p>
        </div>
        <div className="border-2 border-risu-300 p-4 rounded-lg">
          <div className="w-full flex justify-center mb-2">
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
          <div className="w-full flex justify-center mb-2">
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
          <div className="w-full flex justify-center mb-2">
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

          {camp.program && camp.program.length > 0 ? (
            camp.program.map((item, index) => (
              <li key={index} className="flex mb-2 gap-2">
                <span className="text-risu-400">
                  <CircleCheck />
                </span>
                <span>{item}</span>
              </li>
            ))
          ) : (
            <li className="text-slate-400">Brak programu</li>
          )}
        </ul>
      </section>

      <section className="mt-16 md:mt-32 mb-8 md:mb-16 md:px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-risu-400 text-black rounded-t-lg p-2">
            <h2 className="text-lg md:text-xl">
              Plan Płatności – Zarezerwuj swoje miejsce!
            </h2>
            <p className="text-center text-base md:text-lg">
              Aby zagwarantować sobie udział w obozie, prosimy o dokonywanie
              wpłat w następujących ratach
            </p>
          </div>

          <div className="p-4 md:p-10 flex flex-col gap-8 py-6">
            {camp.payments && camp.payments.length > 0 ? (
              camp.payments.map((payment, idx) => {
                return (
                  <div key={idx} className="text-center">
                    <div className="text-lg md:text-xl font-semibold mb-1">
                      {payment.installment} rata
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-risu-500 mb-1">
                      {payment.amount} zł
                    </div>
                    {payment.due && (
                      <div className="text-sm text-slate-300 mb-2">
                        Termin płatności: {payment.due}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-slate-400 text-center">
                Brak informacji o płatnościach
              </div>
            )}

            <div>
              <div className="py-3 flex items-center text-risu-400 before:flex-1 before:border-t before:border-risu-700 before:me-6 after:flex-1 after:border-t after:border-risu-700 after:ms-6">
                Dane do Przelewu
              </div>

              <div className="p-4 md:p-6 font-mono text-sm md:text-base">
                <div className="mb-2 flex flex-col md:flex-row justify-center gap-2 md:gap-4">
                  <strong>Numer Konta:</strong>
                  <span className="text-slate-300">
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
                  <span className="text-slate-300">Kacper Lewandowski</span>
                </div>
                <div className="mb-0">
                  <strong>Tytuł Przelewu:</strong>
                  <span className="text-slate-300 block md:inline p-3 rounded mt-1">
                    [Rodzinny obóz letni 5-12 lipca 2025], imiona i nazwiska
                    uczestników, [nr wpłacanej raty]
                  </span>
                </div>
              </div>

              <div className="my-4 flex flex-col">
                <span>Zapisy i więcej informacji:</span>
                <Link href="/kontakt" className="text-risu-400 my-2">
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

const CampsClient = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(
    initialTab || DEFAULT_TAB
  );
  const [camps, setCamps] = useState<Camp[]>([]);
  const [places, setPlaces] = useState<PlaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const selectedTab = searchParams.get("tab") as TabType;
    if (selectedTab && TABS[selectedTab]) {
      setActiveTab(selectedTab);
    } else {
      setActiveTab(DEFAULT_TAB);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [campsData, placesResult] = await Promise.all([
          fetchCamps(),
          fetchPlaces(),
        ]);
        setCamps(campsData);
        setPlaces(placesResult.data || []);
      } catch (err: any) {
        setError(err.message || "Błąd ładowania obozów");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("tab", tab);
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  // Group camps by type
  const campsByType: Record<TabType, Camp[]> = {
    all: camps,
    polkolonie: camps.filter((c) => c.type === "polkolonie"),
    letnie: camps.filter((c) => c.type === "letnie"),
    zimowe: camps.filter((c) => c.type === "zimowe"),
    nocowanka: camps.filter((c) => c.type === "nocowanka"),
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
                  ? "border-risu-400 text-risu-400"
                  : "border-transparent text-gray-300"
              } text-sm whitespace-nowrap hover:text-risu-400 focus:outline-hidden focus:text-risu-400 disabled:opacity-50 disabled:pointer-events-none`}
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
          {loading ? (
            <div className="text-center py-12">Ładowanie obozów...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : campsByType[activeTab].length === 0 ? (
            <div className="text-center py-12">
              Brak obozów w tej kategorii.
            </div>
          ) : activeTab === "all" ? (
            <div className="space-y-12">
              {Object.entries(TABS)
                .filter(([tab]) => tab !== "all")
                .map(([tab, { icon, label }]) => (
                  <div key={tab}>
                    <div className="flex items-center gap-2 mb-16 justify-center">
                      {icon}
                      <h2 className="text-xl font-bold">{label}</h2>
                    </div>
                    {campsByType[tab as TabType].length === 0 ? (
                      <div className="text-center py-8">Brak obozów.</div>
                    ) : (
                      campsByType[tab as TabType].map((camp) => (
                        <CampContent
                          key={camp.id}
                          camp={camp}
                          places={places}
                        />
                      ))
                    )}
                  </div>
                ))}
            </div>
          ) : (
            campsByType[activeTab].map((camp) => (
              <CampContent key={camp.id} camp={camp} places={places} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CampsClient;
