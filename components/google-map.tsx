import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import React, { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { PlaceType } from "@/lib/types";

const containerStyle = {
  width: "500px",
  height: "500px",
};

const center = {
  lat: 52.1782283,
  lng: 21.0485129,
};

const Map = ({ places }: { places: PlaceType[] }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });
  const [selectedPlace, setSelectedPlace] = useState<PlaceType | undefined>(
    undefined
  );

  return isLoaded ? (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
      {places.map((place) => (
        <Marker
          key={place.id}
          position={place.position}
          title={place.name}
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
            <h1 className="font-bold">{selectedPlace.name}</h1>
            <div className="inline-block"></div>
            <div className="mr-4">{selectedPlace.address}</div>
            <div className="mr-4">{selectedPlace.map_link}</div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <Skeleton className="h-[500px] w-[500px] rounded-xl" />
  );
};

export default Map;
