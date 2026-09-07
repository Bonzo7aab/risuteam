import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./authHelpers";
import { countActiveEnrollmentsForClass } from "./subscriptionCounts";

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

    const allSlots = await ctx.db.query("timeSlots").collect();
    const slots = allSlots.filter(
      (s) =>
        classIds.has(s.classId) &&
        (args.dayOfWeek === undefined || s.dayOfWeek === args.dayOfWeek)
    );

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
    let classes = await ctx.db.query("classes").collect();
    if (activeOnly) {
      classes = classes.filter((c) => c.isActive);
    }
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
    return await ctx.db.insert("classes", {
      name,
      discipline: args.discipline.trim(),
      description: args.description?.trim() || undefined,
      locationId: args.locationId,
      coachId: args.coachId,
      ageGroup: args.ageGroup?.trim() || undefined,
      maxCapacity: args.maxCapacity,
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
    if (rest.isActive !== undefined) updates.isActive = rest.isActive;
    if (Object.keys(updates).length > 0) await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("classes") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cls = await ctx.db.get("classes", args.id);
    if (!cls) throw new Error("Nie znaleziono grupy zajęć.");
    // Delete every slot for this class (index + filter so nothing is left behind)
    const slotsByIndex = await ctx.db
      .query("timeSlots")
      .withIndex("by_class", (q) => q.eq("classId", args.id))
      .collect();
    const slotsByFilter = await ctx.db
      .query("timeSlots")
      .filter((q) => q.eq(q.field("classId"), args.id))
      .collect();
    const slotIdSet = new Set(
      [...slotsByIndex, ...slotsByFilter].map((s) => s._id)
    );
    for (const slotId of slotIdSet) {
      await ctx.db.delete(slotId);
    }
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_class", (q) => q.eq("classId", args.id))
      .first();
    if (sub) {
      throw new Error(
        "Nie można usunąć — do grupy są przypisani uczestnicy."
      );
    }
    await ctx.db.delete(args.id);
  },
});

export const listTimeSlotsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const allSlots = await ctx.db.query("timeSlots").collect();
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
    const uniqueClassIds = [...new Set(allSlots.map((s) => s.classId))];
    const enrolledEntries = await Promise.all(
      uniqueClassIds.map(async (classId) => {
        const n = await countActiveEnrollmentsForClass(ctx.db, classId);
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
