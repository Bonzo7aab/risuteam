"use client";

import { Skeleton } from "@/components/skeleton";
import { MapPinned } from "lucide-react";
import Map from "@/components/google-map";
import { PlaceType } from "@/lib/types";

interface LocationContentProps {
  places: PlaceType[];
}

export default function LocationContent({ places }: LocationContentProps) {
  return (
    <div className="flex flex-col md:flex-row justify-center w-full min-h-screen gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-8 p-8 md:p-12 border-y md:border border-risu-400 bg-risu-700/20 md:rounded-xl h-fit">
        <h1 className="text-2xl">Gdzie jesteśmy</h1>
        {places ? (
          places.map((place) => (
            <div key={place.id} className="flex flex-col gap-2">
              <h1 className="font-bold leading-8 text-risu-200">
                {place.name}
              </h1>
              <div>{place.address}</div>
              <a
                href={place.map_link}
                target="_blank"
                className="flex gap-2 hover:text-gray-300"
              >
                <MapPinned size={20} />
                <span>Link do mapy</span>
              </a>
            </div>
          ))
        ) : (
          <Skeleton className="h-[500px] w-full rounded-xl" />
        )}
      </div>
      <div className="w-full md:w-1/2 lg:w-2/3">
        <Map places={places} />
      </div>
    </div>
  );
}
