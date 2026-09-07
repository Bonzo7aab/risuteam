import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import { isActiveEnrollmentStatus } from "./subscriptionCounts";

/**
 * Dashboard stats for admin Pulpit. Pass asOfTimestamp (e.g. Date.now()) from client
 * so "events new this week" and upcoming camps are deterministic (avoids Date.now() in query).
 * No payment-related fields.
 */
export const getDashboardStats = query({
  args: {
    asOfTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const now = args.asOfTimestamp;
    const weekStart = now - 7 * 24 * 60 * 60 * 1000;

    const users = await ctx.db.query("users").collect();
    const membersCount = users.length;

    const children = await ctx.db.query("children").collect();
    const childrenCount = children.length;

    const classes = await ctx.db
      .query("classes")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    const activeClassesCount = classes.length;

    const camps = await ctx.db
      .query("camps")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    const activeCampsCount = camps.length;

    const coaches = await ctx.db
      .query("coaches")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    const activeCoachesCount = coaches.length;

    const events = await ctx.db.query("events").collect();
    const eventsCount = events.length;
    const eventsNewThisWeek = events.filter(
      (e) => e.startTime >= weekStart && e.startTime <= now
    ).length;

    const allCamps = await ctx.db.query("camps").collect();
    const upcomingCamps = allCamps
      .filter((c) => c.startDate >= now)
      .sort((a, b) => a.startDate - b.startDate)
      .slice(0, 3)
      .map((c) => ({ name: c.name, slug: c.slug, startDate: c.startDate, endDate: c.endDate }));

    return {
      membersCount,
      childrenCount,
      activeClassesCount,
      activeCampsCount,
      activeCoachesCount,
      eventsCount,
      eventsNewThisWeek,
      upcomingCamps,
    };
  },
});

/**
 * Registration counts by month for the last N months. Pass asOfTimestamp from client.
 */
export const getRegistrationTrends = query({
  args: {
    months: v.optional(v.number()),
    asOfTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const months = args.months ?? 6;
    const asOf = args.asOfTimestamp;

    const campRegs = await ctx.db.query("registrations").collect();
    const nocowankaRegs = await ctx.db.query("nocowankaRegistrations").collect();

    const allCreationTimes: number[] = [
      ...campRegs.map((r) => r._creationTime),
      ...nocowankaRegs.map((r) => r._creationTime),
    ];

    const result: { monthKey: string; count: number; label: string }[] = [];
    const monthLabels: Record<string, string> = {
      "0": "Sty",
      "1": "Lut",
      "2": "Mar",
      "3": "Kwi",
      "4": "Maj",
      "5": "Cze",
      "6": "Lip",
      "7": "Sie",
      "8": "Wrz",
      "9": "Paź",
      "10": "Lis",
      "11": "Gru",
    };

    for (let i = 0; i < months; i++) {
      const d = new Date(asOf);
      d.setMonth(d.getMonth() - (months - 1 - i));
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
      const start = new Date(year, month, 1).getTime();
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
      const count = allCreationTimes.filter((t) => t >= start && t <= end).length;
      const label = monthLabels[String(month)] ?? monthKey;
      result.push({ monthKey, count, label });
    }

    return result;
  },
});

/**
 * Today's schedule for admin: slots for the given dayOfWeek with enrollment counts.
 * Client passes dayOfWeek (0=Sun, 1=Mon, … 6=Sat) so the query stays deterministic.
 */
export const getTodaysScheduleForAdmin = query({
  args: {
    dayOfWeek: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.dayOfWeek < 0 || args.dayOfWeek > 6) return [];

    const classes = await ctx.db
      .query("classes")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    const classIds = new Set(classes.map((c) => c._id));

    const allSlots = await ctx.db.query("timeSlots").collect();
    const slots = allSlots.filter(
      (s) => classIds.has(s.classId) && s.dayOfWeek === args.dayOfWeek
    );

    const subscriptions = await ctx.db.query("subscriptions").collect();
    const enrolledByClass: Record<string, number> = {};
    for (const sub of subscriptions) {
      if (!isActiveEnrollmentStatus(sub.status)) continue;
      const id = sub.classId;
      enrolledByClass[id] = (enrolledByClass[id] ?? 0) + 1;
    }

    const locationIds = [...new Set(classes.map((c) => c.locationId))];
    const coachIds = [...new Set(classes.map((c) => c.coachId))];
    const locations = await Promise.all(locationIds.map((id) => ctx.db.get(id)));
    const coaches = await Promise.all(coachIds.map((id) => ctx.db.get(id)));
    const locMap = Object.fromEntries(
      locations.filter(Boolean).map((l) => [l!._id, l!])
    );
    const coachMap = Object.fromEntries(
      coaches.filter(Boolean).map((c) => [c!._id, c!])
    );
    const classMap = Object.fromEntries(classes.map((c) => [c._id, c]));

    return slots
      .map((slot) => {
        const cls = classMap[slot.classId];
        if (!cls) return null;
        const enrolledCount = enrolledByClass[slot.classId] ?? 0;
        const maxCapacity = cls.maxCapacity ?? undefined;
        return {
          slot,
          class: cls,
          location: locMap[cls.locationId],
          coach: coachMap[cls.coachId],
          enrolledCount,
          maxCapacity,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) =>
        a.slot.startTime.localeCompare(b.slot.startTime)
      );
  },
});
