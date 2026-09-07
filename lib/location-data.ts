export type LocationActivity = "Judo" | "Karate" | "Gimnastyka";

export type LocationPlace = {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  address: string;
  link: string;
  activities?: LocationActivity[];
  hours?: string;
  image?: string;
};

export const locationPlaces: LocationPlace[] = [
  {
    id: "sp340",
    position: { lat: 52.11414262410244, lng: 20.979183105916306 },
    title: "Szkoła Podstawowa 340",
    address: "Jana Ciszewskiego 15, 02-777 Warszawa",
    link: "https://maps.app.goo.gl/F9iebzDe8PTvdB1b9",
    activities: ["Judo", "Gimnastyka"],
    hours: "15:00–20:00",
  },
  {
    id: "sp12",
    position: { lat: 52.1428758424321, lng: 21.02736716213801 },
    title: "Szkoła Podstawowa 12",
    address: "Jana Ciszewskiego 15, 02-777 Warszawa",
    link: "https://maps.app.goo.gl/F9iebzDe8PTvdB1b9",
    activities: ["Judo", "Karate"],
    hours: "16:00–19:00",
  },
  // Placeholder locations for layout; replace with real data when available
  {
    id: "placeholder-ursynow",
    position: { lat: 52.1485, lng: 21.0468 },
    title: "Sala sportowa Ursynów",
    address: "ul. Konrada Wallenroda 2, 02-776 Warszawa",
    link: "https://maps.app.goo.gl/F9iebzDe8PTvdB1b9",
    activities: ["Karate", "Gimnastyka"],
    hours: "14:00–21:00",
  },
  {
    id: "placeholder-mokotow",
    position: { lat: 52.1994, lng: 21.0232 },
    title: "Dojo Mokotów",
    address: "ul. Woronicza 17, 02-625 Warszawa",
    link: "https://maps.app.goo.gl/F9iebzDe8PTvdB1b9",
    activities: ["Judo"],
    hours: "17:00–20:00",
  },
];

export const locationCenter = {
  lat: 52.1782283,
  lng: 21.0485129,
};
