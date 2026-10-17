import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/** Cancel class enrollments whose unpaid payment hold has expired. */
crons.interval(
  "expire class payment holds",
  { hours: 6 },
  internal.paymentsInternal.expirePaymentHoldsInternal
);

/** Create missing monthly invoices for active class enrollments. */
crons.interval(
  "ensure class monthly invoices",
  { hours: 12 },
  internal.paymentsInternal.ensureMonthlyInvoicesInternal
);

export default crons;
