import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { requireAuthUserId } from "./authHelpers";
import { isActiveEnrollmentStatus } from "./subscriptionCounts";

const MONTHLY_FEE_GROSZE = 24000;

const DOW_PL = ["NDZ", "PN", "WT", "ŚR", "CZW", "PT", "SOB"];

function disciplineTint(
  d: string
): "orange" | "sky" | "violet" {
  const x = d.toLowerCase();
  if (x.includes("judo") || x.includes("karate")) return "orange";
  if (x.includes("gimn") || x.includes("gym")) return "sky";
  return "violet";
}

function nextOccurrenceMs(
  asOfMs: number,
  dayOfWeek: number,
  startTime: string
): number {
  const now = new Date(asOfMs);
  const parts = startTime.split(":");
  const h = Number(parts[0]) || 0;
  const m = Number(parts[1]) || 0;
  let daysAhead = (dayOfWeek - now.getDay() + 7) % 7;
  const candidate = new Date(now);
  candidate.setHours(h, m, 0, 0);
  candidate.setDate(candidate.getDate() + daysAhead);
  if (daysAhead === 0 && now.getTime() >= candidate.getTime()) {
    candidate.setDate(candidate.getDate() + 7);
  }
  return candidate.getTime();
}

const tintV = v.union(
  v.literal("orange"),
  v.literal("sky"),
  v.literal("violet")
);

export const getParentDashboardHome = query({
  args: {
    asOfTimestamp: v.number(),
  },
  returns: v.object({
    childrenRows: v.array(
      v.object({
        childId: v.id("children"),
        firstName: v.string(),
        lastName: v.string(),
        dateOfBirth: v.optional(v.string()),
        hasEnrollment: v.boolean(),
      })
    ),
    upcoming: v.array(
      v.object({
        classId: v.id("classes"),
        atMs: v.number(),
        dowShort: v.string(),
        dayNum: v.number(),
        className: v.string(),
        childFirstName: v.string(),
        startTime: v.string(),
        endTime: v.string(),
        locationName: v.string(),
        locationDetail: v.optional(v.string()),
        discipline: v.string(),
        ageGroup: v.optional(v.string()),
        description: v.optional(v.string()),
        tint: tintV,
        schedulePending: v.boolean(),
      })
    ),
    pendingPayments: v.array(
      v.object({
        subscriptionId: v.id("subscriptions"),
        childName: v.string(),
        className: v.string(),
        amountGrosze: v.number(),
      })
    ),
    activePaidLines: v.array(
      v.object({
        childName: v.string(),
        className: v.string(),
      })
    ),
    pendingTotalGrosze: v.number(),
    pendingCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    const asOf = args.asOfTimestamp;

    if (!Number.isFinite(asOf) || asOf < 0) {
      return {
        childrenRows: [],
        upcoming: [],
        pendingPayments: [],
        activePaidLines: [],
        pendingTotalGrosze: 0,
        pendingCount: 0,
      };
    }

    const children = await ctx.db
      .query("children")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const classIds = [
      ...new Set(subscriptions.map((s) => s.classId)),
    ] as Id<"classes">[];
    const classes = await Promise.all(classIds.map((id) => ctx.db.get("classes", id)));
    const classMap = Object.fromEntries(
      classes.filter(Boolean).map((c) => [c!._id, c!])
    );

    const locationIds = [
      ...new Set(
        classes.filter(Boolean).map((c) => c!.locationId)
      ),
    ] as Id<"locations">[];
    const locations = await Promise.all(
      locationIds.map((id) => ctx.db.get("locations", id))
    );
    const locMap = Object.fromEntries(
      locations.filter(Boolean).map((l) => [l!._id, l!])
    );

    const slotsByClass: Record<string, Doc<"timeSlots">[]> = {};
    for (const cid of classIds) {
      const slots = await ctx.db
        .query("timeSlots")
        .withIndex("by_class", (q) => q.eq("classId", cid))
        .collect();
      slotsByClass[cid] = slots;
    }

    const childName = (childId: Id<"children"> | undefined): string => {
      if (!childId) return "Uczestnik";
      const ch = children.find((c) => c._id === childId);
      return ch ? `${ch.firstName} ${ch.lastName}` : "Uczestnik";
    };

    const childFirst = (childId: Id<"children"> | undefined): string => {
      if (!childId) return "Dziecko";
      const ch = children.find((c) => c._id === childId);
      return ch?.firstName ?? "Dziecko";
    };

    const childrenRows = children.map((ch) => {
      const hasEnrollment = subscriptions.some(
        (s) => s.childId === ch._id && isActiveEnrollmentStatus(s.status)
      );
      return {
        childId: ch._id,
        firstName: ch.firstName,
        lastName: ch.lastName,
        dateOfBirth: ch.dateOfBirth,
        hasEnrollment,
      };
    });

    type UpcomingCand = {
      classId: Id<"classes">;
      atMs: number;
      dowShort: string;
      dayNum: number;
      className: string;
      childFirstName: string;
      startTime: string;
      endTime: string;
      locationName: string;
      locationDetail?: string;
      discipline: string;
      ageGroup?: string;
      description?: string;
      tint: "orange" | "sky" | "violet";
      schedulePending: boolean;
      subId: Id<"subscriptions">;
    };

    const locationDetailLine = (loc: Doc<"locations"> | undefined): string | undefined => {
      if (!loc) return undefined;
      const parts = [loc.address?.trim(), loc.city?.trim()].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : undefined;
    };

    const upcomingCandidates: UpcomingCand[] = [];

    for (const sub of subscriptions) {
      if (!isActiveEnrollmentStatus(sub.status)) continue;
      const cls = classMap[sub.classId];
      if (!cls) continue;
      const slots = slotsByClass[sub.classId] ?? [];
      const loc = locMap[cls.locationId];
      const childFn = childFirst(sub.childId);
      const tint = disciplineTint(cls.discipline);
      const locName = loc?.name ?? "Lokalizacja";
      const locDetail = locationDetailLine(loc);
      const desc = cls.description?.trim() || undefined;
      const age = cls.ageGroup?.trim() || undefined;

      if (slots.length === 0) {
        upcomingCandidates.push({
          classId: cls._id,
          atMs: Number.MAX_SAFE_INTEGER,
          dowShort: "—",
          dayNum: 0,
          className: cls.name,
          childFirstName: childFn,
          startTime: "",
          endTime: "",
          locationName: locName,
          locationDetail: locDetail,
          discipline: cls.discipline,
          ageGroup: age,
          description: desc,
          tint,
          schedulePending: true,
          subId: sub._id,
        });
        continue;
      }
      for (const sl of slots) {
        const at = nextOccurrenceMs(asOf, sl.dayOfWeek, sl.startTime);
        const d = new Date(at);
        upcomingCandidates.push({
          classId: cls._id,
          atMs: at,
          dowShort: DOW_PL[d.getDay()] ?? "??",
          dayNum: d.getDate(),
          className: cls.name,
          childFirstName: childFn,
          startTime: sl.startTime,
          endTime: sl.endTime,
          locationName: locName,
          locationDetail: locDetail,
          discipline: cls.discipline,
          ageGroup: age,
          description: desc,
          tint,
          schedulePending: false,
          subId: sub._id,
        });
      }
    }

    upcomingCandidates.sort((a, b) => {
      if (a.schedulePending !== b.schedulePending) {
        return a.schedulePending ? 1 : -1;
      }
      if (a.atMs !== b.atMs) return a.atMs - b.atMs;
      return a.className.localeCompare(b.className, "pl");
    });

    const seen = new Set<string>();
    const upcoming: {
      classId: Id<"classes">;
      atMs: number;
      dowShort: string;
      dayNum: number;
      className: string;
      childFirstName: string;
      startTime: string;
      endTime: string;
      locationName: string;
      locationDetail?: string;
      discipline: string;
      ageGroup?: string;
      description?: string;
      tint: "orange" | "sky" | "violet";
      schedulePending: boolean;
    }[] = [];

    for (const row of upcomingCandidates) {
      const key = row.schedulePending
        ? `p-${row.subId}`
        : `${row.className}-${row.atMs}-${row.childFirstName}`;
      if (seen.has(key)) continue;
      seen.add(key);
      upcoming.push({
        classId: row.classId,
        atMs: row.atMs,
        dowShort: row.dowShort,
        dayNum: row.dayNum,
        className: row.className,
        childFirstName: row.childFirstName,
        startTime: row.startTime,
        endTime: row.endTime,
        locationName: row.locationName,
        locationDetail: row.locationDetail,
        discipline: row.discipline,
        ageGroup: row.ageGroup,
        description: row.description,
        tint: row.tint,
        schedulePending: row.schedulePending,
      });
      if (upcoming.length >= 8) break;
    }

    const pendingPayments = subscriptions
      .filter((s) => s.status === "pending_payment")
      .map((s) => {
        const cls = classMap[s.classId];
        return {
          subscriptionId: s._id,
          childName: childName(s.childId),
          className: cls?.name ?? "Zajęcia",
          amountGrosze: MONTHLY_FEE_GROSZE,
        };
      });

    const activePaidLines = subscriptions
      .filter((s) => s.status === "active")
      .map((s) => ({
        childName: childName(s.childId),
        className: classMap[s.classId]?.name ?? "Zajęcia",
      }));

    const pendingTotalGrosze =
      pendingPayments.length * MONTHLY_FEE_GROSZE;

    return {
      childrenRows,
      upcoming,
      pendingPayments,
      activePaidLines,
      pendingTotalGrosze,
      pendingCount: pendingPayments.length,
    };
  },
});
