import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const list = await ctx.db.query("locations").collect();
    return list.sort((a, b) => a.name.localeCompare(b.name));
  },
});

const createArgs = {
  name: v.string(),
  address: v.string(),
  city: v.string(),
  postalCode: v.optional(v.string()),
  mapsUrl: v.optional(v.string()),
};

export const create = mutation({
  args: createArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Nazwa jest wymagana.");
    if (!args.address.trim()) throw new Error("Adres jest wymagany.");
    if (!args.city.trim()) throw new Error("Miasto jest wymagane.");
    return await ctx.db.insert("locations", {
      name,
      address: args.address.trim(),
      city: args.city.trim(),
      postalCode: args.postalCode?.trim() || undefined,
      mapsUrl: args.mapsUrl?.trim() || undefined,
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
    if (rest.postalCode !== undefined) updates.postalCode = rest.postalCode?.trim() || undefined;
    if (rest.mapsUrl !== undefined) updates.mapsUrl = rest.mapsUrl?.trim() || undefined;
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
        "Nie można usunąć — lokalizacja jest przypisana do zajęć. Zmień lub usuń najpierw grupy."
      );
    }
    const eventRef = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("locationId"), args.id))
      .first();
    if (eventRef) {
      throw new Error(
        "Nie można usunąć — lokalizacja jest przypisana do eventów."
      );
    }
    const campRef = await ctx.db
      .query("camps")
      .filter((q) => q.eq(q.field("locationId"), args.id))
      .first();
    if (campRef) {
      throw new Error(
        "Nie można usunąć — lokalizacja jest przypisana do obozów."
      );
    }
    await ctx.db.delete(args.id);
  },
});
