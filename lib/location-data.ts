export type LocationActivity = "Judo" | "Karate" | "Gimnastyka";

export type LocationPlace = {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  address: string;
  link: string;
  activities?: LocationActivity[] | string[];
  hours?: string;
  image?: string;
};

/** Default Warsaw map center when no places are loaded yet. */
export const locationCenter = {
  lat: 52.1782283,
  lng: 21.0485129,
};

export function centerFromPlaces(
  places: Array<{ position: { lat: number; lng: number } }>,
): { lat: number; lng: number } {
  if (places.length === 0) return locationCenter;
  const lat =
    places.reduce((sum, p) => sum + p.position.lat, 0) / places.length;
  const lng =
    places.reduce((sum, p) => sum + p.position.lng, 0) / places.length;
  return { lat, lng };
}
