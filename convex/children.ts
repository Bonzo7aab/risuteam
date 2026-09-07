import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireAuthUserId } from "./authHelpers";

const childDoc = v.object({
  _id: v.id("children"),
  _creationTime: v.number(),
  userId: v.id("users"),
  firstName: v.string(),
  lastName: v.string(),
  dateOfBirth: v.optional(v.string()),
  pesel: v.optional(v.string()),
});

export const listMyChildren = query({
  args: {},
  returns: v.array(childDoc),
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    return await ctx.db
      .query("children")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const children = await ctx.db.query("children").collect();
    const userIds = [...new Set(children.map((c) => c.userId))];
    const users = await Promise.all(userIds.map((id) => ctx.db.get("users", id)));
    const userMap = Object.fromEntries(
      users.filter(Boolean).map((u) => [u!._id, { name: u!.name ?? undefined }])
    );
    return children.map((c) => ({
      ...c,
      parentName: userMap[c.userId]?.name,
    }));
  },
});

export const addChild = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.optional(v.string()),
    pesel: v.optional(v.string()),
  },
  returns: v.id("children"),
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    if (!args.firstName?.trim() || !args.lastName?.trim()) {
      throw new Error("Imię i nazwisko są wymagane.");
    }
    return await ctx.db.insert("children", {
      userId,
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      dateOfBirth: args.dateOfBirth?.trim() || undefined,
      pesel: args.pesel?.trim() || undefined,
    });
  },
});

export const updateChild = mutation({
  args: {
    childId: v.id("children"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.optional(v.string()),
    pesel: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    if (!args.firstName?.trim() || !args.lastName?.trim()) {
      throw new Error("Imię i nazwisko są wymagane.");
    }
    const child = await ctx.db.get("children", args.childId);
    if (!child) throw new Error("Nie znaleziono dziecka.");
    if (child.userId !== userId) {
      throw new Error("Nie możesz edytować tego profilu.");
    }
    const dob = args.dateOfBirth?.trim();
    const pesel = args.pesel?.trim();
    await ctx.db.patch(args.childId, {
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      dateOfBirth: dob || undefined,
      pesel: pesel || undefined,
    });
    return null;
  },
});
