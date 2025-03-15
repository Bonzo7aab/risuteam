"use client";
import React, { useState } from "react";
import {
  GoogleMap,
  InfoWindow,
  MarkerF,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";

const places = [
  {
    position: { lat: 52.11414262410244, lng: 20.979183105916306 },
    title: "Szkoła Podstawowo 340",
    address: "Jana Ciszewskiego 15, 02-777 Warszawa",
    link: "https://maps.app.goo.gl/F9iebzDe8PTvdB1b9",
  },
  {
    position: { lat: 52.1428758424321, lng: 21.02736716213801 },
    title: "Szkoła Podstawowa 12",
    address: "Jana Ciszewskiego 15, 02-777 Warszawa",
    link: "https://maps.app.goo.gl/F9iebzDe8PTvdB1b9",
  },
];

const containerStyle = {
  width: "500px",
  height: "500px",
};

const center = {
  lat: 52.1782283,
  lng: 21.0485129,
};

const Map = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });
  const [selectedPlace, setSelectedPlace] = useState<
    | {
        position: { lat: number; lng: number };
        title: string;
        address: string;
        link: string;
      }
    | undefined
  >(undefined);

  return isLoaded ? (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
      {places.map((place) => (
        <Marker
          key={place.title}
          position={place.position}
          title={place.title}
          onClick={() => {
            place === selectedPlace
              ? setSelectedPlace(undefined)
              : setSelectedPlace(place);
          }}
        />
      ))}
      {selectedPlace && (
        <InfoWindow
          position={selectedPlace.position}
          onCloseClick={() => setSelectedPlace(undefined)}
          options={{ pixelOffset: new google.maps.Size(0, -50) }}
          zIndex={1}
        >
          <div className="text-black">
            <h1 className="font-bold">{selectedPlace.title}</h1>
            <div className="inline-block"></div>
            <div className="mr-4">{selectedPlace.address}</div>
            <div className="mr-4">{selectedPlace.link}</div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <Skeleton className="h-[500px] w-[500px] rounded-xl" />
  );
};

const Page = () => {
  return (
    <div className="flex justify-center w-full h-screen gap-8">
      <Skeleton className="h-[500px] w-[500px] rounded-xl" />
      {/* <Map /> */}

      <div className="z-10 flex flex-col gap-4 p-12 mt-8 -ml-32 bg-gray-800 rounded-xl h-fit">
        <h1>Gdzie jesteśmy</h1>
        {places.map((place) => (
          <div key={place.title} className="">
            <h1 className="font-bold leading-8">{place.title}</h1>
            <div className="">{place.address}</div>
            <Button>
              <a href={place.link} className="flex gap-2">
                <MapPinned size={20} />
                <span>Link do mapy</span>
              </a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
