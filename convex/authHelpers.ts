import { query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Returns the current user's id if authenticated, or null.
 * Use in queries/mutations that allow both authenticated and anonymous access.
 */
export async function getCurrentUserIdOrNull(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users"> | null> {
  return await getAuthUserId(ctx);
}

/**
 * Returns the current user's id or throws if not authenticated.
 * Use in queries/mutations that must run only for logged-in users
 * (e.g. writing to users, children, subscriptions).
 */
export async function requireAuthUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Musisz być zalogowany.");
  }
  return userId;
}

/**
 * Returns the current user's document (including role) or throws if not admin.
 * Use in admin-only queries and mutations.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<{ _id: Id<"users">; role?: string }> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Musisz być zalogowany.");
  }
  const user = await ctx.db.get("users", userId);
  if (user === null || user.role !== "admin") {
    throw new Error("Brak uprawnień.");
  }
  return user;
}

/**
 * Returns the current user's document (including role) or null if not authenticated.
 * Use for role-based UI (e.g. admin link, AdminAuthGuard).
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get("users", userId);
  },
});
