import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";

const PUBLIC_ACTIVITIES = ["Judo", "Karate", "Gimnastyka"] as const;

function formatPublicAddress(loc: {
  address: string;
  city: string;
  postalCode?: string;
}): string {
  const street = loc.address.trim();
  const postal = loc.postalCode?.trim();
  const city = loc.city.trim();
  if (postal) return `${street}, ${postal} ${city}`;
  return `${street}, ${city}`;
}

function normalizeActivity(discipline: string): string | null {
  const trimmed = discipline.trim();
  const match = PUBLIC_ACTIVITIES.find(
    (a) => a.toLowerCase() === trimmed.toLowerCase(),
  );
  return match ?? null;
}

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const list = await ctx.db.query("locations").collect();
    return list.sort((a, b) => a.name.localeCompare(b.name));
  },
});

/** Public map / list for /lokalizacja and kontakt. */
export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const [locations, classes] = await Promise.all([
      ctx.db.query("locations").collect(),
      ctx.db.query("classes").collect(),
    ]);

    const activitiesByLocation = new Map<string, Set<string>>();
    for (const cls of classes) {
      if (!cls.isActive) continue;
      const activity = normalizeActivity(cls.discipline);
      if (!activity) continue;
      const key = cls.locationId;
      const set = activitiesByLocation.get(key) ?? new Set<string>();
      set.add(activity);
      activitiesByLocation.set(key, set);
    }

    return locations
      .filter(
        (loc) =>
          loc.isPublic !== false &&
          typeof loc.lat === "number" &&
          typeof loc.lng === "number" &&
          Number.isFinite(loc.lat) &&
          Number.isFinite(loc.lng),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((loc) => {
        const activities = [
          ...(activitiesByLocation.get(loc._id) ?? new Set<string>()),
        ].sort((a, b) => a.localeCompare(b));
        return {
          id: loc._id,
          title: loc.name,
          address: formatPublicAddress(loc),
          link:
            loc.mapsUrl?.trim() ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              formatPublicAddress(loc),
            )}`,
          position: { lat: loc.lat!, lng: loc.lng! },
          hours: loc.hours?.trim() || undefined,
          activities: activities.length > 0 ? activities : undefined,
        };
      });
  },
});

const createArgs = {
  name: v.string(),
  address: v.string(),
  city: v.string(),
  postalCode: v.optional(v.string()),
  mapsUrl: v.optional(v.string()),
  lat: v.optional(v.number()),
  lng: v.optional(v.number()),
  hours: v.optional(v.string()),
  isPublic: v.optional(v.boolean()),
};

export const create = mutation({
  args: createArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Nazwa jest wymagana.");
    if (!args.address.trim()) throw new Error("Adres jest wymagany.");
    if (!args.city.trim()) throw new Error("Miasto jest wymagane.");
    if (
      (args.lat !== undefined && args.lng === undefined) ||
      (args.lng !== undefined && args.lat === undefined)
    ) {
      throw new Error("Podaj zarówno szerokość, jak i długość geograficzną.");
    }
    return await ctx.db.insert("locations", {
      name,
      address: args.address.trim(),
      city: args.city.trim(),
      postalCode: args.postalCode?.trim() || undefined,
      mapsUrl: args.mapsUrl?.trim() || undefined,
      lat: args.lat,
      lng: args.lng,
      hours: args.hours?.trim() || undefined,
      isPublic: args.isPublic ?? true,
    });
  },
});

const updateArgs = {
  id: v.id("locations"),
  name: v.optional(v.string()),
  address: v.optional(v.string()),
  city: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  mapsUrl: v.optional(v.string()),
  lat: v.optional(v.union(v.number(), v.null())),
  lng: v.optional(v.union(v.number(), v.null())),
  hours: v.optional(v.union(v.string(), v.null())),
  isPublic: v.optional(v.boolean()),
};

export const update = mutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...rest } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Nie znaleziono lokalizacji.");
    const updates: Record<string, unknown> = {};
    if (rest.name !== undefined) {
      const name = rest.name.trim();
      if (!name) throw new Error("Nazwa jest wymagana.");
      updates.name = name;
    }
    if (rest.address !== undefined) {
      if (!rest.address.trim()) throw new Error("Adres jest wymagany.");
      updates.address = rest.address.trim();
    }
    if (rest.city !== undefined) {
      if (!rest.city.trim()) throw new Error("Miasto jest wymagane.");
      updates.city = rest.city.trim();
    }
    if (rest.postalCode !== undefined)
      updates.postalCode = rest.postalCode?.trim() || undefined;
    if (rest.mapsUrl !== undefined)
      updates.mapsUrl = rest.mapsUrl?.trim() || undefined;
    if (rest.lat !== undefined) updates.lat = rest.lat ?? undefined;
    if (rest.lng !== undefined) updates.lng = rest.lng ?? undefined;
    if (rest.hours !== undefined)
      updates.hours = rest.hours?.trim() || undefined;
    if (rest.isPublic !== undefined) updates.isPublic = rest.isPublic;

    const nextLat =
      updates.lat !== undefined ? (updates.lat as number | undefined) : existing.lat;
    const nextLng =
      updates.lng !== undefined ? (updates.lng as number | undefined) : existing.lng;
    if (
      (nextLat !== undefined && nextLng === undefined) ||
      (nextLng !== undefined && nextLat === undefined)
    ) {
      throw new Error("Podaj zarówno szerokość, jak i długość geograficzną.");
    }

    if (Object.keys(updates).length > 0) await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const classRef = await ctx.db
      .query("classes")
      .withIndex("by_location", (q) => q.eq("locationId", args.id))
      .first();
    if (classRef) {
      throw new Error(
        "Nie można usunąć — lokalizacja jest przypisana do zajęć. Zmień lub usuń najpierw grupy.",
      );
    }
    const eventRef = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("locationId"), args.id))
      .first();
    if (eventRef) {
      throw new Error(
        "Nie można usunąć — lokalizacja jest przypisana do eventów.",
      );
    }
    const campRef = await ctx.db
      .query("camps")
      .filter((q) => q.eq(q.field("locationId"), args.id))
      .first();
    if (campRef) {
      throw new Error(
        "Nie można usunąć — lokalizacja jest przypisana do obozów.",
      );
    }
    await ctx.db.delete(args.id);
  },
});

/**
 * Backfill public map metadata for known training venues.
 * Safe to run multiple times — only patches matching names missing coords.
 * Callable from admin UI or `npx convex run locations:backfillPublicMeta`.
 */
export const backfillPublicMeta = mutation({
  args: {},
  handler: async (ctx) => {
    // Prefer admin session when present; still allow CLI/dashboard one-off runs.
    const identity = await ctx.auth.getUserIdentity();
    if (identity) await requireAdmin(ctx);

    const known: Record<
      string,
      { lat: number; lng: number; hours: string; mapsUrl: string }
    > = {
      "Szkoła Podstawowa 340": {
        lat: 52.11414262410244,
        lng: 20.979183105916306,
        hours: "15:00–20:00",
        mapsUrl: "https://maps.app.goo.gl/F9iebzDe8PTvdB1b9",
      },
      "Szkoła Podstawowa 12": {
        lat: 52.1428758424321,
        lng: 21.02736716213801,
        hours: "16:00–19:00",
        mapsUrl: "https://maps.app.goo.gl/F9iebzDe8PTvdB1b9",
      },
    };

    const locations = await ctx.db.query("locations").collect();
    let patched = 0;
    for (const loc of locations) {
      const meta = known[loc.name];
      if (!meta) continue;
      const needsPatch =
        loc.lat === undefined ||
        loc.lng === undefined ||
        !loc.hours?.trim() ||
        !loc.mapsUrl?.trim();
      if (!needsPatch) continue;
      await ctx.db.patch(loc._id, {
        lat: loc.lat ?? meta.lat,
        lng: loc.lng ?? meta.lng,
        hours: loc.hours?.trim() || meta.hours,
        mapsUrl: loc.mapsUrl?.trim() || meta.mapsUrl,
        isPublic: loc.isPublic ?? true,
      });
      patched += 1;
    }
    return { patched };
  },
});
