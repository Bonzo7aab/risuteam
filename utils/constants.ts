import {
    Bath, BedDouble, Car, Coffee, Mountain, Snowflake, Sun, Tv, Utensils, Wifi
} from 'lucide-react';

const POLISH_DAY_ORDER = [
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela",
];

export const AMENITY_ICONS: Record<import("@/app/types/types").AmenityType, import("lucide-react").LucideIcon> = {
  rooms: BedDouble,
  bathroom: Bath,
  tv: Tv,
  wifi: Wifi,
  coffee: Coffee,
  restaurant: Utensils,
  mountain: Mountain,
  parking: Car,
  winter: Snowflake,
  summer: Sun,
};

export { POLISH_DAY_ORDER };