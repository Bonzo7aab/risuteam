import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import {
  buildParentMessageHtml,
} from "./parentMessageHtml";

const BREVO_SMTP_URL = "https://api.brevo.com/v3/smtp/email";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function requireAdminAction(ctx: {
  runQuery: (
    queryRef: typeof api.authHelpers.getCurrentUser,
    args: Record<string, never>,
  ) => Promise<{ role?: string } | null>;
}) {
  const me = await ctx.runQuery(api.authHelpers.getCurrentUser, {});
  if (!me || me.role !== "admin") {
    throw new Error("Brak uprawnień.");
  }
  return me;
}

function getBrevoConfig() {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("BREVO_API_KEY nie jest ustawiony w Convex.");
  }
  const senderEmail =
    process.env.CONTACT_EMAIL?.trim() || "kontakt@risuteam.pl";
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || "Risu Team";
  const siteUrl =
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "";
  return {
    apiKey,
    senderEmail,
    senderName,
    baseUrl: siteUrl.replace(/\/$/, "") || "https://risuteam.pl",
  };
}

async function sendViaBrevo(args: {
  apiKey: string;
  senderEmail: string;
  senderName: string;
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}) {
  const res = await fetch(BREVO_SMTP_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": args.apiKey,
    },
    body: JSON.stringify({
      sender: { name: args.senderName, email: args.senderEmail },
      to: [
        {
          email: args.to,
          name: args.toName || undefined,
        },
      ],
      subject: args.subject,
      htmlContent: args.htmlContent,
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Brevo: ${res.status} ${errBody.slice(0, 200)}`);
  }
}

const modeValidator = v.union(
  v.literal("reminder"),
  v.literal("payment"),
  v.literal("custom"),
);

const recipientValidator = v.object({
  to: v.string(),
  parentName: v.optional(v.string()),
  childName: v.optional(v.string()),
  amountDuePln: v.optional(v.number()),
  amountPaidPln: v.optional(v.number()),
  amountMissingPln: v.optional(v.number()),
});

export const sendParentMessage = action({
  args: {
    to: v.string(),
    parentName: v.optional(v.string()),
    childName: v.optional(v.string()),
    eventTitle: v.string(),
    eventUrl: v.optional(v.string()),
    mode: modeValidator,
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    amountDuePln: v.optional(v.number()),
    amountPaidPln: v.optional(v.number()),
    amountMissingPln: v.optional(v.number()),
  },
  returns: v.object({ ok: v.literal(true) }),
  handler: async (ctx, args) => {
    await requireAdminAction(ctx);

    const to = args.to.trim();
    if (!to || !isValidEmail(to)) {
      throw new Error("Brak prawidłowego adresu e-mail opiekuna.");
    }

    const { apiKey, senderEmail, senderName, baseUrl } = getBrevoConfig();
    const eventTitle = args.eventTitle.trim() || "wydarzenie Risu Team";

    let subject: string;
    if (args.mode === "reminder") {
      subject = `Przypomnienie: ${eventTitle}`;
    } else if (args.mode === "payment") {
      subject = `Przypomnienie o płatności: ${eventTitle}`;
      const missing =
        args.amountMissingPln ??
        Math.max(0, (args.amountDuePln ?? 0) - (args.amountPaidPln ?? 0));
      if (missing <= 0) {
        throw new Error("Brak kwoty do zapłaty dla tej rejestracji.");
      }
    } else {
      const customSubject = args.subject?.trim();
      const customBody = args.body?.trim();
      if (!customSubject) throw new Error("Podaj temat wiadomości.");
      if (!customBody) throw new Error("Podaj treść wiadomości.");
      subject = customSubject;
    }

    const htmlContent = buildParentMessageHtml({
      mode: args.mode,
      parentName: args.parentName,
      childName: args.childName,
      eventTitle,
      eventUrl: args.eventUrl,
      senderName,
      baseUrl,
      customBody: args.body,
      amountDuePln: args.amountDuePln,
      amountPaidPln: args.amountPaidPln,
      amountMissingPln: args.amountMissingPln,
    });

    await sendViaBrevo({
      apiKey,
      senderEmail,
      senderName,
      to,
      toName: args.parentName?.trim() || undefined,
      subject,
      htmlContent,
    });

    return { ok: true as const };
  },
});

export const sendParentRemindersBulk = action({
  args: {
    recipients: v.array(recipientValidator),
    eventTitle: v.string(),
    eventUrl: v.optional(v.string()),
    mode: v.optional(v.union(v.literal("reminder"), v.literal("payment"))),
  },
  returns: v.object({
    sent: v.number(),
    skipped: v.number(),
    failed: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireAdminAction(ctx);

    const { apiKey, senderEmail, senderName, baseUrl } = getBrevoConfig();
    const eventTitle = args.eventTitle.trim() || "wydarzenie Risu Team";
    const mode = args.mode ?? "reminder";
    const subject =
      mode === "payment"
        ? `Przypomnienie o płatności: ${eventTitle}`
        : `Przypomnienie: ${eventTitle}`;

    // Event reminders: one email per address. Payment: one per registration
    // (same parent may owe for more than one child).
    const seen = new Set<string>();
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const recipient of args.recipients) {
      const to = recipient.to.trim().toLowerCase();
      if (!to || !isValidEmail(to)) {
        skipped += 1;
        continue;
      }
      if (mode === "reminder") {
        if (seen.has(to)) {
          skipped += 1;
          continue;
        }
        seen.add(to);
      }

      if (mode === "payment") {
        const missing =
          recipient.amountMissingPln ??
          Math.max(
            0,
            (recipient.amountDuePln ?? 0) - (recipient.amountPaidPln ?? 0),
          );
        if (missing <= 0) {
          skipped += 1;
          continue;
        }
      }

      try {
        const htmlContent = buildParentMessageHtml({
          mode,
          parentName: recipient.parentName,
          childName: recipient.childName,
          eventTitle,
          eventUrl: args.eventUrl,
          senderName,
          baseUrl,
          amountDuePln: recipient.amountDuePln,
          amountPaidPln: recipient.amountPaidPln,
          amountMissingPln: recipient.amountMissingPln,
        });
        await sendViaBrevo({
          apiKey,
          senderEmail,
          senderName,
          to,
          toName: recipient.parentName?.trim() || undefined,
          subject,
          htmlContent,
        });
        sent += 1;
      } catch {
        failed += 1;
      }
    }

    return { sent, skipped, failed };
  },
});
