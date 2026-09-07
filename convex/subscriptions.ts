import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireAuthUserId } from "./authHelpers";
import {
  countActiveEnrollmentsForClass,
  isActiveEnrollmentStatus,
} from "./subscriptionCounts";

const subscriptionStatus = v.union(
  v.literal("pending_payment"),
  v.literal("active"),
  v.literal("cancelled"),
  v.literal("ended")
);

const subscriptionDoc = v.object({
  _id: v.id("subscriptions"),
  _creationTime: v.number(),
  userId: v.id("users"),
  childId: v.optional(v.id("children")),
  classId: v.id("classes"),
  status: v.string(),
  startDate: v.number(),
  endDate: v.optional(v.number()),
});

export const listMySubscriptions = query({
  args: {
    status: v.optional(subscriptionStatus),
  },
  returns: v.array(subscriptionDoc),
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    let list = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (args.status !== undefined) {
      list = list.filter((s) => s.status === args.status);
    }
    return list;
  },
});

function isActiveStatus(status: string): boolean {
  return isActiveEnrollmentStatus(status);
}

export const enrollInClass = mutation({
  args: {
    classId: v.id("classes"),
    childId: v.id("children"),
  },
  returns: v.id("subscriptions"),
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);

    const cls = await ctx.db.get("classes", args.classId);
    if (!cls) throw new Error("Zajęcia nie istnieją.");
    if (!cls.isActive) throw new Error("Zajęcia nie są już dostępne.");

    const child = await ctx.db.get("children", args.childId);
    if (!child) throw new Error("Nie znaleziono dziecka.");
    if (child.userId !== userId) throw new Error("To dziecko nie należy do Twojego konta.");

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const duplicate = existing.find(
      (s) =>
        s.classId === args.classId &&
        s.childId === args.childId &&
        isActiveStatus(s.status)
    );
    if (duplicate) throw new Error("Już jesteś zapisany na te zajęcia.");

    const count = await countActiveEnrollmentsForClass(ctx.db, args.classId);
    const maxCapacity = cls.maxCapacity ?? undefined;
    if (maxCapacity !== undefined && count >= maxCapacity) {
      throw new Error("Brak wolnych miejsc na te zajęcia.");
    }

    return await ctx.db.insert("subscriptions", {
      userId,
      childId: args.childId,
      classId: args.classId,
      status: "pending_payment",
      startDate: Date.now(),
    });
  },
});

export const cancelEnrollment = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const sub = await ctx.db.get("subscriptions", args.subscriptionId);
    if (!sub) throw new Error("Zapis nie istnieje.");
    if (sub.userId !== userId) throw new Error("Nie możesz anulować cudzego zapisu.");
    if (sub.status !== "pending_payment" && sub.status !== "active") {
      throw new Error("Ten zapis nie może być anulowany.");
    }
    await ctx.db.patch(args.subscriptionId, { status: "cancelled" });
    return null;
  },
});

/**
 * Active enrollment counts per class (admin). Keys are `classes` document ids as strings.
 */
export const getClassActiveEnrollmentCountsForAdmin = query({
  args: {},
  returns: v.record(v.string(), v.number()),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const list = await ctx.db.query("subscriptions").collect();
    const counts: Record<string, number> = {};
    for (const s of list) {
      if (!isActiveEnrollmentStatus(s.status)) continue;
      const id = s.classId as string;
      counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  },
});

export const listByClassForAdmin = query({
  args: {
    classId: v.id("classes"),
    /** When true, include cancelled/ended rows (audit). Default: current roster only. */
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();
    if (!args.includeInactive) {
      subs = subs.filter((s) => isActiveEnrollmentStatus(s.status));
    }
    const result = await Promise.all(
      subs.map(async (sub) => {
        const child = sub.childId ? await ctx.db.get("children", sub.childId) : null;
        const user = await ctx.db.get("users", sub.userId);
        return {
          ...sub,
          child: child
            ? { firstName: child.firstName, lastName: child.lastName }
            : null,
          user: user ? { name: user.name ?? undefined } : { name: undefined },
        };
      })
    );
    return result;
  },
});

export const adminRemoveEnrollment = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const sub = await ctx.db.get("subscriptions", args.subscriptionId);
    if (!sub) throw new Error("Zapis nie istnieje.");
    await ctx.db.patch(args.subscriptionId, { status: "cancelled" });
    return null;
  },
});

export const adminEnrollInClass = mutation({
  args: {
    classId: v.id("classes"),
    childId: v.id("children"),
  },
  returns: v.id("subscriptions"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cls = await ctx.db.get("classes", args.classId);
    if (!cls) throw new Error("Zajęcia nie istnieją.");
    const child = await ctx.db.get("children", args.childId);
    if (!child) throw new Error("Nie znaleziono dziecka.");
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();
    const duplicate = existing.find(
      (s) =>
        s.childId === args.childId && isActiveStatus(s.status)
    );
    if (duplicate) throw new Error("To dziecko jest już zapisane na te zajęcia.");
    const activeCount = existing.filter((s) =>
      isActiveEnrollmentStatus(s.status)
    ).length;
    const maxCapacity = cls.maxCapacity ?? undefined;
    if (maxCapacity !== undefined && activeCount >= maxCapacity) {
      throw new Error("Brak wolnych miejsc na te zajęcia.");
    }
    return await ctx.db.insert("subscriptions", {
      userId: child.userId,
      childId: args.childId,
      classId: args.classId,
      status: "active",
      startDate: Date.now(),
    });
  },
});
