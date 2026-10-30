import {
  action,
  internalMutation,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { requireAdmin, requireAuthUserId } from "./authHelpers";
import { isSeatHoldingStatus } from "./billingHelpers";
import {
  billingPeriodForDate,
  campDueAmountPln,
  classMonthlyFeeGrosze,
  DEFAULT_MONTHLY_FEE_GROSZE,
  ensureClassInvoiceForPeriod,
  ensureInvoicesThroughCurrentMonth,
  expectedBillingMonthsForSubscription,
  expirePaymentHolds,
  findInvoiceForPeriod,
  formatPeriodLabelPl,
  listInvoicesForSubscription,
  nocowankaDueAmountPln,
  recordPaymentLedger,
} from "./billingHelpers";
import { assertClassesEnrollmentPaymentsEnabled } from "./siteSettings";

const BREVO_SMTP_URL = "https://api.brevo.com/v3/smtp/email";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const paymentStatusValidator = v.union(
  v.literal("paid"),
  v.literal("partial"),
  v.literal("unpaid")
);

/**
 * Unified payment row for admin: camp and nocowanka registrations.
 * Amounts resolved from DB (camps.price / nocowanki.price).
 */
export const listPaymentRowsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const campRegs = await ctx.db.query("registrations").collect();
    const nocowankaRegs = await ctx.db
      .query("nocowankaRegistrations")
      .collect();
    const nocowanki = await ctx.db.query("nocowanki").collect();
    const nocowankaMap = new Map(nocowanki.map((n) => [n.slug, n]));

    const campIds = [...new Set(campRegs.map((r) => r.campId))];
    const camps = await Promise.all(
      campIds.map((id) => ctx.db.get("camps", id))
    );
    const campMap = new Map(camps.filter(Boolean).map((c) => [c!._id, c!]));

    const rows: Array<{
      id: string;
      source: "camp" | "nocowanka";
      registrationId: Id<"registrations"> | Id<"nocowankaRegistrations">;
      campId?: Id<"camps">;
      slug?: string;
      studentName: string;
      parentName: string;
      amount: number;
      amountPaid?: number;
      date: number;
      category: string;
      eventName: string;
      eventType: "camp" | "nocowanka";
      eventKey: string;
      eventOpen: boolean;
      paymentStatus: "paid" | "partial" | "unpaid";
    }> = [];

    for (const r of campRegs) {
      const camp = campMap.get(r.campId);
      rows.push({
        id: `camp-${r._id}`,
        source: "camp",
        registrationId: r._id,
        campId: r.campId,
        studentName: `${r.childName} ${r.childSurname}`.trim(),
        parentName: r.parentName,
        amount: campDueAmountPln(camp),
        amountPaid: r.amountPaid ?? 0,
        date: r._creationTime,
        category: camp?.name ?? "",
        eventName: camp?.name ?? "",
        eventType: "camp",
        eventKey: String(r.campId),
        eventOpen: camp?.isRegistrationOpen ?? camp?.isActive ?? false,
        paymentStatus: r.paymentStatus ?? "unpaid",
      });
    }

    for (const r of nocowankaRegs) {
      const nocowanka = nocowankaMap.get(r.slug);
      rows.push({
        id: `nocowanka-${r._id}`,
        source: "nocowanka",
        registrationId: r._id,
        slug: r.slug,
        studentName: `${r.childName} ${r.childSurname}`.trim(),
        parentName: r.parentName,
        amount: nocowankaDueAmountPln(nocowanka),
        amountPaid: r.amountPaid ?? 0,
        date: r._creationTime,
        category: r.slug,
        eventName: nocowanka?.name ?? r.slug,
        eventType: "nocowanka",
        eventKey: r.slug,
        eventOpen: nocowanka?.isActive ?? false,
        paymentStatus: r.paymentStatus ?? "unpaid",
      });
    }

    rows.sort((a, b) => b.date - a.date);
    return rows;
  },
});

/**
 * Class payment rows with per-month billing status (from enrollment start → now).
 */
export const listClassPaymentRowsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const current = billingPeriodForDate(new Date(now));

    const allSubs = await ctx.db.query("subscriptions").collect();
    const subscriptions = allSubs.filter((s) =>
      isSeatHoldingStatus(s.status, s.paymentHoldExpiresAt, now)
    );
    const classIds = [...new Set(subscriptions.map((s) => s.classId))];
    const userIds = [...new Set(subscriptions.map((s) => s.userId))];
    const childIds = [
      ...new Set(
        subscriptions
          .map((s) => s.childId)
          .filter((id): id is Id<"children"> => id !== undefined)
      ),
    ];

    const [classes, users, children] = await Promise.all([
      Promise.all(classIds.map((id) => ctx.db.get("classes", id))),
      Promise.all(userIds.map((id) => ctx.db.get("users", id))),
      Promise.all(childIds.map((id) => ctx.db.get("children", id))),
    ]);

    const classMap = new Map(classes.filter(Boolean).map((c) => [c!._id, c!]));
    const userMap = new Map(users.filter(Boolean).map((u) => [u!._id, u!]));
    const childMap = new Map(children.filter(Boolean).map((c) => [c!._id, c!]));

    const slotCountByClassId = new Map<string, number>();
    for (const classId of classIds) {
      const slots = await ctx.db
        .query("timeSlots")
        .withIndex("by_class", (q) => q.eq("classId", classId))
        .collect();
      slotCountByClassId.set(String(classId), slots.length);
    }

    const rows = await Promise.all(
      subscriptions.map(async (s) => {
        const cls = classMap.get(s.classId);
        const fee = classMonthlyFeeGrosze(cls);
        const invoices = await listInvoicesForSubscription(ctx.db, s._id);
        const invoiceByPeriod = new Map(
          invoices.map((inv) => [`${inv.year}-${inv.month}`, inv])
        );
        const expected = expectedBillingMonthsForSubscription(s);
        const months = expected.map(({ year, month }) => {
          const inv = invoiceByPeriod.get(`${year}-${month}`);
          const paymentStatus =
            inv?.paymentStatus ??
            (s.status === "active" &&
            year === current.year &&
            month === current.month
              ? ("unpaid" as const)
              : ("unpaid" as const));
          const amountGrosze = inv?.amountGrosze ?? fee;
          const amountPaidGrosze =
            inv?.amountPaidGrosze ??
            (paymentStatus === "paid" ? amountGrosze : 0);
          return {
            year,
            month,
            label: formatPeriodLabelPl(year, month),
            invoiceId: inv?._id,
            paymentStatus,
            amount: amountGrosze / 100,
            amountPaid: amountPaidGrosze / 100,
            amountGrosze,
            amountPaidGrosze,
          };
        });

        const unpaidMonths = months.filter((m) => m.paymentStatus !== "paid");
        const paidMonths = months.filter((m) => m.paymentStatus === "paid");
        const currentMonth = months.find(
          (m) => m.year === current.year && m.month === current.month
        );
        const paymentStatus =
          unpaidMonths.length === 0
            ? ("paid" as const)
            : unpaidMonths.some((m) => m.paymentStatus === "partial")
              ? ("partial" as const)
              : ("unpaid" as const);
        const amountGrosze = months.reduce((sum, m) => sum + m.amountGrosze, 0);
        const amountPaidGrosze = months.reduce(
          (sum, m) => sum + m.amountPaidGrosze,
          0
        );
        const slotsForClass = slotCountByClassId.get(String(s.classId)) ?? 0;
        const sessionsPerWeek = slotsForClass > 0 ? slotsForClass : 1;
        const user = userMap.get(s.userId);
        const child = s.childId ? childMap.get(s.childId) : null;

        return {
          id: `class-${s._id}`,
          source: "class" as const,
          registrationId: s._id,
          subscriptionId: s._id,
          invoiceId: currentMonth?.invoiceId,
          userId: s.userId,
          childId: s.childId,
          classId: s.classId,
          studentName: child
            ? `${child.firstName} ${child.lastName}`.trim()
            : "Brak danych dziecka",
          parentName: user?.name ?? user?.email ?? "Brak danych opiekuna",
          parentEmail: user?.email ?? null,
          amount: amountGrosze / 100,
          amountPaid: amountPaidGrosze / 100,
          amountGrosze,
          amountPaidGrosze,
          date: s._creationTime,
          category: cls?.name ?? "Zajęcia",
          eventName: cls?.name ?? "Zajęcia",
          classType: cls?.discipline ?? "Inne",
          eventType: "class" as const,
          eventKey: String(s.classId),
          eventOpen: cls?.isActive ?? false,
          paymentStatus,
          sessionsPerWeek,
          periodYear: current.year,
          periodMonth: current.month,
          enrollmentStatus: s.status,
          months,
          paidMonthCount: paidMonths.length,
          unpaidMonthCount: unpaidMonths.length,
          missingMonthLabels: unpaidMonths.map((m) => m.label),
        };
      })
    );

    rows.sort((a, b) => {
      if (b.unpaidMonthCount !== a.unpaidMonthCount) {
        return b.unpaidMonthCount - a.unpaidMonthCount;
      }
      return b.date - a.date;
    });
    return rows;
  },
});

export const getUserContactForClassReminder = query({
  args: { userId: v.id("users") },
  returns: v.union(
    v.null(),
    v.object({
      email: v.union(v.string(), v.null()),
      name: v.union(v.string(), v.null()),
    })
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const u = await ctx.db.get("users", args.userId);
    if (!u) return null;
    return {
      email: u.email ?? null,
      name: u.name ?? null,
    };
  },
});

/**
 * Mark all unpaid months (or only the current month when marking unpaid)
 * for the given subscriptions.
 */
export const setClassSubscriptionsPaymentStatusForAdmin = mutation({
  args: {
    subscriptionIds: v.array(v.id("subscriptions")),
    markPaid: v.boolean(),
    amountPaidGrosze: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await assertClassesEnrollmentPaymentsEnabled(ctx);
    await expirePaymentHolds(ctx);
    const current = billingPeriodForDate();

    for (const id of args.subscriptionIds) {
      const sub = await ctx.db.get("subscriptions", id);
      if (!sub) continue;
      if (
        !isSeatHoldingStatus(sub.status, sub.paymentHoldExpiresAt, Date.now())
      ) {
        continue;
      }

      const cls = await ctx.db.get("classes", sub.classId);
      const fee = classMonthlyFeeGrosze(cls);
      await ensureInvoicesThroughCurrentMonth(ctx, {
        subscriptionId: id,
        startDate: sub.startDate,
        endDate: sub.endDate,
        status: sub.status,
        amountGrosze: fee,
      });

      const months = expectedBillingMonthsForSubscription(sub);
      const targets = args.markPaid
        ? months
        : months.filter(
            (m) => m.year === current.year && m.month === current.month
          );

      for (const { year, month } of targets) {
        const invoice = await findInvoiceForPeriod(ctx.db, id, year, month);
        if (!invoice) continue;
        if (args.markPaid) {
          if (invoice.paymentStatus === "paid") continue;
          const paid =
            args.amountPaidGrosze != null && args.amountPaidGrosze > 0
              ? Math.round(args.amountPaidGrosze)
              : invoice.amountGrosze;
          const status =
            paid >= invoice.amountGrosze
              ? ("paid" as const)
              : ("partial" as const);
          await ctx.db.patch(invoice._id, {
            paymentStatus: status,
            amountPaidGrosze: Math.min(paid, invoice.amountGrosze),
          });
          await recordPaymentLedger(ctx, {
            source: "class_invoice",
            sourceId: String(invoice._id),
            amountGrosze: Math.min(paid, invoice.amountGrosze),
            recordedBy: admin._id,
            method: "bank_transfer",
            provider: "manual",
            note: `Admin: ${formatPeriodLabelPl(year, month)} — opłacone`,
          });
        } else {
          await ctx.db.patch(invoice._id, {
            paymentStatus: "unpaid",
            amountPaidGrosze: 0,
          });
        }
      }

      if (args.markPaid) {
        await ctx.db.patch(id, {
          status: "active",
          paymentHoldExpiresAt: undefined,
        });
      }
    }
    return null;
  },
});

/**
 * Mark a specific billing month paid/unpaid for one class subscription.
 */
export const setClassMonthPaymentStatusForAdmin = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    year: v.number(),
    month: v.number(),
    markPaid: v.boolean(),
    amountPaidGrosze: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await assertClassesEnrollmentPaymentsEnabled(ctx);
    if (args.month < 1 || args.month > 12) {
      throw new Error("Nieprawidłowy miesiąc.");
    }
    const sub = await ctx.db.get("subscriptions", args.subscriptionId);
    if (!sub) throw new Error("Nie znaleziono zapisu.");

    const cls = await ctx.db.get("classes", sub.classId);
    const fee = classMonthlyFeeGrosze(cls);
    let invoice = await findInvoiceForPeriod(
      ctx.db,
      args.subscriptionId,
      args.year,
      args.month
    );
    if (!invoice) {
      const invoiceId = await ensureClassInvoiceForPeriod(ctx, {
        subscriptionId: args.subscriptionId,
        amountGrosze: fee,
        year: args.year,
        month: args.month,
      });
      invoice = await ctx.db.get("classInvoices", invoiceId);
    }
    if (!invoice) throw new Error("Nie udało się utworzyć faktury miesięcznej.");

    if (args.markPaid) {
      const paid =
        args.amountPaidGrosze != null && args.amountPaidGrosze > 0
          ? Math.round(args.amountPaidGrosze)
          : invoice.amountGrosze;
      const status =
        paid >= invoice.amountGrosze ? ("paid" as const) : ("partial" as const);
      await ctx.db.patch(invoice._id, {
        paymentStatus: status,
        amountPaidGrosze: Math.min(paid, invoice.amountGrosze),
      });
      await ctx.db.patch(args.subscriptionId, {
        status: "active",
        paymentHoldExpiresAt: undefined,
      });
      await recordPaymentLedger(ctx, {
        source: "class_invoice",
        sourceId: String(invoice._id),
        amountGrosze: Math.min(paid, invoice.amountGrosze),
        recordedBy: admin._id,
        method: "bank_transfer",
        provider: "manual",
        note: `Admin: ${formatPeriodLabelPl(args.year, args.month)} — ${status === "paid" ? "opłacone" : "częściowo"}`,
      });
    } else {
      await ctx.db.patch(invoice._id, {
        paymentStatus: "unpaid",
        amountPaidGrosze: 0,
      });
    }
    return null;
  },
});

/**
 * Parent: camp + nocowanka payment rows (amounts in PLN, same as admin).
 */
export const listMyEventPayments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const user = await ctx.db.get("users", userId);
    const email = user?.email ?? null;

    const campByUser = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const campByEmail = email
      ? await ctx.db
          .query("registrations")
          .withIndex("by_parent_email", (q) => q.eq("parentEmail", email))
          .collect()
      : [];
    const campSeen = new Set(campByUser.map((r) => r._id));
    const campCombined = [...campByUser];
    for (const r of campByEmail) {
      if (!campSeen.has(r._id)) {
        campSeen.add(r._id);
        campCombined.push(r);
      }
    }
    const campBest = new Map<string, (typeof campCombined)[number]>();
    for (const r of campCombined) {
      const key = `${r.campId}|${r.childName.trim().toLowerCase()}|${r.childSurname.trim().toLowerCase()}`;
      const prev = campBest.get(key);
      if (!prev || r._creationTime > prev._creationTime) campBest.set(key, r);
    }
    const campRegs = [...campBest.values()];

    const nocByUser = await ctx.db
      .query("nocowankaRegistrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const nocByEmail = email
      ? await ctx.db
          .query("nocowankaRegistrations")
          .withIndex("by_parent_email", (q) => q.eq("parentEmail", email))
          .collect()
      : [];
    const nocSeen = new Set(nocByUser.map((r) => r._id));
    const nocCombined = [...nocByUser];
    for (const r of nocByEmail) {
      if (!nocSeen.has(r._id)) {
        nocSeen.add(r._id);
        nocCombined.push(r);
      }
    }
    const nocBest = new Map<string, (typeof nocCombined)[number]>();
    for (const r of nocCombined) {
      const key = `${r.slug.trim().toLowerCase()}|${r.childName.trim().toLowerCase()}|${r.childSurname.trim().toLowerCase()}`;
      const prev = nocBest.get(key);
      if (!prev || r._creationTime > prev._creationTime) nocBest.set(key, r);
    }
    const nocRegs = [...nocBest.values()];

    const campIds = [...new Set(campRegs.map((r) => r.campId))];
    const camps = await Promise.all(
      campIds.map((id) => ctx.db.get("camps", id))
    );
    const campMap = new Map(
      camps.filter(Boolean).map((c) => [c!._id, c!] as const)
    );

    const nocowanki = await ctx.db.query("nocowanki").collect();
    const nocowankaMap = new Map(nocowanki.map((n) => [n.slug, n]));

    type Row = {
      id: string;
      source: "camp" | "nocowanka";
      eventName: string;
      childName: string;
      href: string;
      paymentStatus: "paid" | "partial" | "unpaid";
      amountPln: number;
      amountPaidPln: number;
      duePln: number;
      date: number;
    };

    const rows: Row[] = [];

    for (const r of campRegs) {
      const camp = campMap.get(r.campId);
      const amountPln = campDueAmountPln(camp);
      const amountPaidPln = r.amountPaid ?? 0;
      const paymentStatus = r.paymentStatus ?? "unpaid";
      const duePln =
        paymentStatus === "paid"
          ? 0
          : Math.max(0, amountPln - amountPaidPln);
      const slug = camp?.slug?.trim();
      rows.push({
        id: `camp-${r._id}`,
        source: "camp",
        eventName: camp?.name ?? "Obóz",
        childName: `${r.childName} ${r.childSurname}`.trim(),
        href: slug ? `/obozy/${encodeURIComponent(slug)}` : "/obozy",
        paymentStatus,
        amountPln,
        amountPaidPln,
        duePln,
        date: r._creationTime,
      });
    }

    for (const r of nocRegs) {
      const nocowanka = nocowankaMap.get(r.slug);
      const amountPln = nocowankaDueAmountPln(nocowanka);
      const amountPaidPln = r.amountPaid ?? 0;
      const paymentStatus = r.paymentStatus ?? "unpaid";
      const duePln =
        paymentStatus === "paid"
          ? 0
          : Math.max(0, amountPln - amountPaidPln);
      rows.push({
        id: `nocowanka-${r._id}`,
        source: "nocowanka",
        eventName: nocowanka?.name ?? r.slug,
        childName: `${r.childName} ${r.childSurname}`.trim(),
        href: `/obozy/nocowanki/${encodeURIComponent(r.slug)}`,
        paymentStatus,
        amountPln,
        amountPaidPln,
        duePln,
        date: r._creationTime,
      });
    }

    rows.sort((a, b) => b.date - a.date);
    const dueRows = rows.filter((r) => r.duePln > 0);
    return {
      rows,
      dueRows,
      pendingCount: dueRows.length,
      pendingTotalPln: dueRows.reduce((sum, r) => sum + r.duePln, 0),
      paidCount: rows.filter((r) => r.paymentStatus === "paid").length,
    };
  },
});

/**
 * Parent: billing months for enrollments (active + past history).
 * Due months are only charged for seat-holding enrollments.
 */
export const listMyClassBilling = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    const now = Date.now();
    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const relevant = subs.filter(
      (s) =>
        isSeatHoldingStatus(s.status, s.paymentHoldExpiresAt, now) ||
        s.status === "cancelled" ||
        s.status === "ended"
    );

    const result = [];
    for (const s of relevant) {
      const cls = await ctx.db.get("classes", s.classId);
      const child = s.childId ? await ctx.db.get("children", s.childId) : null;
      const fee = classMonthlyFeeGrosze(cls);
      const invoices = await listInvoicesForSubscription(ctx.db, s._id);
      const invoiceByPeriod = new Map(
        invoices.map((inv) => [`${inv.year}-${inv.month}`, inv])
      );
      const seatHolding = isSeatHoldingStatus(
        s.status,
        s.paymentHoldExpiresAt,
        now
      );
      const months = expectedBillingMonthsForSubscription(s).map(
        ({ year, month }) => {
          const inv = invoiceByPeriod.get(`${year}-${month}`);
          const paymentStatus = inv?.paymentStatus ?? ("unpaid" as const);
          const amountGrosze = inv?.amountGrosze ?? fee;
          const amountPaidGrosze =
            inv?.amountPaidGrosze ??
            (paymentStatus === "paid" ? amountGrosze : 0);
          // Past enrollments: show history but do not keep charging due
          const dueGrosze = seatHolding
            ? Math.max(0, amountGrosze - amountPaidGrosze)
            : 0;
          return {
            year,
            month,
            label: formatPeriodLabelPl(year, month),
            paymentStatus,
            amountGrosze,
            amountPaidGrosze,
            dueGrosze,
            invoiceId: inv?._id,
          };
        }
      );
      const dueMonths = months.filter((m) => m.dueGrosze > 0);
      result.push({
        subscriptionId: s._id,
        classId: s.classId,
        className: cls?.name ?? "Zajęcia",
        discipline: cls?.discipline ?? "",
        childName: child
          ? `${child.firstName} ${child.lastName}`.trim()
          : "—",
        enrollmentStatus: s.status,
        months,
        dueMonths,
        dueTotalGrosze: dueMonths.reduce((sum, m) => sum + m.dueGrosze, 0),
      });
    }
    return result;
  },
});

/** Admin: materialize missing monthly invoices for all seat-holding enrollments. */
export const ensureClassInvoicesThroughCurrentMonth = mutation({
  args: {},
  returns: v.object({ subscriptionsProcessed: v.number(), invoicesCreated: v.number() }),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    await assertClassesEnrollmentPaymentsEnabled(ctx);
    return await ensureAllActiveSubscriptionInvoices(ctx);
  },
});

async function ensureAllActiveSubscriptionInvoices(ctx: MutationCtx) {
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
}

export const sendClassPaymentReminderEmail = action({
  args: {
    userId: v.id("users"),
    studentName: v.optional(v.string()),
  },
  returns: v.object({ ok: v.literal(true) }),
  handler: async (ctx, args) => {
    const me = await ctx.runQuery(api.authHelpers.getCurrentUser, {});
    if (!me || me.role !== "admin") {
      throw new Error("Brak uprawnień.");
    }
    const settings = await ctx.runQuery(api.siteSettings.get, {});
    if (!settings.classesRegistrationAndPaymentsEnabled) {
      throw new Error("Nie udało się wysłać przypomnienia.");
    }
    const contact = await ctx.runQuery(
      api.payments.getUserContactForClassReminder,
      { userId: args.userId }
    );
    const email = contact?.email?.trim();
    if (!email) {
      throw new Error("Brak adresu email opiekuna.");
    }

    const apiKey = process.env.BREVO_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("BREVO_API_KEY nie jest ustawiony w Convex.");
    }
    const senderEmail =
      process.env.CONTACT_EMAIL?.trim() || "kontakt@risuteam.pl";
    const senderName =
      process.env.BREVO_SENDER_NAME?.trim() || "Risu Team";
    const siteUrl =
      process.env.SITE_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      "";
    const baseUrl = siteUrl.replace(/\/$/, "");
    const dashboardHref = baseUrl ? `${baseUrl}/dashboard` : "#";

    const subject = "Przypomnienie: płatność za zajęcia Risu Team";
    const displayName = contact?.name?.trim() ?? "";
    const childLine = args.studentName?.trim()
      ? `<p>Dotyczy zapisów dziecka: <strong>${escapeHtml(args.studentName.trim())}</strong>.</p>`
      : "";
    const greeting = displayName
      ? `<p>Witaj ${escapeHtml(displayName)},</p>`
      : "<p>Witaj,</p>";

    const html = `${greeting}
<p>Przypominamy o uregulowaniu płatności za zajęcia w Risu Team.</p>
${childLine}
${baseUrl ? `<p>Status zapisów i płatności znajdziesz w <a href="${escapeHtml(dashboardHref)}">panelu rodzica</a>.</p>` : ""}
<p>W razie pytań odpowiedz na tę wiadomość lub skontaktuj się z nami przez stronę klubu.</p>
<p>Pozdrawiamy,<br/>${escapeHtml(senderName)}</p>`;

    const res = await fetch(BREVO_SMTP_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email, name: displayName || undefined }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Brevo: ${res.status} ${errBody.slice(0, 200)}`);
    }
    return { ok: true as const };
  },
});

/**
 * Set payment status on a camp or nocowanka registration. Admin only.
 * Appends a ledger row; clears amountPaid by setting 0 when unpaid.
 */
export const setRegistrationPaymentStatus = mutation({
  args: {
    source: v.union(v.literal("camp"), v.literal("nocowanka")),
    registrationId: v.union(
      v.id("registrations"),
      v.id("nocowankaRegistrations")
    ),
    paymentStatus: paymentStatusValidator,
    amountPaid: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    let duePln = 0;
    if (args.source === "camp") {
      const id = args.registrationId as Id<"registrations">;
      const doc = await ctx.db.get("registrations", id);
      if (!doc) throw new Error("Nie znaleziono rejestracji.");
      const camp = await ctx.db.get("camps", doc.campId);
      duePln = campDueAmountPln(camp);

      let amountPaid = 0;
      if (args.paymentStatus === "partial") {
        amountPaid = args.amountPaid ?? 0;
      } else if (args.paymentStatus === "paid") {
        amountPaid = duePln;
      }

      await ctx.db.patch(id, {
        paymentStatus: args.paymentStatus,
        amountPaid,
      });

      if (args.paymentStatus !== "unpaid" && amountPaid > 0) {
        await recordPaymentLedger(ctx, {
          source: "camp_registration",
          sourceId: String(id),
          amountGrosze: Math.round(amountPaid * 100),
          recordedBy: admin._id,
          method: "bank_transfer",
          provider: "manual",
          note: `Admin: ${args.paymentStatus}`,
        });
      }
      return;
    }

    const id = args.registrationId as Id<"nocowankaRegistrations">;
    const doc = await ctx.db.get("nocowankaRegistrations", id);
    if (!doc) throw new Error("Nie znaleziono rejestracji.");
    const nocowanka = await ctx.db
      .query("nocowanki")
      .withIndex("by_slug", (q) => q.eq("slug", doc.slug))
      .first();
    duePln = nocowankaDueAmountPln(nocowanka);

    let amountPaid = 0;
    if (args.paymentStatus === "partial") {
      amountPaid = args.amountPaid ?? 0;
    } else if (args.paymentStatus === "paid") {
      amountPaid = duePln;
    }

    await ctx.db.patch(id, {
      paymentStatus: args.paymentStatus,
      amountPaid,
    });

    if (args.paymentStatus !== "unpaid" && amountPaid > 0) {
      await recordPaymentLedger(ctx, {
        source: "nocowanka_registration",
        sourceId: String(id),
        amountGrosze: Math.round(amountPaid * 100),
        recordedBy: admin._id,
        method: "bank_transfer",
        provider: "manual",
        note: `Admin: ${args.paymentStatus}`,
      });
    }
  },
});

/**
 * One-shot migration: set monthlyFeeGrosze on classes, create current-month
 * invoices from legacy subscription statuses, set unpaid on regs missing status.
 *
 * No auth (same pattern as `seed:*`) so it works from the Convex dashboard
 * and CLI without a browser session:
 *   `npx convex run payments:migrateBillingModel`
 */
export const migrateBillingModel = mutation({
  args: {},
  returns: v.object({
    classesUpdated: v.number(),
    invoicesCreated: v.number(),
    registrationsPatched: v.number(),
  }),
  handler: async (ctx) => {
    let classesUpdated = 0;
    let invoicesCreated = 0;
    let registrationsPatched = 0;

    const classes = await ctx.db.query("classes").collect();
    for (const cls of classes) {
      if (cls.monthlyFeeGrosze == null || cls.monthlyFeeGrosze <= 0) {
        await ctx.db.patch(cls._id, {
          monthlyFeeGrosze: DEFAULT_MONTHLY_FEE_GROSZE,
        });
        classesUpdated += 1;
      }
    }

    const { year, month } = billingPeriodForDate();
    const subs = await ctx.db.query("subscriptions").collect();
    for (const sub of subs) {
      if (sub.status !== "active" && sub.status !== "pending_payment") continue;
      const existing = await findInvoiceForPeriod(ctx.db, sub._id, year, month);
      if (existing) continue;
      const cls = await ctx.db.get("classes", sub.classId);
      const fee = classMonthlyFeeGrosze(cls);
      const paid = sub.status === "active";
      await ensureClassInvoiceForPeriod(ctx, {
        subscriptionId: sub._id,
        amountGrosze: fee,
        paymentStatus: paid ? "paid" : "unpaid",
        amountPaidGrosze: paid ? fee : 0,
      });
      invoicesCreated += 1;
      if (sub.status === "pending_payment" && sub.paymentHoldExpiresAt == null) {
        await ctx.db.patch(sub._id, {
          paymentHoldExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
      }
    }

    const campRegs = await ctx.db.query("registrations").collect();
    for (const r of campRegs) {
      if (r.paymentStatus == null) {
        await ctx.db.patch(r._id, {
          paymentStatus: "unpaid",
          amountPaid: 0,
        });
        registrationsPatched += 1;
      }
    }
    const nocRegs = await ctx.db.query("nocowankaRegistrations").collect();
    for (const r of nocRegs) {
      if (r.paymentStatus == null) {
        await ctx.db.patch(r._id, {
          paymentStatus: "unpaid",
          amountPaid: 0,
        });
        registrationsPatched += 1;
      }
    }

    return { classesUpdated, invoicesCreated, registrationsPatched };
  },
});

/**
 * Internal: apply a PSP webhook payment to a class invoice or registration.
 * Idempotent when the same provider+externalId is reused.
 */
export const applyExternalPayment = internalMutation({
  args: {
    source: v.union(
      v.literal("class_invoice"),
      v.literal("camp_registration"),
      v.literal("nocowanka_registration")
    ),
    sourceId: v.string(),
    amountGrosze: v.number(),
    provider: v.union(v.literal("stripe"), v.literal("przelewy24")),
    externalId: v.string(),
    method: v.optional(
      v.union(v.literal("card"), v.literal("online"), v.literal("bank_transfer"))
    ),
  },
  returns: v.object({
    ok: v.boolean(),
    duplicate: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_external", (q) =>
        q.eq("provider", args.provider).eq("externalId", args.externalId)
      )
      .first();
    if (existing) {
      return { ok: true, duplicate: true };
    }

    await recordPaymentLedger(ctx, {
      source: args.source,
      sourceId: args.sourceId,
      amountGrosze: args.amountGrosze,
      method: args.method ?? "online",
      provider: args.provider,
      externalId: args.externalId,
      status: "recorded",
      note: `PSP webhook: ${args.provider}`,
    });

    if (args.source === "class_invoice") {
      const invoiceId = args.sourceId as Id<"classInvoices">;
      const invoice = await ctx.db.get("classInvoices", invoiceId);
      if (invoice) {
        const nextPaid = Math.min(
          invoice.amountGrosze,
          invoice.amountPaidGrosze + args.amountGrosze
        );
        const status =
          nextPaid >= invoice.amountGrosze
            ? ("paid" as const)
            : ("partial" as const);
        await ctx.db.patch(invoiceId, {
          amountPaidGrosze: nextPaid,
          paymentStatus: status,
        });
        if (status === "paid") {
          await ctx.db.patch(invoice.subscriptionId, {
            status: "active",
            paymentHoldExpiresAt: undefined,
          });
        }
      }
    } else if (args.source === "camp_registration") {
      const id = args.sourceId as Id<"registrations">;
      const doc = await ctx.db.get("registrations", id);
      if (doc) {
        const camp = await ctx.db.get("camps", doc.campId);
        const due = campDueAmountPln(camp);
        const paidPln = (doc.amountPaid ?? 0) + args.amountGrosze / 100;
        await ctx.db.patch(id, {
          amountPaid: paidPln,
          paymentStatus: paidPln >= due ? "paid" : "partial",
        });
      }
    } else {
      const id = args.sourceId as Id<"nocowankaRegistrations">;
      const doc = await ctx.db.get("nocowankaRegistrations", id);
      if (doc) {
        const nocowanka = await ctx.db
          .query("nocowanki")
          .withIndex("by_slug", (q) => q.eq("slug", doc.slug))
          .first();
        const due = nocowankaDueAmountPln(nocowanka);
        const paidPln = (doc.amountPaid ?? 0) + args.amountGrosze / 100;
        await ctx.db.patch(id, {
          amountPaid: paidPln,
          paymentStatus: paidPln >= due ? "paid" : "partial",
        });
      }
    }

    return { ok: true, duplicate: false };
  },
});

/** Public: typical monthly class fee for marketing (from active classes). */
export const getPublicMonthlyClassFee = query({
  args: {},
  returns: v.object({
    amountGrosze: v.number(),
    amountZl: v.number(),
  }),
  handler: async (ctx) => {
    const active = await ctx.db
      .query("classes")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    const fees = active
      .map((c) => c.monthlyFeeGrosze)
      .filter((f): f is number => f != null && f > 0);
    const amountGrosze =
      fees.length > 0
        ? Math.min(...fees)
        : DEFAULT_MONTHLY_FEE_GROSZE;
    return { amountGrosze, amountZl: amountGrosze / 100 };
  },
});
