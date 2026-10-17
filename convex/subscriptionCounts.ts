import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { isSeatHoldingStatus } from "./billingHelpers";

/** Subscriptions that occupy a class seat (active or non-expired payment hold). */
export function isActiveEnrollmentStatus(status: string): boolean {
  return status === "pending_payment" || status === "active";
}

type DbReader = QueryCtx["db"] | MutationCtx["db"];

/**
 * Live count of subscriptions that count toward class capacity.
 * Uses `by_class` and filters in memory so logic stays aligned with mutations.
 * Expired payment holds do not occupy seats.
 */
export async function countActiveEnrollmentsForClass(
  db: DbReader,
  classId: Id<"classes">,
  nowMs: number = Date.now()
): Promise<number> {
  const subs = await db
    .query("subscriptions")
    .withIndex("by_class", (q) => q.eq("classId", classId))
    .collect();
  return subs.filter((s) =>
    isSeatHoldingStatus(s.status, s.paymentHoldExpiresAt, nowMs)
  ).length;
}
