"use client";

import { useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { Filter, MapPin, ArrowRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  centerFromPlaces,
  locationCenter,
  type LocationActivity,
  type LocationPlace,
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
      (place.activities &&
        place.activities.some(
          (a) => a.toLowerCase() === activityFilter.toLowerCase(),
        ));
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !normalizedQuery ||
      place.address.toLowerCase().includes(normalizedQuery) ||
      place.title.toLowerCase().includes(normalizedQuery);
    return matchesActivity && matchesSearch;
  });
}

export default function LokalizacjaPage() {
  const publicLocations = useQuery(api.locations.listPublic);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<
    "Wszystkie" | LocationActivity
  >("Wszystkie");
  const [searchQuery, setSearchQuery] = useState("");

  const locationPlaces: LocationPlace[] = useMemo(
    () => (publicLocations ?? []) as LocationPlace[],
    [publicLocations],
  );

  const filteredPlaces = useMemo(
    () => filterPlaces(locationPlaces, activityFilter, searchQuery),
    [locationPlaces, activityFilter, searchQuery]
  );

  const mapCenter = useMemo(
    () => centerFromPlaces(filteredPlaces.length > 0 ? filteredPlaces : locationPlaces),
    [filteredPlaces, locationPlaces],
  );

  // Clear selection if selected place is no longer in filtered list
  const effectiveSelectedId =
    selectedPlaceId && filteredPlaces.some((p) => p.id === selectedPlaceId)
      ? selectedPlaceId
      : null;

  const handleMarkerSelect = useCallback((place: Place) => {
    setSelectedPlaceId(place.id);
  }, []);

  const isLoading = publicLocations === undefined;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex w-full min-h-[calc(100vh-14rem)] flex-col overflow-hidden lg:flex-row lg:rounded-2xl lg:border lg:border-stone-200/90 lg:bg-white lg:shadow-card dark:lg:border-white/12 dark:lg:bg-surface-dark dark:lg:shadow-card-dark">
          {/* Left sidebar */}
          <aside className="flex w-full shrink-0 flex-col border-b border-stone-200 bg-transparent dark:border-white/10 lg:w-[400px] lg:max-w-md lg:border-b-0 lg:border-r lg:bg-stone-50/80 dark:lg:border-white/10 dark:lg:bg-black/20">
            <div className="border-b border-stone-200 p-6 pb-4 dark:border-white/10">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary dark:bg-orange-900/30">
                <Filter className="size-3.5" aria-hidden />
                Lokalizacje
              </div>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-text-main dark:text-white md:text-3xl">
                Nasze <span className="text-primary">lokalizacje</span>
              </h1>
              <p className="mt-1 text-sm text-text-light dark:text-stone-400">
                {isLoading
                  ? "Ładowanie…"
                  : `${filteredPlaces.length} ${
                      filteredPlaces.length === 1 ? "placówka" : "placówek"
                    } w Twojej okolicy`}
              </p>
            </div>

            <div className="space-y-4 border-b border-stone-200 p-4 dark:border-white/10">
              <label className="sr-only" htmlFor="location-search">
                Dzielnica lub kod pocztowy
              </label>
              <Input
                id="location-search"
                type="search"
                placeholder="Dzielnica lub kod pocztowy"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border-stone-200 bg-white text-text-main placeholder:text-text-light dark:border-white/12 dark:bg-surface-dark dark:text-stone-200 dark:placeholder:text-stone-500"
              />
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_FILTERS.map((activity) => (
                  <button
                    key={activity}
                    type="button"
                    onClick={() => setActivityFilter(activity)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-background-dark ${
                      activityFilter === activity
                        ? "bg-primary text-primary-foreground shadow-md hover:bg-primary-hover"
                        : "border border-stone-200/80 bg-white text-stone-600 hover:bg-stone-100 dark:border-white/12 dark:bg-surface-dark dark:text-stone-300 dark:hover:bg-white/6"
                    }`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-28 w-full rounded-2xl" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                </div>
              ) : filteredPlaces.length === 0 ? (
                <p className="px-1 py-8 text-center text-sm text-text-light dark:text-stone-400">
                  {locationPlaces.length === 0
                    ? "Brak lokalizacji publicznych. Uzupełnij współrzędne w panelu admina."
                    : "Brak wyników dla wybranych filtrów."}
                </p>
              ) : (
                filteredPlaces.map((place) => {
                  const isSelected = effectiveSelectedId === place.id;
                  const selectOnMap = () => {
                    setSelectedPlaceId(place.id);
                    if (
                      typeof window !== "undefined" &&
                      window.matchMedia("(max-width: 1023px)").matches
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
                  };
                  return (
                    <article
                      key={place.id}
                      className={`group relative overflow-hidden rounded-2xl border bg-white shadow-card transition-[border-color,box-shadow,transform] duration-300 dark:shadow-card-dark ${
                        isSelected
                          ? "border-primary/55 shadow-card-hover ring-1 ring-primary/25 dark:border-primary/50 dark:bg-surface-dark dark:ring-primary/20"
                          : "border-stone-200/90 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-card-hover motion-reduce:hover:translate-y-0 dark:border-white/14 dark:bg-surface-dark dark:hover:border-white/20 dark:hover:shadow-card-dark-hover"
                      }`}
                    >
                      <span
                        className={`absolute inset-y-0 left-0 w-1 transition-colors ${
                          isSelected ? "bg-primary" : "bg-transparent group-hover:bg-primary/40"
                        }`}
                        aria-hidden
                      />
                      <div className="flex min-w-0 flex-col gap-3 p-4 pl-5">
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h2 className="text-[15px] font-bold leading-snug tracking-tight text-text-main dark:text-white">
                                {place.title}
                              </h2>
                              {isSelected ? (
                                <span className="inline-flex shrink-0 items-center rounded-md bg-primary/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                                  Wybrane
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1.5 flex items-start gap-1.5 text-sm leading-snug text-stone-500 dark:text-stone-400">
                              <MapPin
                                className="mt-0.5 size-3.5 shrink-0 text-primary/80"
                                aria-hidden
                              />
                              <span className="min-w-0">{place.address}</span>
                            </p>
                            {place.hours ? (
                              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                                <span
                                  className="material-symbols-outlined text-[15px] text-primary/80"
                                  aria-hidden
                                >
                                  schedule
                                </span>
                                {place.hours}
                              </p>
                            ) : null}
                          </div>

                          {place.activities && place.activities.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {place.activities.map((a) => (
                                <span
                                  key={a}
                                  className="inline-flex items-center rounded-md border border-stone-200/90 bg-stone-50 px-2 py-0.5 text-[11px] font-semibold text-stone-600 dark:border-white/12 dark:bg-white/5 dark:text-stone-300"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          <div className="mt-auto flex items-center justify-between gap-2 border-t border-stone-100 pt-3 dark:border-white/8">
                            <Button
                              size="sm"
                              variant={isSelected ? "default" : "outline"}
                              className={`h-9 rounded-xl px-3 text-xs font-bold ${
                                isSelected
                                  ? ""
                                  : "border-stone-200 text-text-main hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:border-white/14 dark:text-stone-100 dark:hover:border-primary/40 dark:hover:bg-primary/10"
                              }`}
                              onClick={selectOnMap}
                            >
                              {isSelected ? "Wybrane na mapie" : "Pokaż na mapie"}
                              <ArrowRight className="ml-1 size-3.5" aria-hidden />
                            </Button>
                            <a
                              href={place.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-9 items-center gap-1 rounded-xl px-2 text-xs font-semibold text-stone-500 transition-colors hover:text-primary dark:text-stone-400 dark:hover:text-primary"
                            >
                              Google Maps
                              <span className="material-symbols-outlined text-[16px]" aria-hidden>
                                open_in_new
                              </span>
                            </a>
                          </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <div className="border-t border-stone-200 p-4 dark:border-white/10">
              <p className="text-center text-sm text-text-light dark:text-stone-500">
                {isLoading
                  ? "Ładowanie lokalizacji…"
                  : `Pokaż wszystkie ${locationPlaces.length} lokalizacje`}
              </p>
            </div>
          </aside>

          {/* Map */}
          <div
            id="lokalizacja-map-anchor"
            className="flex-1 min-h-[400px] scroll-mt-24 lg:min-h-[calc(100vh-14rem)] lg:scroll-mt-0 p-4 lg:p-6"
          >
            <div className="h-full min-h-[400px] overflow-hidden rounded-xl border border-stone-200/90 dark:border-white/12">
            <DynamicLocationMap
              center={mapCenter.lat ? mapCenter : locationCenter}
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
