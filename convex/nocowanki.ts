import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";

/** Shared optional content fields for create / update args. */
const nocowankaExtendedFields = {
  badge: v.optional(v.string()),
  titlePart1: v.optional(v.string()),
  titlePart2: v.optional(v.string()),
  datesLabel: v.optional(v.string()),
  locationLabel: v.optional(v.string()),
  stats: v.optional(
    v.array(v.object({ value: v.string(), label: v.string() }))
  ),
  attractions: v.optional(
    v.array(
      v.object({
        icon: v.string(),
        title: v.string(),
        description: v.string(),
      })
    )
  ),
  whatToBring: v.optional(v.array(v.string())),
  priceIncluded: v.optional(v.array(v.string())),
  imageUrls: v.optional(v.array(v.string())),
  priceDisplay: v.optional(v.string()),
  availabilityPercent: v.optional(v.number()),
  schedule: v.optional(
    v.array(
      v.object({
        time: v.string(),
        title: v.string(),
        description: v.string(),
      })
    )
  ),
};

function trimOrUndef(s: string | undefined): string | undefined {
  const t = s?.trim();
  return t ? t : undefined;
}

function clampPercent(n: number | undefined): number | undefined {
  if (n === undefined) return undefined;
  if (Number.isNaN(n)) return undefined;
  return Math.max(0, Math.min(100, n));
}

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const list = await ctx.db.query("nocowanki").collect();
    return list.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const slug = args.slug.trim();
    if (!slug) return null;
    const bySlug = (s: string) =>
      ctx.db
        .query("nocowanki")
        .withIndex("by_slug", (q) => q.eq("slug", s))
        .first();
    let doc = await bySlug(slug);
    if (!doc) {
      const lower = slug.toLowerCase();
      if (lower !== slug) {
        doc = await bySlug(lower);
      }
    }
    return doc;
  },
});

/** Public listing for /obozy — active nocowanki only, sorted by name. */
export const listPublicActive = query({
  args: {},
  handler: async (ctx) => {
    const list = await ctx.db.query("nocowanki").collect();
    return list
      .filter((n) => n.isActive)
      .sort((a, b) => a.name.localeCompare(b.name, "pl"));
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
    price: v.optional(v.number()),
    isActive: v.boolean(),
    ...nocowankaExtendedFields,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const slug = args.slug.trim();
    if (!slug) throw new Error("Slug jest wymagany.");
    if (!args.name.trim()) throw new Error("Nazwa jest wymagana.");
    const existing = await ctx.db
      .query("nocowanki")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) throw new Error("Nocowanka z tym slug już istnieje.");
    const pct = clampPercent(args.availabilityPercent);
    return await ctx.db.insert("nocowanki", {
      slug,
      name: args.name.trim(),
      description: trimOrUndef(args.description),
      maxParticipants: args.maxParticipants,
      price: args.price,
      isActive: args.isActive,
      badge: trimOrUndef(args.badge),
      titlePart1: trimOrUndef(args.titlePart1),
      titlePart2: trimOrUndef(args.titlePart2),
      datesLabel: trimOrUndef(args.datesLabel),
      locationLabel: trimOrUndef(args.locationLabel),
      stats: args.stats?.map((s) => ({
        value: s.value.trim(),
        label: s.label.trim(),
      })),
      attractions: args.attractions?.map((a) => ({
        icon: a.icon.trim(),
        title: a.title.trim(),
        description: (a.description ?? "").trim(),
      })),
      whatToBring: args.whatToBring?.map((x) => x.trim()).filter(Boolean),
      priceIncluded: args.priceIncluded?.map((x) => x.trim()).filter(Boolean),
      imageUrls: args.imageUrls?.map((x) => x.trim()).filter(Boolean).slice(0, 2),
      priceDisplay: trimOrUndef(args.priceDisplay),
      availabilityPercent: pct,
      schedule: args.schedule?.map((s) => ({
        time: s.time.trim(),
        title: s.title.trim(),
        description: (s.description ?? "").trim(),
      })),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("nocowanki"),
    slug: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
    price: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    ...nocowankaExtendedFields,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...rest } = args;
    const existing = await ctx.db.get("nocowanki", id);
    if (!existing) throw new Error("Nie znaleziono nocowanki.");

    if (rest.slug !== undefined) {
      const newSlug = rest.slug.trim();
      if (!newSlug) throw new Error("Slug jest wymagany.");
      if (newSlug !== existing.slug) {
        const reg = await ctx.db
          .query("nocowankaRegistrations")
          .withIndex("by_slug", (q) => q.eq("slug", existing.slug))
          .first();
        if (reg) {
          throw new Error(
            "Nie można zmienić slug — są już rejestracje na tę nocowankę."
          );
        }
        const question = await ctx.db
          .query("registrationFormQuestions")
          .withIndex("by_nocowanka", (q) => q.eq("nocowankaSlug", existing.slug))
          .first();
        if (question) {
          throw new Error(
            "Nie można zmienić slug — przypisane są pytania formularza. Zmień lub usuń je najpierw."
          );
        }
      }
      const other = await ctx.db
        .query("nocowanki")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .first();
      if (other && other._id !== id) {
        throw new Error("Nocowanka z tym slug już istnieje.");
      }
    }

    const updates: Record<string, unknown> = {};
    if (rest.slug !== undefined) updates.slug = rest.slug.trim();
    if (rest.name !== undefined) updates.name = rest.name.trim();
    if (rest.description !== undefined) {
      updates.description = trimOrUndef(rest.description);
    }
    if (rest.maxParticipants !== undefined) {
      updates.maxParticipants = rest.maxParticipants;
    }
    if (rest.price !== undefined) updates.price = rest.price;
    if (rest.isActive !== undefined) updates.isActive = rest.isActive;
    if (rest.badge !== undefined) updates.badge = trimOrUndef(rest.badge);
    if (rest.titlePart1 !== undefined) {
      updates.titlePart1 = trimOrUndef(rest.titlePart1);
    }
    if (rest.titlePart2 !== undefined) {
      updates.titlePart2 = trimOrUndef(rest.titlePart2);
    }
    if (rest.datesLabel !== undefined) {
      updates.datesLabel = trimOrUndef(rest.datesLabel);
    }
    if (rest.locationLabel !== undefined) {
      updates.locationLabel = trimOrUndef(rest.locationLabel);
    }
    if (rest.stats !== undefined) {
      updates.stats = rest.stats.map((s) => ({
        value: s.value.trim(),
        label: s.label.trim(),
      }));
    }
    if (rest.attractions !== undefined) {
      updates.attractions = rest.attractions.map((a) => ({
        icon: a.icon.trim(),
        title: a.title.trim(),
        description: (a.description ?? "").trim(),
      }));
    }
    if (rest.whatToBring !== undefined) {
      updates.whatToBring = rest.whatToBring
        .map((x) => x.trim())
        .filter(Boolean);
    }
    if (rest.priceIncluded !== undefined) {
      updates.priceIncluded = rest.priceIncluded
        .map((x) => x.trim())
        .filter(Boolean);
    }
    if (rest.imageUrls !== undefined) {
      updates.imageUrls = rest.imageUrls
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 2);
    }
    if (rest.priceDisplay !== undefined) {
      updates.priceDisplay = trimOrUndef(rest.priceDisplay);
    }
    if (rest.availabilityPercent !== undefined) {
      updates.availabilityPercent = clampPercent(rest.availabilityPercent);
    }
    if (rest.schedule !== undefined) {
      updates.schedule = rest.schedule.map((s) => ({
        time: s.time.trim(),
        title: s.title.trim(),
        description: (s.description ?? "").trim(),
      }));
    }
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = Date.now();
      await ctx.db.patch(id, updates);
    }
  },
});

export const remove = mutation({
  args: { id: v.id("nocowanki") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get("nocowanki", args.id);
    if (!doc) throw new Error("Nie znaleziono nocowanki.");
    const reg = await ctx.db
      .query("nocowankaRegistrations")
      .withIndex("by_slug", (q) => q.eq("slug", doc.slug))
      .first();
    if (reg) {
      throw new Error(
        "Nie można usunąć nocowanki — są rejestracje. Usuń najpierw rejestracje."
      );
    }
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const resolveImageUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Nie można pobrać URL pliku.");
    return url;
  },
});
