import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./authHelpers";

const CONVEX_ID_LENGTH = 32;
function looksLikeConvexId(s: string): boolean {
  return (
    s.length === CONVEX_ID_LENGTH &&
    /^[a-z0-9]+$/.test(s)
  );
}

export const getCampById = query({
  args: { campId: v.id("camps") },
  handler: async (ctx, args) => {
    const camp = await ctx.db.get("camps", args.campId);
    if (!camp) return null;
    const location = camp.locationId
      ? await ctx.db.get("locations", camp.locationId)
      : undefined;
    return { ...camp, id: camp.slug, location: location ?? undefined };
  },
});

export const getCampBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const slug = args.slug.trim();
    if (!slug) return null;
    const camp = await ctx.db
      .query("camps")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!camp) return null;
    const location = camp.locationId
      ? await ctx.db.get("locations", camp.locationId)
      : undefined;
    return { ...camp, id: camp.slug, location: location ?? undefined };
  },
});

/**
 * Resolve a camp by URL segment: tries slug first, then Convex id if segment looks like an id.
 * Use so both /obozy/letni-oboz-sportowy-2024-2026 and /obozy/j57cbempy62swcxb6hn0cc5g8d81t6qe work.
 */
export const getCampBySlugOrId = query({
  args: { slugOrId: v.string() },
  handler: async (ctx, args) => {
    const raw = args.slugOrId.trim();
    if (!raw) return null;
    const bySlug = await ctx.db
      .query("camps")
      .withIndex("by_slug", (q) => q.eq("slug", raw))
      .first();
    if (bySlug) {
      const location = bySlug.locationId
        ? await ctx.db.get("locations", bySlug.locationId)
        : undefined;
      const regs = await ctx.db
        .query("registrations")
        .withIndex("by_camp", (q) => q.eq("campId", bySlug._id))
        .collect();
      return {
        ...bySlug,
        id: bySlug.slug,
        location: location ?? undefined,
        registrationCount: regs.length,
      };
    }
    if (looksLikeConvexId(raw)) {
      const camp = await ctx.db.get("camps", raw as Id<"camps">);
      if (!camp) return null;
      const location = camp.locationId
        ? await ctx.db.get("locations", camp.locationId)
        : undefined;
      const regs = await ctx.db
        .query("registrations")
        .withIndex("by_camp", (q) => q.eq("campId", camp._id))
        .collect();
      return {
        ...camp,
        id: camp.slug,
        location: location ?? undefined,
        registrationCount: regs.length,
      };
    }
    return null;
  },
});

export const getCamps = query({
  args: {
    slug: v.optional(v.string()),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const activeOnly = args.activeOnly ?? true;

    let camps;
    if (args.slug) {
      camps = await ctx.db
        .query("camps")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
        .collect();
    } else {
      camps = await ctx.db.query("camps").collect();
    }

    const filtered = activeOnly ? camps.filter((c) => c.isActive) : camps;

    const locationIds = [
      ...new Set(
        filtered
          .map((c) => c.locationId)
          .filter((id): id is NonNullable<typeof id> => id !== undefined)
      ),
    ];
    const locations = await Promise.all(locationIds.map((id) => ctx.db.get(id)));
    const locMap = Object.fromEntries(
      locations.filter(Boolean).map((l) => [l!._id, l!])
    );

    const filteredIds = new Set(filtered.map((c) => c._id));
    const allRegs = await ctx.db.query("registrations").collect();
    const regCountByCamp: Record<string, number> = {};
    for (const r of allRegs) {
      if (filteredIds.has(r.campId)) {
        const id = r.campId as string;
        regCountByCamp[id] = (regCountByCamp[id] ?? 0) + 1;
      }
    }

    return filtered.map((c) => ({
      ...c,
      id: c.slug,
      location: c.locationId ? locMap[c.locationId] : undefined,
      registrationCount: regCountByCamp[c._id as string] ?? 0,
    }));
  },
});

/**
 * Create a new camp (admin only).
 */
export const create = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    locationId: v.optional(v.id("locations")),
    maxParticipants: v.optional(v.number()),
    price: v.optional(v.number()),
    isActive: v.boolean(),
    isRegistrationOpen: v.optional(v.boolean()),
    category: v.optional(v.string()),
    ageGroup: v.optional(v.string()),
    heroImageUrl: v.optional(v.string()),
    galleryImageUrls: v.optional(v.array(v.string())),
    dailySchedule: v.optional(
      v.array(v.object({ time: v.string(), activity: v.string() }))
    ),
    scheduleByDay: v.optional(
      v.array(
        v.object({
          dayLabel: v.string(),
          slots: v.array(v.object({ time: v.string(), activity: v.string() })),
        })
      )
    ),
    includedItems: v.optional(v.array(v.string())),
    generalAttractions: v.optional(v.array(v.string())),
    coachIds: v.optional(v.array(v.id("coaches"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const slug = args.slug.trim();
    if (!slug) throw new Error("Slug jest wymagany.");
    if (!args.name.trim()) throw new Error("Nazwa jest wymagana.");
    const existing = await ctx.db
      .query("camps")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) throw new Error("Obóz z tym slug już istnieje.");
    return await ctx.db.insert("camps", {
      slug,
      name: args.name.trim(),
      description: args.description?.trim() || undefined,
      startDate: args.startDate,
      endDate: args.endDate,
      locationId: args.locationId,
      maxParticipants: args.maxParticipants,
      price: args.price,
      isActive: args.isActive,
      isRegistrationOpen: args.isRegistrationOpen,
      category: args.category,
      ageGroup: args.ageGroup,
      heroImageUrl: args.heroImageUrl,
      galleryImageUrls: args.galleryImageUrls,
      dailySchedule: args.dailySchedule,
      scheduleByDay: args.scheduleByDay,
      includedItems: args.includedItems,
      generalAttractions: args.generalAttractions,
      coachIds: args.coachIds,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update a camp (admin only).
 */
export const update = mutation({
  args: {
    id: v.id("camps"),
    /** Always sent from the edit form so assignments and clears persist reliably. */
    coachIds: v.array(v.id("coaches")),
    slug: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    locationId: v.optional(v.id("locations")),
    maxParticipants: v.optional(v.number()),
    price: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    isRegistrationOpen: v.optional(v.boolean()),
    category: v.optional(v.string()),
    ageGroup: v.optional(v.string()),
    heroImageUrl: v.optional(v.string()),
    galleryImageUrls: v.optional(v.array(v.string())),
    dailySchedule: v.optional(
      v.array(v.object({ time: v.string(), activity: v.string() }))
    ),
    scheduleByDay: v.optional(
      v.array(
        v.object({
          dayLabel: v.string(),
          slots: v.array(v.object({ time: v.string(), activity: v.string() })),
        })
      )
    ),
    includedItems: v.optional(v.array(v.string())),
    generalAttractions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, coachIds, ...rest } = args;
    const existing = await ctx.db.get("camps", id);
    if (!existing) throw new Error("Nie znaleziono obozu.");
    if (rest.slug !== undefined) {
      const slug = rest.slug.trim();
      if (!slug) throw new Error("Slug jest wymagany.");
      const other = await ctx.db
        .query("camps")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (other && other._id !== id) throw new Error("Obóz z tym slug już istnieje.");
    }
    const updates: Record<string, unknown> = {};
    if (rest.slug !== undefined) updates.slug = rest.slug.trim();
    if (rest.name !== undefined) updates.name = rest.name.trim();
    if (rest.description !== undefined) updates.description = rest.description?.trim() || undefined;
    if (rest.startDate !== undefined) updates.startDate = rest.startDate;
    if (rest.endDate !== undefined) updates.endDate = rest.endDate;
    if (rest.locationId !== undefined) updates.locationId = rest.locationId;
    if (rest.maxParticipants !== undefined) updates.maxParticipants = rest.maxParticipants;
    if (rest.price !== undefined) updates.price = rest.price;
    if (rest.isActive !== undefined) updates.isActive = rest.isActive;
    if (rest.isRegistrationOpen !== undefined) updates.isRegistrationOpen = rest.isRegistrationOpen;
    if (rest.category !== undefined) updates.category = rest.category;
    if (rest.ageGroup !== undefined) updates.ageGroup = rest.ageGroup?.trim() || undefined;
    if (rest.heroImageUrl !== undefined) updates.heroImageUrl = rest.heroImageUrl?.trim() || undefined;
    if (rest.galleryImageUrls !== undefined) updates.galleryImageUrls = rest.galleryImageUrls;
    /** Early-bird discount removed from product; strip on any admin save. */
    updates.earlyBirdDiscountPercent = undefined;
    if (rest.dailySchedule !== undefined) updates.dailySchedule = rest.dailySchedule;
    if (rest.scheduleByDay !== undefined) updates.scheduleByDay = rest.scheduleByDay;
    if (rest.includedItems !== undefined) updates.includedItems = rest.includedItems;
    if (rest.generalAttractions !== undefined) updates.generalAttractions = rest.generalAttractions;
    updates.coachIds = coachIds;
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = Date.now();
      await ctx.db.patch(id, updates);
    }
  },
});

/**
 * Remove a camp (admin only). Fails if there are registrations.
 */
export const remove = mutation({
  args: { id: v.id("camps") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const reg = await ctx.db
      .query("registrations")
      .withIndex("by_camp", (q) => q.eq("campId", args.id))
      .first();
    if (reg) throw new Error("Nie można usunąć obozu — są rejestracje. Usuń najpierw rejestracje.");
    await ctx.db.delete(args.id);
  },
});

/**
 * Backfill unique slugs for existing camps (admin only).
 * Generates slug from camp name + year; appends -2, -3, etc. if needed for uniqueness.
 */
export const backfillCampSlugs = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const camps = await ctx.db.query("camps").collect();
    const usedSlugs = new Set<string>();

    function slugify(text: string): string {
      return text
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }

    function yearFromTimestamp(ms: number): string {
      return new Date(ms).getFullYear().toString();
    }

    for (const camp of camps) {
      const base = slugify(camp.name) || "oboz";
      const year = yearFromTimestamp(camp.startDate);
      let slug = `${base}-${year}`;
      let n = 1;
      while (usedSlugs.has(slug)) {
        n += 1;
        slug = `${base}-${year}-${n}`;
      }
      usedSlugs.add(slug);
      if (slug !== camp.slug) {
        await ctx.db.patch(camp._id, { slug });
      }
    }
  },
});

/**
 * Generate a one-time upload URL for camp hero image (admin only).
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Set camp hero image from an uploaded file storage ID (admin only).
 * Returns the public URL so the client can update UI.
 */
export const setCampHeroImage = mutation({
  args: {
    campId: v.id("camps"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const camp = await ctx.db.get("camps", args.campId);
    if (!camp) throw new Error("Nie znaleziono obozu.");
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Nie można pobrać URL pliku.");
    await ctx.db.patch(args.campId, { heroImageUrl: url, updatedAt: Date.now() });
    return url;
  },
});

/**
 * Set one gallery image (index 0 or 1) from an uploaded file storage ID (admin only).
 * Returns the public URL so the client can update UI.
 */
export const setCampGalleryImage = mutation({
  args: {
    campId: v.id("camps"),
    index: v.union(v.literal(0), v.literal(1)),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const camp = await ctx.db.get("camps", args.campId);
    if (!camp) throw new Error("Nie znaleziono obozu.");
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Nie można pobrać URL pliku.");
    const current = camp.galleryImageUrls ?? [];
    const next = [...current];
    next[args.index] = url;
    if (next.length > 2) next.length = 2;
    await ctx.db.patch(args.campId, {
      galleryImageUrls: next,
      updatedAt: Date.now(),
    });
    return url;
  },
});

/**
 * Toggle camp registration open/closed (admin only).
 */
export const setCampRegistrationOpen = mutation({
  args: {
    campId: v.id("camps"),
    isOpen: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const camp = await ctx.db.get("camps", args.campId);
    if (!camp) throw new Error("Nie znaleziono obozu");
    await ctx.db.patch(args.campId, {
      isRegistrationOpen: args.isOpen,
      updatedAt: Date.now(),
    });
    return args.campId;
  },
});
