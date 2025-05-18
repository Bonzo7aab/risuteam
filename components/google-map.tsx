import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import React, { useState } from "react";
import { Skeleton } from "./skeleton";
import { PlaceType } from "@/lib/types";

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "500px",
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
    <div className="w-full h-[500px] md:h-[600px] lg:h-[700px]">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11}>
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
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  ) : (
    <Skeleton className="w-full h-[500px] md:h-[600px] lg:h-[700px] rounded-xl" />
  );
};

export default Map;
