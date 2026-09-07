import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdmin } from "./authHelpers";

export const createCampRegistration = mutation({
  args: {
    campId: v.id("camps"),
    childName: v.string(),
    childSurname: v.string(),
    childDob: v.optional(v.string()),
    childPesel: v.optional(v.string()),
    dietary: v.optional(v.string()),
    allergies: v.optional(v.string()),
    medicalNotes: v.optional(v.string()),
    parentName: v.string(),
    parentPhone: v.optional(v.string()),
    parentEmail: v.string(),
    customAnswers: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    if (!args.childName || !args.childSurname || !args.parentName || !args.parentEmail) {
      throw new Error("Wypełnij wymagane pola");
    }
    const camp = await ctx.db.get(args.campId);
    if (!camp) {
      throw new Error("Nie znaleziono obozu");
    }
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("registrations", {
      userId: userId ?? undefined,
      campId: args.campId,
      childName: args.childName,
      childSurname: args.childSurname,
      childDob: args.childDob,
      childPesel: args.childPesel,
      dietary: args.dietary,
      allergies: args.allergies,
      medicalNotes: args.medicalNotes,
      parentName: args.parentName,
      parentPhone: args.parentPhone,
      parentEmail: args.parentEmail,
      status: "new",
      customAnswers: args.customAnswers,
    });
  },
});

/**
 * List camp registrations for the current user (dashboard).
 * Returns registrations where userId matches or parentEmail matches user's email.
 */
export const listMyCampRegistrations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const user = await ctx.db.get("users", userId);
    if (!user?.email) {
      return ctx.db
        .query("registrations")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
    }
    const byUser = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const byEmail = await ctx.db
      .query("registrations")
      .withIndex("by_parent_email", (q) => q.eq("parentEmail", user.email!))
      .collect();
    const seen = new Set(byUser.map((r) => r._id));
    const combined = [...byUser];
    for (const r of byEmail) {
      if (!seen.has(r._id)) {
        seen.add(r._id);
        combined.push(r);
      }
    }
    const campIds = [...new Set(combined.map((c) => c.campId))];
    const camps = await Promise.all(campIds.map((id) => ctx.db.get("camps", id)));
    const campMap = Object.fromEntries(
      camps.filter(Boolean).map((c) => [c!._id, c!])
    );
    return combined
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0))
      .map((r) => ({
        ...r,
        camp: campMap[r.campId],
      }));
  },
});

export const createNocowankaRegistration = mutation({
  args: {
    slug: v.string(),
    childName: v.string(),
    childSurname: v.string(),
    childDob: v.optional(v.string()),
    childPesel: v.optional(v.string()),
    dietary: v.optional(v.string()),
    allergies: v.optional(v.string()),
    medicalNotes: v.optional(v.string()),
    parentName: v.string(),
    parentPhone: v.optional(v.string()),
    parentEmail: v.string(),
    customAnswers: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    if (!args.childName?.trim() || !args.childSurname?.trim() || !args.parentName?.trim() || !args.parentEmail?.trim()) {
      throw new Error("Wypełnij wymagane pola");
    }
    if (!args.slug?.trim()) {
      throw new Error("Nieprawidłowa nocowanka");
    }
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("nocowankaRegistrations", {
      userId: userId ?? undefined,
      slug: args.slug.trim(),
      childName: args.childName.trim(),
      childSurname: args.childSurname.trim(),
      childDob: args.childDob || undefined,
      childPesel: args.childPesel || undefined,
      dietary: args.dietary || undefined,
      allergies: args.allergies || undefined,
      medicalNotes: args.medicalNotes || undefined,
      parentName: args.parentName.trim(),
      parentPhone: args.parentPhone || undefined,
      parentEmail: args.parentEmail.trim(),
      status: "new",
      customAnswers: args.customAnswers,
    });
  },
});

export const listMyNocowankaRegistrations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const user = await ctx.db.get("users", userId);
    if (!user?.email) {
      return ctx.db
        .query("nocowankaRegistrations")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
    }
    const byUser = await ctx.db
      .query("nocowankaRegistrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const byEmail = await ctx.db
      .query("nocowankaRegistrations")
      .withIndex("by_parent_email", (q) => q.eq("parentEmail", user.email!))
      .collect();
    const seen = new Set(byUser.map((r) => r._id));
    const combined = [...byUser];
    for (const r of byEmail) {
      if (!seen.has(r._id)) {
        seen.add(r._id);
        combined.push(r);
      }
    }
    return combined.sort(
      (a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0)
    );
  },
});

/**
 * List all camp registrations for admin. Includes camp details.
 */
export const listCampRegistrationsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const list = await ctx.db.query("registrations").collect();
    const campIds = [...new Set(list.map((r) => r.campId))];
    const camps = await Promise.all(campIds.map((id) => ctx.db.get("camps", id)));
    const campMap = Object.fromEntries(
      camps.filter(Boolean).map((c) => [c!._id, c!])
    );
    return list
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0))
      .map((r) => ({
        ...r,
        camp: campMap[r.campId],
      }));
  },
});

/**
 * List all nocowanka registrations for admin.
 */
export const listNocowankaRegistrationsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const list = await ctx.db.query("nocowankaRegistrations").collect();
    return list.sort(
      (a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0)
    );
  },
});

/**
 * List registrations for a specific camp (admin). Includes camp and childDob for age.
 */
export const listRegistrationsByCamp = query({
  args: { campId: v.id("camps") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const camp = await ctx.db.get("camps", args.campId);
    if (!camp) return [];
    const list = await ctx.db
      .query("registrations")
      .withIndex("by_camp", (q) => q.eq("campId", args.campId))
      .collect();
    return list
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0))
      .map((r) => ({
        ...r,
        camp,
      }));
  },
});

/**
 * List registrations for a specific nocowanka slug (admin).
 */
export const listRegistrationsByNocowankaSlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("nocowankaRegistrations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .order("desc")
      .collect();
  },
});

/**
 * List distinct nocowanka slugs that have registrations (admin).
 */
export const listNocowankaSlugsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const list = await ctx.db.query("nocowankaRegistrations").collect();
    const slugs = [...new Set(list.map((r) => r.slug))].sort();
    return slugs;
  },
});

/**
 * Registration counts per camp (admin). Keys are camp IDs, values are counts.
 */
export const getCampRegistrationCountsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const list = await ctx.db.query("registrations").collect();
    const counts: Record<string, number> = {};
    for (const r of list) {
      const id = r.campId as string;
      counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  },
});

/**
 * Registration counts per nocowanka slug (admin).
 */
export const getNocowankaRegistrationCountsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const list = await ctx.db.query("nocowankaRegistrations").collect();
    const counts: Record<string, number> = {};
    for (const r of list) {
      counts[r.slug] = (counts[r.slug] ?? 0) + 1;
    }
    return counts;
  },
});

/**
 * Public count of registrations for a nocowanka slug.
 */
export const countNocowankaRegistrationsPublic = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const slug = args.slug.trim();
    if (!slug) return 0;
    const list = await ctx.db
      .query("nocowankaRegistrations")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .collect();
    return list.length;
  },
});
