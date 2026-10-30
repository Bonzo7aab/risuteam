import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdmin, requireAuthUserId } from "./authHelpers";

function normName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function isActiveRegistrationStatus(status: string | undefined): boolean {
  return status !== "cancelled";
}

function campChildKey(
  campId: Id<"camps">,
  childName: string,
  childSurname: string
): string {
  return `${campId}|${normName(childName)}|${normName(childSurname)}`;
}

function nocowankaChildKey(
  slug: string,
  childName: string,
  childSurname: string
): string {
  return `${slug.trim().toLowerCase()}|${normName(childName)}|${normName(childSurname)}`;
}

/** Keep newest registration per camp+child (or slug+child). */
function dedupeByChildKey<T extends { _creationTime: number }>(
  rows: T[],
  keyOf: (row: T) => string
): T[] {
  const best = new Map<string, T>();
  for (const row of rows) {
    const key = keyOf(row);
    const prev = best.get(key);
    if (!prev || row._creationTime > prev._creationTime) {
      best.set(key, row);
    }
  }
  return [...best.values()].sort(
    (a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0)
  );
}

async function collectMyCampRegs(
  ctx: QueryCtx,
  userId: Id<"users">,
  email: string | undefined
): Promise<Doc<"registrations">[]> {
  const byUser = await ctx.db
    .query("registrations")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  if (!email) return byUser;
  const byEmail = await ctx.db
    .query("registrations")
    .withIndex("by_parent_email", (q) => q.eq("parentEmail", email))
    .collect();
  const seen = new Set(byUser.map((r) => r._id));
  const combined = [...byUser];
  for (const r of byEmail) {
    if (!seen.has(r._id)) {
      seen.add(r._id);
      combined.push(r);
    }
  }
  return combined;
}

async function collectMyNocowankaRegs(
  ctx: QueryCtx,
  userId: Id<"users">,
  email: string | undefined
): Promise<Doc<"nocowankaRegistrations">[]> {
  const byUser = await ctx.db
    .query("nocowankaRegistrations")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  if (!email) return byUser;
  const byEmail = await ctx.db
    .query("nocowankaRegistrations")
    .withIndex("by_parent_email", (q) => q.eq("parentEmail", email))
    .collect();
  const seen = new Set(byUser.map((r) => r._id));
  const combined = [...byUser];
  for (const r of byEmail) {
    if (!seen.has(r._id)) {
      seen.add(r._id);
      combined.push(r);
    }
  }
  return combined;
}

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
    const childName = args.childName.trim();
    const childSurname = args.childSurname.trim();
    const parentEmail = args.parentEmail.trim();
    const key = campChildKey(args.campId, childName, childSurname);

    const existingForCamp = await ctx.db
      .query("registrations")
      .withIndex("by_camp", (q) => q.eq("campId", args.campId))
      .collect();
    const duplicate = existingForCamp
      .filter(
        (r) =>
          isActiveRegistrationStatus(r.status) &&
          campChildKey(r.campId, r.childName, r.childSurname) === key &&
          (userId
            ? r.userId === userId ||
              normName(r.parentEmail) === normName(parentEmail)
            : normName(r.parentEmail) === normName(parentEmail))
      )
      .sort((a, b) => b._creationTime - a._creationTime)[0];

    if (duplicate) {
      return duplicate._id;
    }

    return await ctx.db.insert("registrations", {
      userId: userId ?? undefined,
      campId: args.campId,
      childName,
      childSurname,
      childDob: args.childDob,
      childPesel: args.childPesel,
      dietary: args.dietary,
      allergies: args.allergies,
      medicalNotes: args.medicalNotes,
      parentName: args.parentName.trim(),
      parentPhone: args.parentPhone,
      parentEmail,
      status: "new",
      paymentStatus: "unpaid",
      amountPaid: 0,
      customAnswers: args.customAnswers,
    });
  },
});

/**
 * List camp registrations for the current user (dashboard).
 * Returns registrations where userId matches or parentEmail matches user's email.
 * Dedupes accidental double-submits (same camp + child).
 */
export const listMyCampRegistrations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const user = await ctx.db.get("users", userId);
    const combined = (await collectMyCampRegs(ctx, userId, user?.email)).filter(
      (r) => isActiveRegistrationStatus(r.status)
    );
    const deduped = dedupeByChildKey(combined, (r) =>
      campChildKey(r.campId, r.childName, r.childSurname)
    );
    const campIds = [...new Set(deduped.map((c) => c.campId))];
    const camps = await Promise.all(campIds.map((id) => ctx.db.get("camps", id)));
    const campMap = Object.fromEntries(
      camps.filter(Boolean).map((c) => [c!._id, c!] as const)
    );
    return deduped.map((r) => ({
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
    const slug = args.slug.trim();
    const childName = args.childName.trim();
    const childSurname = args.childSurname.trim();
    const parentEmail = args.parentEmail.trim();
    const key = nocowankaChildKey(slug, childName, childSurname);

    const existingForSlug = await ctx.db
      .query("nocowankaRegistrations")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .collect();
    const duplicate = existingForSlug
      .filter(
        (r) =>
          isActiveRegistrationStatus(r.status) &&
          nocowankaChildKey(r.slug, r.childName, r.childSurname) === key &&
          (userId
            ? r.userId === userId ||
              normName(r.parentEmail) === normName(parentEmail)
            : normName(r.parentEmail) === normName(parentEmail))
      )
      .sort((a, b) => b._creationTime - a._creationTime)[0];

    if (duplicate) {
      return duplicate._id;
    }

    return await ctx.db.insert("nocowankaRegistrations", {
      userId: userId ?? undefined,
      slug,
      childName,
      childSurname,
      childDob: args.childDob || undefined,
      childPesel: args.childPesel || undefined,
      dietary: args.dietary || undefined,
      allergies: args.allergies || undefined,
      medicalNotes: args.medicalNotes || undefined,
      parentName: args.parentName.trim(),
      parentPhone: args.parentPhone || undefined,
      parentEmail,
      status: "new",
      paymentStatus: "unpaid",
      amountPaid: 0,
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
    const combined = (
      await collectMyNocowankaRegs(ctx, userId, user?.email)
    ).filter((r) => isActiveRegistrationStatus(r.status));
    return dedupeByChildKey(combined, (r) =>
      nocowankaChildKey(r.slug, r.childName, r.childSurname)
    );
  },
});

async function assertOwnsCampRegistration(
  ctx: MutationCtx,
  registrationId: Id<"registrations">
) {
  const userId = await requireAuthUserId(ctx);
  const user = await ctx.db.get("users", userId);
  const reg = await ctx.db.get("registrations", registrationId);
  if (!reg) throw new Error("Nie znaleziono rejestracji.");
  const email = user?.email?.trim().toLowerCase();
  const owns =
    reg.userId === userId ||
    (email != null &&
      email.length > 0 &&
      reg.parentEmail.trim().toLowerCase() === email);
  if (!owns) throw new Error("Brak uprawnień do tej rejestracji.");
  return reg;
}

async function assertOwnsNocowankaRegistration(
  ctx: MutationCtx,
  registrationId: Id<"nocowankaRegistrations">
) {
  const userId = await requireAuthUserId(ctx);
  const user = await ctx.db.get("users", userId);
  const reg = await ctx.db.get("nocowankaRegistrations", registrationId);
  if (!reg) throw new Error("Nie znaleziono rejestracji.");
  const email = user?.email?.trim().toLowerCase();
  const owns =
    reg.userId === userId ||
    (email != null &&
      email.length > 0 &&
      reg.parentEmail.trim().toLowerCase() === email);
  if (!owns) throw new Error("Brak uprawnień do tej rejestracji.");
  return reg;
}

export const cancelCampRegistration = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, args) => {
    const reg = await assertOwnsCampRegistration(ctx, args.registrationId);
    if (reg.status === "cancelled") return args.registrationId;
    await ctx.db.patch(args.registrationId, { status: "cancelled" });
    return args.registrationId;
  },
});

export const cancelNocowankaRegistration = mutation({
  args: { registrationId: v.id("nocowankaRegistrations") },
  handler: async (ctx, args) => {
    const reg = await assertOwnsNocowankaRegistration(ctx, args.registrationId);
    if (reg.status === "cancelled") return args.registrationId;
    await ctx.db.patch(args.registrationId, { status: "cancelled" });
    return args.registrationId;
  },
});

/**
 * Remove accidental duplicate registrations (same event + child),
 * keeping the newest row in each group.
 * Run: `npx convex run registrations:cleanupDuplicateRegistrations`
 */
export const cleanupDuplicateRegistrations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const camps = await ctx.db.query("registrations").collect();
    const campGroups = new Map<string, Doc<"registrations">[]>();
    for (const r of camps) {
      const key = campChildKey(r.campId, r.childName, r.childSurname);
      const list = campGroups.get(key) ?? [];
      list.push(r);
      campGroups.set(key, list);
    }
    let deletedCamps = 0;
    for (const group of campGroups.values()) {
      if (group.length < 2) continue;
      group.sort((a, b) => b._creationTime - a._creationTime);
      for (const extra of group.slice(1)) {
        await ctx.db.delete(extra._id);
        deletedCamps += 1;
      }
    }

    const nocs = await ctx.db.query("nocowankaRegistrations").collect();
    const nocGroups = new Map<string, Doc<"nocowankaRegistrations">[]>();
    for (const r of nocs) {
      const key = nocowankaChildKey(r.slug, r.childName, r.childSurname);
      const list = nocGroups.get(key) ?? [];
      list.push(r);
      nocGroups.set(key, list);
    }
    let deletedNocowanki = 0;
    for (const group of nocGroups.values()) {
      if (group.length < 2) continue;
      group.sort((a, b) => b._creationTime - a._creationTime);
      for (const extra of group.slice(1)) {
        await ctx.db.delete(extra._id);
        deletedNocowanki += 1;
      }
    }

    return { deletedCamps, deletedNocowanki };
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
