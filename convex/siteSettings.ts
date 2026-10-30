import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";

const GLOBAL_KEY = "global" as const;

const CLASSES_DISABLED_MESSAGE = "Nie udało się zapisać na zajęcia.";

export async function getClassesRegistrationAndPaymentsEnabled(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  const doc = await ctx.db
    .query("siteSettings")
    .withIndex("by_key", (q) => q.eq("key", GLOBAL_KEY))
    .unique();
  return doc?.classesRegistrationAndPaymentsEnabled ?? false;
}

/** Throws if class enrollment / class payments are disabled. */
export async function assertClassesEnrollmentPaymentsEnabled(
  ctx: QueryCtx | MutationCtx
): Promise<void> {
  const enabled = await getClassesRegistrationAndPaymentsEnabled(ctx);
  if (!enabled) {
    throw new Error(CLASSES_DISABLED_MESSAGE);
  }
}

export const get = query({
  args: {},
  returns: v.object({
    classesRegistrationAndPaymentsEnabled: v.boolean(),
  }),
  handler: async (ctx) => {
    const enabled = await getClassesRegistrationAndPaymentsEnabled(ctx);
    return { classesRegistrationAndPaymentsEnabled: enabled };
  },
});

export const setClassesRegistrationAndPaymentsEnabled = mutation({
  args: {
    enabled: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", GLOBAL_KEY))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        classesRegistrationAndPaymentsEnabled: args.enabled,
        updatedAt: now,
        updatedByUserId: admin._id,
      });
    } else {
      await ctx.db.insert("siteSettings", {
        key: GLOBAL_KEY,
        classesRegistrationAndPaymentsEnabled: args.enabled,
        updatedAt: now,
        updatedByUserId: admin._id,
      });
    }
    return null;
  },
});
