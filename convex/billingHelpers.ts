import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/** Default monthly class fee in grosze (240 zł). Keep in sync with lib/pricing.ts. */
export const DEFAULT_MONTHLY_FEE_GROSZE = 24_000;

/** Capacity hold before unpaid enrollment is auto-cancelled. */
export const PAYMENT_HOLD_MS = 7 * 24 * 60 * 60 * 1000;

export type PaymentStatus = "paid" | "partial" | "unpaid";

type Db = QueryCtx["db"] | MutationCtx["db"];

export function classMonthlyFeeGrosze(cls: Doc<"classes"> | null | undefined): number {
  if (cls?.monthlyFeeGrosze != null && cls.monthlyFeeGrosze > 0) {
    return cls.monthlyFeeGrosze;
  }
  return DEFAULT_MONTHLY_FEE_GROSZE;
}

/** Calendar month period as UTC ms bounds (local-ish: uses Date year/month). */
export function billingPeriodForDate(d: Date = new Date()): {
  year: number;
  month: number;
  periodStart: number;
  periodEnd: number;
} {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const periodStart = new Date(year, month - 1, 1, 0, 0, 0, 0).getTime();
  const periodEnd = new Date(year, month, 0, 23, 59, 59, 999).getTime();
  return { year, month, periodStart, periodEnd };
}

export function periodKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

const MONTH_LABELS_PL = [
  "sty",
  "lut",
  "mar",
  "kwi",
  "maj",
  "cze",
  "lip",
  "sie",
  "wrz",
  "paź",
  "lis",
  "gru",
] as const;

/** Short Polish label, e.g. "paź 2026". */
export function formatPeriodLabelPl(year: number, month: number): string {
  const label = MONTH_LABELS_PL[month - 1] ?? String(month);
  return `${label} ${year}`;
}

/** Inclusive calendar months from startMs through endMs (typically now). */
export function monthsFromTo(
  startMs: number,
  endMs: number
): Array<{ year: number; month: number }> {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) {
    const cur = billingPeriodForDate(new Date(endMs || Date.now()));
    return [{ year: cur.year, month: cur.month }];
  }
  const start = new Date(startMs);
  const end = new Date(endMs);
  let y = start.getFullYear();
  let m = start.getMonth() + 1;
  const endY = end.getFullYear();
  const endM = end.getMonth() + 1;
  const out: Array<{ year: number; month: number }> = [];
  // Cap at 36 months to avoid runaway history
  for (let i = 0; i < 36; i++) {
    out.push({ year: y, month: m });
    if (y === endY && m === endM) break;
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

/**
 * Billing months for a subscription: from startDate through now
 * (or endDate if cancelled/ended and earlier).
 */
export function expectedBillingMonthsForSubscription(sub: {
  startDate: number;
  endDate?: number;
  status: string;
}): Array<{ year: number; month: number }> {
  const now = Date.now();
  const endMs =
    (sub.status === "cancelled" || sub.status === "ended") &&
    sub.endDate != null
      ? Math.min(sub.endDate, now)
      : now;
  return monthsFromTo(sub.startDate, endMs);
}

export async function listInvoicesForSubscription(
  db: Db,
  subscriptionId: Id<"subscriptions">
): Promise<Doc<"classInvoices">[]> {
  return await db
    .query("classInvoices")
    .withIndex("by_subscription", (q) =>
      q.eq("subscriptionId", subscriptionId)
    )
    .collect();
}

/**
 * Create missing unpaid invoices from subscription start through current month.
 * Idempotent. Call from mutations only.
 */
export async function ensureInvoicesThroughCurrentMonth(
  ctx: MutationCtx,
  args: {
    subscriptionId: Id<"subscriptions">;
    startDate: number;
    endDate?: number;
    status: string;
    amountGrosze: number;
  }
): Promise<number> {
  const months = expectedBillingMonthsForSubscription({
    startDate: args.startDate,
    endDate: args.endDate,
    status: args.status,
  });
  let created = 0;
  for (const { year, month } of months) {
    const existing = await findInvoiceForPeriod(
      ctx.db,
      args.subscriptionId,
      year,
      month
    );
    if (existing) continue;
    await ensureClassInvoiceForPeriod(ctx, {
      subscriptionId: args.subscriptionId,
      amountGrosze: args.amountGrosze,
      year,
      month,
      paymentStatus: "unpaid",
      amountPaidGrosze: 0,
    });
    created += 1;
  }
  return created;
}

/**
 * Camp due amount in PLN (same unit as camps.price).
 * Applies earlyBirdDiscountPercent when set and > 0.
 */
export function campDueAmountPln(camp: Doc<"camps"> | null | undefined): number {
  const base = camp?.price ?? 0;
  const pct = camp?.earlyBirdDiscountPercent;
  if (pct != null && pct > 0 && pct < 100) {
    return Math.round(base * (1 - pct / 100));
  }
  return base;
}

export function nocowankaDueAmountPln(
  nocowanka: Doc<"nocowanki"> | null | undefined,
  fallbackPln = 170
): number {
  if (nocowanka?.price != null && nocowanka.price > 0) return nocowanka.price;
  return fallbackPln;
}

/** Seat-holding statuses for capacity (excluding expired holds). */
export function isSeatHoldingStatus(
  status: string,
  paymentHoldExpiresAt: number | undefined,
  nowMs: number
): boolean {
  if (status === "active") return true;
  if (status === "pending_payment") {
    if (paymentHoldExpiresAt != null && paymentHoldExpiresAt < nowMs) {
      return false;
    }
    return true;
  }
  return false;
}

export async function findInvoiceForPeriod(
  db: Db,
  subscriptionId: Id<"subscriptions">,
  year: number,
  month: number
): Promise<Doc<"classInvoices"> | null> {
  const rows = await db
    .query("classInvoices")
    .withIndex("by_subscription_period", (q) =>
      q.eq("subscriptionId", subscriptionId).eq("year", year).eq("month", month)
    )
    .collect();
  return rows[0] ?? null;
}

/**
 * Ensure a class invoice exists for the subscription's billing period.
 * Call from mutations only (inserts).
 */
export async function ensureClassInvoiceForPeriod(
  ctx: MutationCtx,
  args: {
    subscriptionId: Id<"subscriptions">;
    amountGrosze: number;
    year?: number;
    month?: number;
    paymentStatus?: PaymentStatus;
    amountPaidGrosze?: number;
  }
): Promise<Id<"classInvoices">> {
  const { year, month, periodStart, periodEnd } = billingPeriodForDate(
    args.year != null && args.month != null
      ? new Date(args.year, args.month - 1, 1)
      : new Date()
  );
  const y = args.year ?? year;
  const m = args.month ?? month;
  const existing = await findInvoiceForPeriod(ctx.db, args.subscriptionId, y, m);
  if (existing) return existing._id;

  return await ctx.db.insert("classInvoices", {
    subscriptionId: args.subscriptionId,
    year: y,
    month: m,
    periodStart:
      args.year != null && args.month != null
        ? new Date(y, m - 1, 1, 0, 0, 0, 0).getTime()
        : periodStart,
    periodEnd:
      args.year != null && args.month != null
        ? new Date(y, m, 0, 23, 59, 59, 999).getTime()
        : periodEnd,
    amountGrosze: args.amountGrosze,
    paymentStatus: args.paymentStatus ?? "unpaid",
    amountPaidGrosze: args.amountPaidGrosze ?? 0,
  });
}

export async function recordPaymentLedger(
  ctx: MutationCtx,
  args: {
    source: "class_invoice" | "camp_registration" | "nocowanka_registration";
    sourceId: string;
    amountGrosze: number;
    recordedBy?: Id<"users">;
    note?: string;
    method?: "bank_transfer" | "card" | "online" | "manual";
    provider?: "stripe" | "przelewy24" | "manual";
    externalId?: string;
    status?: "recorded" | "pending" | "failed" | "refunded";
  }
): Promise<Id<"payments">> {
  return await ctx.db.insert("payments", {
    source: args.source,
    sourceId: args.sourceId,
    amountGrosze: args.amountGrosze,
    recordedAt: Date.now(),
    recordedBy: args.recordedBy,
    note: args.note,
    method: args.method ?? "bank_transfer",
    provider: args.provider ?? "manual",
    externalId: args.externalId,
    status: args.status ?? "recorded",
  });
}

/** Cancel subscriptions whose payment hold has expired. */
export async function expirePaymentHolds(
  ctx: MutationCtx,
  nowMs: number = Date.now()
): Promise<number> {
  const pending = await ctx.db
    .query("subscriptions")
    .withIndex("by_status", (q) => q.eq("status", "pending_payment"))
    .collect();
  let n = 0;
  for (const sub of pending) {
    if (
      sub.paymentHoldExpiresAt != null &&
      sub.paymentHoldExpiresAt < nowMs
    ) {
      await ctx.db.patch(sub._id, {
        status: "cancelled",
        endDate: nowMs,
      });
      n += 1;
    }
  }
  return n;
}
