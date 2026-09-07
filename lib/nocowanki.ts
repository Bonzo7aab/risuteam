/**
 * Nocowanka event config for admin (display names, capacity, price).
 * Fallback when no Convex `nocowanki` row exists (mirrors klubowa defaults).
 */
export const NOCOWANKI_ADMIN: Record<
  string,
  {
    displayName: string;
    description: string;
    maxParticipants: number;
    price: number;
  }
> = {
  klubowa: {
    displayName: "Klubowa Nocowanka",
    description:
      "Dołącz do nas na najbardziej ekscytującą noc pełną gier, pizzy i nocnych przygód z Risu Team!",
    maxParticipants: 50,
    price: 170,
  },
};

export function getNocowankaDisplayName(slug: string): string {
  return NOCOWANKI_ADMIN[slug]?.displayName ?? slug;
}

export function getNocowankaDescription(slug: string): string {
  return NOCOWANKI_ADMIN[slug]?.description ?? "";
}

export function getNocowankaMaxParticipants(slug: string): number {
  return NOCOWANKI_ADMIN[slug]?.maxParticipants ?? 50;
}

export function getNocowankaPrice(slug: string): number {
  return NOCOWANKI_ADMIN[slug]?.price ?? 170;
}
