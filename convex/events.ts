import { query } from "./_generated/server";
import { v } from "convex/values";

export const getEvents = query({
  args: {
    fromTime: v.optional(v.number()),
    toTime: v.optional(v.number()),
    eventType: v.optional(v.string()),
    publicOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let events = await ctx.db.query("events").collect();

    if (args.publicOnly !== false) {
      events = events.filter((e) => e.isPublic);
    }
    if (args.eventType) {
      events = events.filter((e) => e.eventType === args.eventType);
    }
    if (args.fromTime !== undefined) {
      events = events.filter((e) => e.endTime >= args.fromTime!);
    }
    if (args.toTime !== undefined) {
      events = events.filter((e) => e.startTime <= args.toTime!);
    }

    const locationIds = [
      ...new Set(
        events
          .map((e) => e.locationId)
          .filter((id): id is NonNullable<typeof id> => id !== undefined)
      ),
    ];
    const coachIds = [
      ...new Set(
        events
          .map((e) => e.coachId)
          .filter((id): id is NonNullable<typeof id> => id !== undefined)
      ),
    ];
    const locations = await Promise.all(locationIds.map((id) => ctx.db.get(id)));
    const coaches = await Promise.all(coachIds.map((id) => ctx.db.get(id)));
    const locMap = Object.fromEntries(
      locations.filter(Boolean).map((l) => [l!._id, l!])
    );
    const coachMap = Object.fromEntries(
      coaches.filter(Boolean).map((c) => [c!._id, c!])
    );

    return events.map((e) => ({
      ...e,
      location: e.locationId ? locMap[e.locationId] : undefined,
      coach: e.coachId ? coachMap[e.coachId] : undefined,
    }));
  },
});
