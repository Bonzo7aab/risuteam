import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";

/** Public list of active coaches for camp/trainers sections. */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const list = await ctx.db
      .query("coaches")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    return list.sort((a, b) => a.name.localeCompare(b.name));
  },
});

/** Single active coach for public profile (e.g. /trenerzy/[id]). */
export const getPublicById = query({
  args: { id: v.id("coaches") },
  handler: async (ctx, { id }) => {
    const coach = await ctx.db.get(id);
    if (!coach || !coach.isActive) {
      return null;
    }
    return coach;
  },
});

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const list = await ctx.db.query("coaches").collect();
    return list.sort((a, b) => a.name.localeCompare(b.name));
  },
});

const createArgs = {
  name: v.string(),
  bio: v.optional(v.string()),
  photoUrl: v.optional(v.string()),
  disciplines: v.array(v.string()),
  isActive: v.boolean(),
};

export const create = mutation({
  args: createArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) {
      throw new Error("Imię i nazwisko są wymagane.");
    }
    if (!Array.isArray(args.disciplines) || args.disciplines.length === 0) {
      throw new Error("Wybierz co najmniej jedną dyscyplinę.");
    }
    return await ctx.db.insert("coaches", {
      name,
      bio: args.bio?.trim() || undefined,
      photoUrl: args.photoUrl?.trim() || undefined,
      disciplines: args.disciplines,
      isActive: args.isActive,
    });
  },
});

const updateArgs = {
  id: v.id("coaches"),
  name: v.optional(v.string()),
  bio: v.optional(v.string()),
  photoUrl: v.optional(v.string()),
  disciplines: v.optional(v.array(v.string())),
  isActive: v.optional(v.boolean()),
};

export const update = mutation({
  args: updateArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...rest } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Nie znaleziono trenera.");
    }
    const updates: Record<string, unknown> = {};
    if (rest.name !== undefined) {
      const name = rest.name.trim();
      if (!name) throw new Error("Imię i nazwisko są wymagane.");
      updates.name = name;
    }
    if (rest.bio !== undefined) updates.bio = rest.bio?.trim() || undefined;
    if (rest.photoUrl !== undefined) updates.photoUrl = rest.photoUrl?.trim() || undefined;
    if (rest.disciplines !== undefined) {
      if (!Array.isArray(rest.disciplines) || rest.disciplines.length === 0) {
        throw new Error("Wybierz co najmniej jedną dyscyplinę.");
      }
      updates.disciplines = rest.disciplines;
    }
    if (rest.isActive !== undefined) updates.isActive = rest.isActive;
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(id, updates);
    }
  },
});

export const remove = mutation({
  args: { id: v.id("coaches") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const classRef = await ctx.db
      .query("classes")
      .withIndex("by_coach", (q) => q.eq("coachId", args.id))
      .first();
    if (classRef) {
      throw new Error(
        "Nie można usunąć — trener jest przypisany do zajęć lub eventów."
      );
    }
    const eventRef = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("coachId"), args.id))
      .first();
    if (eventRef) {
      throw new Error(
        "Nie można usunąć — trener jest przypisany do zajęć lub eventów."
      );
    }
    await ctx.db.delete(args.id);
  },
});
