import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { requireAdmin } from "./authHelpers";
import { isActiveEnrollmentStatus } from "./subscriptionCounts";

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
 * For nocowanka, amount is 0 and category is slug — frontend uses getNocowankaPrice(slug) and getNocowankaDisplayName(slug).
 */
export const listPaymentRowsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const campRegs = await ctx.db.query("registrations").collect();
    const nocowankaRegs = await ctx.db.query("nocowankaRegistrations").collect();
    const nocowanki = await ctx.db.query("nocowanki").collect();
    const nocowankaMap = new Map(nocowanki.map((n) => [n.slug, n]));

    const campIds = [...new Set(campRegs.map((r) => r.campId))];
    const camps = await Promise.all(
      campIds.map((id) => ctx.db.get("camps", id))
    );
    const campMap = new Map(
      camps.filter(Boolean).map((c) => [c!._id, c!])
    );

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
        amount: camp?.price ?? 0,
        amountPaid: r.amountPaid,
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
        amount: 0,
        amountPaid: r.amountPaid,
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

export const listClassPaymentRowsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const allSubs = await ctx.db.query("subscriptions").collect();
    const subscriptions = allSubs.filter((s) =>
      isActiveEnrollmentStatus(s.status)
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

    const classIdSet = new Set(classIds);
    const timeSlots = await ctx.db.query("timeSlots").collect();
    const slotCountByClassId = new Map<string, number>();
    for (const slot of timeSlots) {
      if (!classIdSet.has(slot.classId)) continue;
      const key = String(slot.classId);
      slotCountByClassId.set(key, (slotCountByClassId.get(key) ?? 0) + 1);
    }

    const rows = subscriptions.map((s) => {
      const cls = classMap.get(s.classId);
      const slotsForClass = slotCountByClassId.get(String(s.classId)) ?? 0;
      const sessionsPerWeek = slotsForClass > 0 ? slotsForClass : 1;
      const user = userMap.get(s.userId);
      const child = s.childId ? childMap.get(s.childId) : null;
      const paymentStatus =
        s.status === "active"
          ? "paid"
          : s.status === "pending_payment"
            ? "unpaid"
            : "unpaid";

      return {
        id: `class-${s._id}`,
        source: "class" as const,
        registrationId: s._id,
        subscriptionId: s._id,
        userId: s.userId,
        childId: s.childId,
        classId: s.classId,
        studentName: child
          ? `${child.firstName} ${child.lastName}`.trim()
          : "Brak danych dziecka",
        parentName: user?.name ?? user?.email ?? "Brak danych opiekuna",
        parentEmail: user?.email ?? null,
        amount: 0,
        amountPaid: paymentStatus === "paid" ? 0 : undefined,
        date: s._creationTime,
        category: cls?.name ?? "Zajęcia",
        eventName: cls?.name ?? "Zajęcia",
        classType: cls?.discipline ?? "Inne",
        eventType: "class" as const,
        eventKey: String(s.classId),
        eventOpen: cls?.isActive ?? false,
        paymentStatus,
        sessionsPerWeek,
      };
    });

    rows.sort((a, b) => b.date - a.date);
    return rows;
  },
});

/**
 * Parent contact for class payment reminder (admin only).
 */
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
 * Mark class subscriptions as paid (active) or unpaid (pending_payment). Admin only.
 */
export const setClassSubscriptionsPaymentStatusForAdmin = mutation({
  args: {
    subscriptionIds: v.array(v.id("subscriptions")),
    markPaid: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const nextStatus = args.markPaid ? "active" : "pending_payment";
    for (const id of args.subscriptionIds) {
      const sub = await ctx.db.get("subscriptions", id);
      if (!sub) continue;
      if (!isActiveEnrollmentStatus(sub.status)) continue;
      await ctx.db.patch(id, { status: nextStatus });
    }
    return null;
  },
});

/**
 * Sends a class payment reminder email to the parent (Brevo). Admin only.
 */
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
    const contact = await ctx.runQuery(api.payments.getUserContactForClassReminder, {
      userId: args.userId,
    });
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
      throw new Error(
        `Brevo: ${res.status} ${errBody.slice(0, 200)}`
      );
    }
    return { ok: true as const };
  },
});

/**
 * Set payment status on a camp or nocowanka registration. Admin only.
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
    await requireAdmin(ctx);

    const patch: { paymentStatus: "paid" | "partial" | "unpaid"; amountPaid?: number } = {
      paymentStatus: args.paymentStatus,
    };
    if (args.paymentStatus === "partial" && args.amountPaid !== undefined) {
      patch.amountPaid = args.amountPaid;
    } else if (args.paymentStatus !== "partial") {
      patch.amountPaid = undefined;
    }

    if (args.source === "camp") {
      const id = args.registrationId as Id<"registrations">;
      const doc = await ctx.db.get("registrations", id);
      if (!doc) throw new Error("Nie znaleziono rejestracji.");
      await ctx.db.patch(id, patch);
      return;
    }

    const id = args.registrationId as Id<"nocowankaRegistrations">;
    const doc = await ctx.db.get("nocowankaRegistrations", id);
    if (!doc) throw new Error("Nie znaleziono rejestracji.");
    await ctx.db.patch(id, patch);
  },
});
