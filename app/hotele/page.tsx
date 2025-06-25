import { AMENITY_ICONS } from "@/utils/constants";
import { Metadata } from "next";

import { fetchHotelsWithAmenities } from "@/app/actions";

import { Hotel } from "../types/types";

export const metadata: Metadata = {
  title: "Risu Team | Hotele",
};

function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <div className="border rounded-xl shadow-lg overflow-hidden my-12 mx-auto max-w-3xl w-full">
      <div className="relative w-full h-64 md:h-96">
        <img
          src={hotel.image_src}
          alt={hotel.image_alt}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
          {hotel.title}
        </h2>
        <h3 className="text-lg md:text-xl text-muted-foreground mb-4 text-center">
          {hotel.subtitle}
        </h3>
        <p className="mb-6 leading-relaxed text-center max-w-2xl mx-auto">
          {hotel.description}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 max-w-3xl mx-auto">
          {hotel.amenities.map((amenity, index) => {
            const Icon = AMENITY_ICONS[amenity.type];
            return (
              <div
                key={index}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-risu-50 hover:bg-risu-100 rounded-lg transition-colors"
              >
                {Icon && <Icon className="w-6 h-6 text-risu-500" />}
                <span className="text-sm text-center font-medium">
                  {amenity.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default async function Hotels() {
  const { data: hotels, error } = await fetchHotelsWithAmenities();

  return (
    <div className="flex flex-col mx-auto max-w-4xl w-full px-2 md:px-0 my-8">
      <div className="text-center text-4xl mb-8 flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">
          Hotele do których jeździmy
        </h1>
      </div>

      {error && (
        <div className="text-red-500 text-center py-8">
          Błąd ładowania hoteli: {error}
        </div>
      )}
      {(!hotels || hotels.length === 0) && !error && (
        <div className="text-center py-8">Brak dostępnych hoteli.</div>
      )}
      {hotels &&
        hotels.length > 0 &&
        hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)}
    </div>
  );
}
