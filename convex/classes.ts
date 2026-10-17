import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./authHelpers";
import { countActiveEnrollmentsForClass } from "./subscriptionCounts";
import { DEFAULT_MONTHLY_FEE_GROSZE } from "./billingHelpers";

export const getSchedule = query({
  args: {
    dayOfWeek: v.optional(v.number()),
    discipline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const classes = await ctx.db
      .query("classes")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const filtered =
      args.discipline !== undefined
        ? classes.filter((c) => c.discipline === args.discipline)
        : classes;
    const classIds = new Set(filtered.map((c) => c._id));

    let slots =
      args.dayOfWeek !== undefined
        ? await ctx.db
            .query("timeSlots")
            .withIndex("by_day", (q) => q.eq("dayOfWeek", args.dayOfWeek!))
            .collect()
        : (
            await Promise.all(
              [...classIds].map((classId) =>
                ctx.db
                  .query("timeSlots")
                  .withIndex("by_class", (q) => q.eq("classId", classId))
                  .collect()
              )
            )
          ).flat();
    slots = slots.filter((s) => classIds.has(s.classId));
    const nowMs = Date.now();
    slots = slots.filter((s) => {
      if (s.startDate != null && nowMs < s.startDate) return false;
      if (s.endDate != null && nowMs > s.endDate) return false;
      return true;
    });

    const locations = await ctx.db.query("locations").collect();
    const coaches = await ctx.db.query("coaches").collect();
    const locMap = Object.fromEntries(locations.map((l) => [l._id, l]));
    const coachMap = Object.fromEntries(coaches.map((c) => [c._id, c]));
    const classMap = Object.fromEntries(filtered.map((c) => [c._id, c]));

    const uniqueClassIds = [...classIds];
    const enrolledEntries = await Promise.all(
      uniqueClassIds.map(async (classId) => {
        const n = await countActiveEnrollmentsForClass(ctx.db, classId);
        return [classId, n] as const;
      })
    );
    const enrolledByClassId = new Map<Id<"classes">, number>(enrolledEntries);

    return slots.map((slot) => {
      const cls = classMap[slot.classId];
      return {
        ...slot,
        class: cls,
        location: cls ? locMap[cls.locationId] : undefined,
        coach: cls ? coachMap[cls.coachId] : undefined,
        enrolledCount: enrolledByClassId.get(slot.classId) ?? 0,
      };
    });
  },
});

export const getClasses = query({
  args: {
    discipline: v.optional(v.string()),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const activeOnly = args.activeOnly ?? true;
    let classes = activeOnly
      ? await ctx.db
          .query("classes")
          .withIndex("by_active", (q) => q.eq("isActive", true))
          .collect()
      : await ctx.db.query("classes").collect();
    if (args.discipline) {
      classes = classes.filter((c) => c.discipline === args.discipline);
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

    return classes.map((c) => ({
      ...c,
      location: locMap[c.locationId],
      coach: coachMap[c.coachId],
    }));
  },
});

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const classList = await ctx.db.query("classes").collect();
    const locationIds = [...new Set(classList.map((c) => c.locationId))];
    const coachIds = [...new Set(classList.map((c) => c.coachId))];
    const locations = await Promise.all(locationIds.map((id) => ctx.db.get(id)));
    const coaches = await Promise.all(coachIds.map((id) => ctx.db.get(id)));
    const locMap = Object.fromEntries(
      locations.filter(Boolean).map((l) => [l!._id, l!])
    );
    const coachMap = Object.fromEntries(
      coaches.filter(Boolean).map((c) => [c!._id, c!])
    );
    return classList
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({
        ...c,
        location: locMap[c.locationId],
        coach: coachMap[c.coachId],
      }));
  },
});

export const getForAdmin = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cls = await ctx.db.get("classes", args.classId);
    if (!cls) return null;
    const location = await ctx.db.get("locations", cls.locationId);
    const coach = await ctx.db.get("coaches", cls.coachId);
    return {
      ...cls,
      location: location ?? undefined,
      coach: coach ?? undefined,
    };
  },
});

export const getTimeSlotsForClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("timeSlots")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();
  },
});

const slotInput = {
  dayOfWeek: v.number(),
  startTime: v.string(),
  endTime: v.string(),
};

export const replaceTimeSlotsForClass = mutation({
  args: {
    classId: v.id("classes"),
    slots: v.array(v.object(slotInput)),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cls = await ctx.db.get("classes", args.classId);
    if (!cls) throw new Error("Nie znaleziono grupy zajęć.");
    const existing = await ctx.db
      .query("timeSlots")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();
    for (const slot of existing) {
      await ctx.db.delete(slot._id);
    }
    for (const slot of args.slots) {
      if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
        throw new Error("Dzień tygodnia musi być 0–6.");
      }
      const start = slot.startTime?.trim();
      const end = slot.endTime?.trim();
      if (!start || !end) throw new Error("Godziny rozpoczęcia i zakończenia są wymagane.");
      await ctx.db.insert("timeSlots", {
        classId: args.classId,
        dayOfWeek: slot.dayOfWeek,
        startTime: start,
        endTime: end,
      });
    }
  },
});

const classCreateArgs = {
  name: v.string(),
  discipline: v.string(),
  description: v.optional(v.string()),
  locationId: v.id("locations"),
  coachId: v.id("coaches"),
  ageGroup: v.optional(v.string()),
  maxCapacity: v.optional(v.number()),
  monthlyFeeGrosze: v.optional(v.number()),
  isActive: v.boolean(),
};

export const create = mutation({
  args: classCreateArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Nazwa grupy jest wymagana.");
    if (!args.discipline.trim()) throw new Error("Dyscyplina jest wymagana.");
    const location = await ctx.db.get(args.locationId);
    if (!location) throw new Error("Nie znaleziono lokalizacji.");
    const coach = await ctx.db.get(args.coachId);
    if (!coach) throw new Error("Nie znaleziono trenera.");
    const fee =
      args.monthlyFeeGrosze != null && args.monthlyFeeGrosze > 0
        ? Math.round(args.monthlyFeeGrosze)
        : DEFAULT_MONTHLY_FEE_GROSZE;
    return await ctx.db.insert("classes", {
      name,
      discipline: args.discipline.trim(),
      description: args.description?.trim() || undefined,
      locationId: args.locationId,
      coachId: args.coachId,
      ageGroup: args.ageGroup?.trim() || undefined,
      maxCapacity: args.maxCapacity,
      monthlyFeeGrosze: fee,
      isActive: args.isActive,
    });
  },
});

const classUpdateArgs = {
  id: v.id("classes"),
  name: v.optional(v.string()),
  discipline: v.optional(v.string()),
  description: v.optional(v.string()),
  locationId: v.optional(v.id("locations")),
  coachId: v.optional(v.id("coaches")),
  ageGroup: v.optional(v.string()),
  maxCapacity: v.optional(v.number()),
  monthlyFeeGrosze: v.optional(v.number()),
  isActive: v.optional(v.boolean()),
};

export const update = mutation({
  args: classUpdateArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...rest } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Nie znaleziono grupy zajęć.");
    const updates: Record<string, unknown> = {};
    if (rest.name !== undefined) {
      const name = rest.name.trim();
      if (!name) throw new Error("Nazwa grupy jest wymagana.");
      updates.name = name;
    }
    if (rest.discipline !== undefined) {
      if (!rest.discipline.trim()) throw new Error("Dyscyplina jest wymagana.");
      updates.discipline = rest.discipline.trim();
    }
    if (rest.description !== undefined) updates.description = rest.description?.trim() || undefined;
    if (rest.locationId !== undefined) {
      const loc = await ctx.db.get(rest.locationId);
      if (!loc) throw new Error("Nie znaleziono lokalizacji.");
      updates.locationId = rest.locationId;
    }
    if (rest.coachId !== undefined) {
      const coach = await ctx.db.get(rest.coachId);
      if (!coach) throw new Error("Nie znaleziono trenera.");
      updates.coachId = rest.coachId;
    }
    if (rest.ageGroup !== undefined) updates.ageGroup = rest.ageGroup?.trim() || undefined;
    if (rest.maxCapacity !== undefined) updates.maxCapacity = rest.maxCapacity;
    if (rest.monthlyFeeGrosze !== undefined) {
      if (rest.monthlyFeeGrosze <= 0) {
        throw new Error("Opłata miesięczna musi być większa od zera.");
      }
      updates.monthlyFeeGrosze = Math.round(rest.monthlyFeeGrosze);
    }
    if (rest.isActive !== undefined) updates.isActive = rest.isActive;
    if (Object.keys(updates).length > 0) await ctx.db.patch(id, updates);
  },
});

/**
 * Remove a class from the schedule.
 * - Always deletes time slots (disappears from grafik).
 * - Cancels active / pending-payment enrollments.
 * - Hard-deletes the class only when no subscription history remains;
 *   otherwise deactivates it so payment history stays intact.
 */
export const remove = mutation({
  args: { id: v.id("classes") },
  returns: v.object({
    deleted: v.boolean(),
    deactivated: v.boolean(),
    cancelledEnrollments: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cls = await ctx.db.get("classes", args.id);
    if (!cls) throw new Error("Nie znaleziono grupy zajęć.");

    const slots = await ctx.db
      .query("timeSlots")
      .withIndex("by_class", (q) => q.eq("classId", args.id))
      .collect();
    for (const slot of slots) {
      await ctx.db.delete(slot._id);
    }

    const now = Date.now();
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_class", (q) => q.eq("classId", args.id))
      .collect();

    let cancelledEnrollments = 0;
    for (const sub of subscriptions) {
      if (sub.status === "active" || sub.status === "pending_payment") {
        await ctx.db.patch(sub._id, {
          status: "cancelled",
          endDate: now,
          paymentHoldExpiresAt: undefined,
        });
        cancelledEnrollments += 1;
      }
    }

    // Re-check after cancellations — any remaining rows are historical.
    const remaining = await ctx.db
      .query("subscriptions")
      .withIndex("by_class", (q) => q.eq("classId", args.id))
      .first();

    if (remaining) {
      if (cls.isActive) {
        await ctx.db.patch(args.id, { isActive: false });
      }
      return {
        deleted: false,
        deactivated: true,
        cancelledEnrollments,
      };
    }

    await ctx.db.delete(args.id);
    return {
      deleted: true,
      deactivated: false,
      cancelledEnrollments,
    };
  },
});

export const listTimeSlotsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const classList = await ctx.db.query("classes").collect();
    const classMap = Object.fromEntries(classList.map((c) => [c._id, c]));
    const locationIds = [...new Set(classList.map((c) => c.locationId))];
    const coachIds = [...new Set(classList.map((c) => c.coachId))];
    const locations = await Promise.all(locationIds.map((id) => ctx.db.get(id)));
    const coaches = await Promise.all(coachIds.map((id) => ctx.db.get(id)));
    const locMap = Object.fromEntries(
      locations.filter(Boolean).map((l) => [l!._id, l!])
    );
    const coachMap = Object.fromEntries(
      coaches.filter(Boolean).map((c) => [c!._id, c!])
    );
    const allSlots = (
      await Promise.all(
        classList.map((c) =>
          ctx.db
            .query("timeSlots")
            .withIndex("by_class", (q) => q.eq("classId", c._id))
            .collect()
        )
      )
    ).flat();
    const nowMs = Date.now();
    const uniqueClassIds = [...new Set(allSlots.map((s) => s.classId))];
    const enrolledEntries = await Promise.all(
      uniqueClassIds.map(async (classId) => {
        const n = await countActiveEnrollmentsForClass(ctx.db, classId, nowMs);
        return [classId, n] as const;
      })
    );
    const enrolledByClassId = new Map<Id<"classes">, number>(enrolledEntries);

    const withDetails = allSlots.map((slot) => {
      const cls = classMap[slot.classId];
      return {
        ...slot,
        class: cls,
        location: cls ? locMap[cls.locationId] : undefined,
        coach: cls ? coachMap[cls.coachId] : undefined,
        enrolledCount: enrolledByClassId.get(slot.classId) ?? 0,
      };
    });
    return withDetails.sort(
      (a, b) =>
        a.dayOfWeek - b.dayOfWeek ||
        (a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0)
    );
  },
});

const createTimeSlotArgs = {
  classId: v.id("classes"),
  dayOfWeek: v.number(),
  startTime: v.string(),
  endTime: v.string(),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
};

export const createTimeSlot = mutation({
  args: createTimeSlotArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cls = await ctx.db.get(args.classId);
    if (!cls) throw new Error("Nie znaleziono grupy zajęć.");
    if (args.dayOfWeek < 0 || args.dayOfWeek > 6) {
      throw new Error("Dzień tygodnia musi być 0–6 (0=Nd, 1=Pon, …, 6=Sb).");
    }
    const start = args.startTime?.trim();
    const end = args.endTime?.trim();
    if (!start) throw new Error("Godzina rozpoczęcia jest wymagana.");
    if (!end) throw new Error("Godzina zakończenia jest wymagana.");
    return await ctx.db.insert("timeSlots", {
      classId: args.classId,
      dayOfWeek: args.dayOfWeek,
      startTime: start,
      endTime: end,
      startDate: args.startDate,
      endDate: args.endDate,
    });
  },
});

const updateTimeSlotArgs = {
  id: v.id("timeSlots"),
  classId: v.optional(v.id("classes")),
  dayOfWeek: v.optional(v.number()),
  startTime: v.optional(v.string()),
  endTime: v.optional(v.string()),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
};

export const updateTimeSlot = mutation({
  args: updateTimeSlotArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...rest } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Nie znaleziono terminu.");
    const updates: Record<string, unknown> = {};
    if (rest.classId !== undefined) {
      const cls = await ctx.db.get(rest.classId);
      if (!cls) throw new Error("Nie znaleziono grupy zajęć.");
      updates.classId = rest.classId;
    }
    if (rest.dayOfWeek !== undefined) {
      if (rest.dayOfWeek < 0 || rest.dayOfWeek > 6) {
        throw new Error("Dzień tygodnia musi być 0–6.");
      }
      updates.dayOfWeek = rest.dayOfWeek;
    }
    if (rest.startTime !== undefined) {
      const start = rest.startTime.trim();
      if (!start) throw new Error("Godzina rozpoczęcia jest wymagana.");
      updates.startTime = start;
    }
    if (rest.endTime !== undefined) {
      const end = rest.endTime.trim();
      if (!end) throw new Error("Godzina zakończenia jest wymagana.");
      updates.endTime = end;
    }
    if (rest.startDate !== undefined) updates.startDate = rest.startDate;
    if (rest.endDate !== undefined) updates.endDate = rest.endDate;
    if (Object.keys(updates).length > 0) await ctx.db.patch(id, updates);
  },
});

export const removeTimeSlot = mutation({
  args: { id: v.id("timeSlots") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Nie znaleziono terminu.");
    await ctx.db.delete(args.id);
  },
});
