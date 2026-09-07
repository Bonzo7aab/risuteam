"use client";

import { useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Filter, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  locationPlaces,
  locationCenter,
  type LocationPlace,
  type LocationActivity,
} from "@/lib/location-data";
import type { Place } from "@/components/map/location-map";

const ACTIVITY_FILTERS: ("Wszystkie" | LocationActivity)[] = [
  "Wszystkie",
  "Judo",
  "Karate",
  "Gimnastyka",
];

const DynamicLocationMap = dynamic(
  () =>
    import("@/components/map/location-map").then((mod) => ({
      default: mod.LocationMap,
    })),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-full min-h-[400px] w-full rounded-2xl shrink-0" />
    ),
  }
);

function filterPlaces(
  places: LocationPlace[],
  activityFilter: "Wszystkie" | LocationActivity,
  searchQuery: string
): LocationPlace[] {
  return places.filter((place) => {
    const matchesActivity =
      activityFilter === "Wszystkie" ||
      (place.activities && place.activities.includes(activityFilter));
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !normalizedQuery ||
      place.address.toLowerCase().includes(normalizedQuery) ||
      place.title.toLowerCase().includes(normalizedQuery);
    return matchesActivity && matchesSearch;
  });
}

export default function LokalizacjaPage() {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<
    "Wszystkie" | LocationActivity
  >("Wszystkie");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlaces = useMemo(
    () => filterPlaces(locationPlaces, activityFilter, searchQuery),
    [activityFilter, searchQuery]
  );

  // Clear selection if selected place is no longer in filtered list
  const effectiveSelectedId =
    selectedPlaceId && filteredPlaces.some((p) => p.id === selectedPlaceId)
      ? selectedPlaceId
      : null;

  const handleMarkerSelect = useCallback((place: Place) => {
    setSelectedPlaceId(place.id);
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-14rem)] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-soft bg-white dark:bg-stone-900/80">
          {/* Left sidebar */}
          <aside className="w-full lg:w-[400px] lg:max-w-md shrink-0 flex flex-col border-r border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80">
            <div className="p-6 pb-4 border-b border-stone-200 dark:border-stone-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                <Filter className="size-3.5" aria-hidden />
                Lokalizacje
              </div>
              <h1 className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-text-main dark:text-white">
                Nasze <span className="text-primary">lokalizacje</span>
              </h1>
              <p className="text-sm text-text-light dark:text-stone-400 mt-1">
                {filteredPlaces.length}{" "}
                {filteredPlaces.length === 1 ? "placówka" : "placówek"} w Twojej
                okolicy
              </p>
            </div>

            <div className="p-4 space-y-4 border-b border-stone-200 dark:border-stone-700">
              <label className="sr-only" htmlFor="location-search">
                Dzielnica lub kod pocztowy
              </label>
              <Input
                id="location-search"
                type="search"
                placeholder="Dzielnica lub kod pocztowy"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-text-main dark:text-stone-200 placeholder:text-text-light dark:placeholder:text-stone-500"
              />
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_FILTERS.map((activity) => (
                  <button
                    key={activity}
                    type="button"
                    onClick={() => setActivityFilter(activity)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-stone-900 ${
                      activityFilter === activity
                        ? "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredPlaces.map((place) => {
                const isSelected = effectiveSelectedId === place.id;
                return (
                  <article
                    key={place.id}
                    className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-4 shadow-soft overflow-hidden transition-shadow hover:shadow-glow"
                  >
                    <div className="flex gap-4">
                      <div className="flex flex-col flex-1 min-w-0">
                        <h2 className="font-bold text-text-main dark:text-white leading-tight">
                          {place.title}
                        </h2>
                        <p className="text-sm text-text-light dark:text-stone-400 mt-1">
                          {place.address}
                        </p>
                        {place.activities && place.activities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {place.activities.map((a) => (
                              <span
                                key={a}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          className={`mt-3 w-fit rounded-xl ${
                            isSelected
                              ? ""
                              : "border-2 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/40 dark:hover:bg-primary/10"
                          }`}
                          onClick={() => {
                            setSelectedPlaceId(place.id);
                            if (
                              typeof window !== "undefined" &&
                              window.matchMedia("(max-width: 1023px)")
                                .matches
                            ) {
                              requestAnimationFrame(() => {
                                document
                                  .getElementById("lokalizacja-map-anchor")
                                  ?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                              });
                            }
                          }}
                        >
                          Zobacz na mapie
                          <ArrowRight className="ml-1 size-4" aria-hidden />
                        </Button>
                      </div>
                      <div className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800">
                        {place.image ? (
                          <Image
                            src={place.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-text-light dark:text-stone-500">
                            <MapPin className="size-8" aria-hidden />
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="p-4 border-t border-stone-200 dark:border-stone-700">
              <p className="text-sm text-center text-text-light dark:text-stone-500">
                Pokaż wszystkie {locationPlaces.length} lokalizacje
              </p>
            </div>
          </aside>

          {/* Map */}
          <div
            id="lokalizacja-map-anchor"
            className="flex-1 min-h-[400px] scroll-mt-24 lg:min-h-[calc(100vh-14rem)] lg:scroll-mt-0 p-4 lg:p-6"
          >
            <div className="h-full min-h-[400px] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
            <DynamicLocationMap
              center={locationCenter}
              zoom={11}
              places={filteredPlaces}
              selectedPlaceId={effectiveSelectedId}
              onMarkerSelect={handleMarkerSelect}
              className="h-full min-h-[400px] w-full"
            />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
