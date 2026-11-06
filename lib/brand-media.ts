/**
 * First-party Risu Team media under `public/`.
 * Prefer these over stock/CDN placeholders in UI and seeds.
 */
export const brandMedia = {
  logo: "/logoWithBorder.png",
  heroFacebook: "/hero-facebook.jpg",
  risuHero: "/risuhero.jpg",
  trainingMat: "/images/652855775_122163406388748139_8085305856522333687_n.jpg",
  trainingGroup: "/images/654197779_122163407402748139_2742728780677275494_n.jpg",
  heroGirl: "/images/hero-girl-500-plus.png",
  willaBasienka: "/willabasienka.jpg",
  zakopaneWinter1: "/zakopane_2025_ver2_1.jpg",
  zakopaneWinter2: "/zakopane_2025_ver2_2.jpg",
  zakopaneSummer1: "/zakopane_lato_2025_1.jpeg",
  zakopaneSummer2: "/zakopane_lato_2025_2.jpeg",
} as const;

/** Coach photo when none is set in Convex. */
export const FALLBACK_COACH_PHOTO = brandMedia.logo;

/** Camp list / detail fallback when `heroImageUrl` is missing. */
export const FALLBACK_CAMP_HERO = brandMedia.zakopaneWinter1;

/** Compact card fallback for camp listings. */
export const FALLBACK_CAMP_CARD = brandMedia.zakopaneWinter2;

/** Curated gallery seed / preview pool (real club photos). */
export const BRAND_GALLERY_IMAGES = [
  {
    imageUrl: brandMedia.trainingMat,
    title: "Trening na macie",
    category: "Judo",
  },
  {
    imageUrl: brandMedia.trainingGroup,
    title: "Zajęcia grupowe",
    category: "Karate",
  },
  {
    imageUrl: brandMedia.heroGirl,
    title: "Risu Team",
    category: "Gimnastyka",
  },
  {
    imageUrl: brandMedia.heroFacebook,
    title: "Spotkanie klubowe",
    category: "Judo",
  },
  {
    imageUrl: brandMedia.zakopaneWinter1,
    title: "Obóz w Zakopanem",
    category: "Judo",
  },
  {
    imageUrl: brandMedia.zakopaneWinter2,
    title: "Zimowy wyjazd",
    category: "Karate",
  },
  {
    imageUrl: brandMedia.zakopaneSummer1,
    title: "Lato w górach",
    category: "Gimnastyka",
  },
  {
    imageUrl: brandMedia.zakopaneSummer2,
    title: "Obóz letni",
    category: "Judo",
  },
  {
    imageUrl: brandMedia.willaBasienka,
    title: "Baza wypadowa",
    category: "Karate",
  },
  {
    imageUrl: brandMedia.risuHero,
    title: "Risu Team — atmosfera",
    category: "Gimnastyka",
  },
] as const;
