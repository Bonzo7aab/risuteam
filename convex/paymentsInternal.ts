import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import {
  classMonthlyFeeGrosze,
  ensureInvoicesThroughCurrentMonth,
  expirePaymentHolds,
  isSeatHoldingStatus,
} from "./billingHelpers";

export const expirePaymentHoldsInternal = internalMutation({
  args: {},
  returns: v.object({ expired: v.number() }),
  handler: async (ctx) => {
    const expired = await expirePaymentHolds(ctx);
    return { expired };
  },
});

/** Ensure monthly invoices exist through the current month for seat-holding enrollments. */
export const ensureMonthlyInvoicesInternal = internalMutation({
  args: {},
  returns: v.object({
    subscriptionsProcessed: v.number(),
    invoicesCreated: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    const subs = await ctx.db.query("subscriptions").collect();
    let subscriptionsProcessed = 0;
    let invoicesCreated = 0;
    for (const s of subs) {
      if (!isSeatHoldingStatus(s.status, s.paymentHoldExpiresAt, now)) continue;
      const cls = await ctx.db.get("classes", s.classId);
      const fee = classMonthlyFeeGrosze(cls);
      const created = await ensureInvoicesThroughCurrentMonth(ctx, {
        subscriptionId: s._id,
        startDate: s.startDate,
        endDate: s.endDate,
        status: s.status,
        amountGrosze: fee,
      });
      subscriptionsProcessed += 1;
      invoicesCreated += created;
    }
    return { subscriptionsProcessed, invoicesCreated };
  },
});
