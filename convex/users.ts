import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { requireAdmin, requireAuthUserId } from "./authHelpers";

const ALLOWED_ROLES = ["user", "admin"] as const;

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("users").collect();
    const withCounts = await Promise.all(
      all.map(async (u) => {
        const children = await ctx.db
          .query("children")
          .withIndex("by_user", (q) => q.eq("userId", u._id))
          .collect();
        return {
          _id: u._id,
          _creationTime: u._creationTime,
          name: u.name,
          email: u.email,
          role: u.role,
          emailVerificationTime: u.emailVerificationTime,
          isAnonymous: u.isAnonymous,
          childrenCount: children.length,
        };
      })
    );
    return withCounts.sort(
      (a, b) =>
        (a._creationTime ?? 0) - (b._creationTime ?? 0) ||
        (a.email ?? "").localeCompare(b.email ?? "")
    );
  },
});

export const updateForAdmin = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...rest } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Nie znaleziono użytkownika.");
    const updates: { name?: string; role?: string } = {};
    if (rest.name !== undefined) {
      updates.name = rest.name.trim() || undefined;
    }
    if (rest.role !== undefined) {
      const role = rest.role.trim();
      if (role && !ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
        throw new Error(`Dozwolone role: ${ALLOWED_ROLES.join(", ")}.`);
      }
      updates.role = role || undefined;
    }
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(id, updates);
    }
  },
});

export const setOnboardingCompleted = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    await ctx.db.patch(userId, { onboardingCompletedAt: Date.now() });
  },
});

export const updateSelf = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const existing = await ctx.db.get(userId);
    if (!existing) throw new Error("Nie znaleziono użytkownika.");

    const updates: { name?: string; phone?: string } = {};
    if (args.name !== undefined) {
      updates.name = args.name.trim() || undefined;
    }
    if (args.phone !== undefined) {
      updates.phone = args.phone.trim() || undefined;
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(userId, updates);
    }
  },
});

export const removeSelf = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const existing = await ctx.db.get(userId);
    if (!existing) throw new Error("Nie znaleziono użytkownika.");

    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const sub of subscriptions) {
      await ctx.db.delete(sub._id);
    }

    const children = await ctx.db
      .query("children")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const child of children) {
      await ctx.db.delete(child._id);
    }

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const r of registrations) {
      await ctx.db.patch(r._id, { userId: undefined });
    }

    const nocowankaRegistrations = await ctx.db
      .query("nocowankaRegistrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const r of nocowankaRegistrations) {
      await ctx.db.patch(r._id, { userId: undefined });
    }

    const emailNorm = existing.email?.trim().toLowerCase();
    if (emailNorm && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      const newsletterRow = await ctx.db
        .query("newsletterSubscribers")
        .withIndex("by_email", (q) => q.eq("emailNormalized", emailNorm))
        .unique();
      if (newsletterRow) {
        await ctx.db.delete(newsletterRow._id);
      }
    }

    await ctx.db.delete(userId);
  },
});

export const removeForAdmin = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (args.id === admin._id) {
      throw new Error("Nie możesz usunąć własnego konta.");
    }
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Nie znaleziono użytkownika.");
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.id))
      .collect();
    for (const sub of subscriptions) {
      await ctx.db.delete(sub._id);
    }
    const children = await ctx.db
      .query("children")
      .withIndex("by_user", (q) => q.eq("userId", args.id))
      .collect();
    for (const child of children) {
      await ctx.db.delete(child._id);
    }
    const emailNorm = existing.email?.trim().toLowerCase();
    if (emailNorm && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      const newsletterRow = await ctx.db
        .query("newsletterSubscribers")
        .withIndex("by_email", (q) => q.eq("emailNormalized", emailNorm))
        .unique();
      if (newsletterRow) {
        await ctx.db.delete(newsletterRow._id);
      }
    }
    await ctx.db.delete(args.id);
  },
});
