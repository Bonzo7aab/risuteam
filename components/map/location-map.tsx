"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { LatLngTuple } from "leaflet";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Fix default marker icon paths in Next.js (bundler doesn't resolve leaflet's assets)
if (typeof window !== "undefined") {
  L.Icon.Default.mergeOptions({
    iconUrl: "/leaflet/marker-icon.png",
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });
}

export type Place = {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  address: string;
  link: string;
  activities?: string[];
  hours?: string;
  image?: string;
};

type LocationMapProps = {
  center: { lat: number; lng: number };
  zoom?: number;
  places: Place[];
  className?: string;
  selectedPlaceId?: string | null;
  onMarkerSelect?: (place: Place) => void;
};

/** Match Tailwind `lg` — map layout / popup tuning for narrow viewports. */
function useIsBelowLg() {
  const [below, setBelow] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setBelow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return below;
}

type MapControllerProps = {
  selectedPlaceId: string | null | undefined;
  places: Place[];
  markerRefs: React.MutableRefObject<Record<string, L.Marker | null>>;
  /** Shift map center north so the marker sits lower (room for popup above). */
  offsetMarkerSouthOnScreen: boolean;
};

function MapController({
  selectedPlaceId,
  places,
  markerRefs,
  offsetMarkerSouthOnScreen,
}: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!selectedPlaceId) return;
    const place = places.find((p) => p.id === selectedPlaceId);
    if (!place) return;
    const { lat, lng } = place.position;
    // Center slightly north of the pin so the pin appears in the lower half (popup opens above).
    const latOffset = offsetMarkerSouthOnScreen ? 0.0038 : 0;
    const target: LatLngTuple = [lat + latOffset, lng];
    map.flyTo(target, 15, { duration: 0.5 });
    const t = setTimeout(() => {
      markerRefs.current[selectedPlaceId]?.openPopup();
    }, 400);
    return () => clearTimeout(t);
  }, [selectedPlaceId, places, map, markerRefs, offsetMarkerSouthOnScreen]);

  return null;
}

function PopupContent({ place }: { place: Place }) {
  return (
    <div className="text-left p-1.5 min-w-0 max-w-[min(16.5rem,calc(100vw-4rem))] md:p-2 md:min-w-[220px] md:max-w-none">
      <h3 className="font-bold text-stone-900 text-sm leading-snug md:text-base">
        {place.title}
      </h3>
      {place.hours && (
        <p className="text-xs text-stone-600 mt-0.5 md:text-sm md:mt-1 leading-snug">
          Otwórz dziś: {place.hours}
        </p>
      )}
      <p className="text-xs text-stone-600 mt-0.5 md:text-sm leading-snug">
        {place.address}
      </p>
      <div className="mt-2 flex flex-col gap-1.5 md:mt-3 md:gap-2">
        <Link
          href="/dashboard/zapisy"
          className="inline-flex justify-center rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary-hover transition-colors md:px-3 md:py-2 md:text-sm"
        >
          Zapisz się na zajęcia
        </Link>
        <a
          href={place.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-primary font-medium text-xs md:text-sm risu-underline"
        >
          Otwórz w mapach
        </a>
      </div>
    </div>
  );
}

export function LocationMap({
  center,
  zoom = 10,
  places,
  className,
  selectedPlaceId = null,
  onMarkerSelect,
}: LocationMapProps) {
  const centerTuple: LatLngTuple = [center.lat, center.lng];
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const isMobileLayout = useIsBelowLg();

  return (
    <MapContainer
      center={centerTuple}
      zoom={zoom}
      className={cn(
        "w-full h-full min-h-[300px] rounded-2xl z-0",
        "[&_.leaflet-popup-content-wrapper]:rounded-xl",
        "[&_.leaflet-popup-content]:!m-2 md:[&_.leaflet-popup-content]:!m-3",
        className
      )}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController
        selectedPlaceId={selectedPlaceId}
        places={places}
        markerRefs={markerRefs}
        offsetMarkerSouthOnScreen={isMobileLayout}
      />
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.position.lat, place.position.lng]}
          ref={(ref) => {
            if (ref) markerRefs.current[place.id] = ref;
          }}
          eventHandlers={{
            click: () => onMarkerSelect?.(place),
          }}
        >
          <Popup
            maxWidth={isMobileLayout ? 252 : 340}
            autoPanPadding={[16, 16]}
          >
            <PopupContent place={place} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
