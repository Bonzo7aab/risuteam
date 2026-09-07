import {
  internalQuery,
  mutation,
  query,
  action,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdmin, requireAuthUserId } from "./authHelpers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NEWSLETTER_UNSUB_PLACEHOLDER =
  "https://__RSU_NEWSLETTER_UNSUB_PLACEHOLDER__/";

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function assertEmail(email: string): string {
  const n = normalizeEmail(email);
  if (!n || !EMAIL_RE.test(n)) {
    throw new Error("Podaj prawidłowy adres e-mail.");
  }
  return n;
}

function newUnsubscribeToken(): string {
  return crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
}

const newsletterClassV = v.object({
  title: v.string(),
  ageRange: v.string(),
  description: v.string(),
  enrollUrl: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
});

const newsletterCampV = v.object({
  dateLabel: v.string(),
  title: v.string(),
  description: v.string(),
  detailsUrl: v.optional(v.string()),
});

const newsletterStoryV = v.object({
  title: v.string(),
  quote: v.string(),
  author: v.string(),
  authorMeta: v.optional(v.string()),
  readMoreUrl: v.optional(v.string()),
});

export const subscribeByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const emailNormalized = assertEmail(email);
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("emailNormalized", emailNormalized))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { subscribed: true });
      return { ok: true as const };
    }
    await ctx.db.insert("newsletterSubscribers", {
      emailNormalized,
      unsubscribeToken: newUnsubscribeToken(),
      subscribed: true,
    });
    return { ok: true as const };
  },
});

export const unsubscribeByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const trimmed = token.trim();
    if (!trimmed) {
      throw new Error("Brak tokenu wypisania.");
    }
    const row = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_token", (q) => q.eq("unsubscribeToken", trimmed))
      .unique();
    if (!row) {
      throw new Error("Nieprawidłowy lub wygasły link wypisania.");
    }
    await ctx.db.patch(row._id, { subscribed: false });
    return { ok: true as const };
  },
});

export const setNewsletterForSelf = mutation({
  args: { subscribed: v.boolean() },
  handler: async (ctx, { subscribed }) => {
    const userId = await requireAuthUserId(ctx);
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Nie znaleziono użytkownika.");
    const emailRaw = user.email?.trim();
    if (!emailRaw) {
      throw new Error("Konto nie ma przypisanego adresu e-mail.");
    }
    const emailNormalized = assertEmail(emailRaw);
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("emailNormalized", emailNormalized))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { subscribed, userId });
      return { ok: true as const };
    }
    await ctx.db.insert("newsletterSubscribers", {
      emailNormalized,
      unsubscribeToken: newUnsubscribeToken(),
      subscribed,
      userId,
    });
    return { ok: true as const };
  },
});

export const getNewsletterStatusForSelf = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    const emailRaw = user.email?.trim();
    if (!emailRaw || !EMAIL_RE.test(normalizeEmail(emailRaw))) {
      return {
        hasEmail: false as const,
        hasRecord: false,
        subscribed: false,
      };
    }
    const emailNormalized = normalizeEmail(emailRaw);
    const row = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("emailNormalized", emailNormalized))
      .unique();
    if (!row) {
      return {
        hasEmail: true as const,
        hasRecord: false,
        subscribed: false,
      };
    }
    return {
      hasEmail: true as const,
      hasRecord: true,
      subscribed: row.subscribed,
    };
  },
});

export const listNewsletterSubscribers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("newsletterSubscribers").collect();
    return rows
      .map((r) => ({
        _id: r._id,
        _creationTime: r._creationTime,
        email: r.emailNormalized,
        subscribed: r.subscribed,
        userId: r.userId,
      }))
      .sort((a, b) => a.email.localeCompare(b.email));
  },
});

export const listActiveForSend = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_subscribed", (q) => q.eq("subscribed", true))
      .collect();
    return rows.map((r) => ({
      emailNormalized: r.emailNormalized,
      unsubscribeToken: r.unsubscribeToken,
    }));
  },
});

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function brevoSender(): { name: string; email: string } {
  const email =
    process.env.CONTACT_EMAIL?.trim() || "kontakt@risuteam.pl";
  const name = process.env.BREVO_SENDER_NAME?.trim() || "Risu Team";
  return { name, email };
}

export const sendNewsletterBroadcast = action({
  args: {
    subject: v.string(),
    monthLabel: v.optional(v.string()),
    tagline: v.optional(v.string()),
    classes: v.optional(v.array(newsletterClassV)),
    camps: v.optional(v.array(newsletterCampV)),
    story: v.optional(newsletterStoryV),
    baseUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const me = await ctx.runQuery(api.authHelpers.getCurrentUser, {});
    if (!me || me.role !== "admin") {
      throw new Error("Brak uprawnień.");
    }
    if (!args.subject.trim()) {
      throw new Error("Temat wiadomości nie może być pusty.");
    }

    const subscribers = await ctx.runQuery(
      internal.newsletter.listActiveForSend,
      {}
    );
    if (subscribers.length === 0) {
      return { sent: 0, failed: 0, errors: [] as string[] };
    }

    const siteUrl =
      process.env.SITE_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      "";
    if (!siteUrl) {
      throw new Error(
        "Brak SITE_URL lub NEXT_PUBLIC_APP_URL (Convex) — ustaw adres aplikacji."
      );
    }
    const baseUrl = args.baseUrl?.trim() || siteUrl.replace(/\/$/, "");

    const secret = process.env.NEWSLETTER_RENDER_SECRET?.trim();
    if (!secret) {
      throw new Error(
        "NEWSLETTER_RENDER_SECRET nie jest ustawiony w środowisku Convex."
      );
    }

    const renderUrl = `${siteUrl.replace(/\/$/, "")}/api/internal/newsletter/render`;
    const renderRes = await fetch(renderUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-newsletter-render-secret": secret,
      },
      body: JSON.stringify({
        monthLabel: args.monthLabel,
        tagline: args.tagline,
        classes: args.classes ?? [],
        camps: args.camps ?? [],
        story: args.story,
        baseUrl,
        unsubscribeUrl: NEWSLETTER_UNSUB_PLACEHOLDER,
      }),
    });
    if (!renderRes.ok) {
      const errText = await renderRes.text();
      throw new Error(
        `Render newslettera nie powiódł się: ${renderRes.status} ${errText.slice(0, 200)}`
      );
    }
    const rendered = (await renderRes.json()) as { html?: string };
    if (!rendered.html || typeof rendered.html !== "string") {
      throw new Error("Nieprawidłowa odpowiedź renderowania HTML.");
    }
    const templateHtml = rendered.html;

    const apiKey = process.env.BREVO_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("BREVO_API_KEY nie jest ustawiony w Convex.");
    }
    const sender = brevoSender();

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const sub of subscribers) {
      const unsubscribeUrl = `${baseUrl}/newsletter/wypisz?token=${encodeURIComponent(sub.unsubscribeToken)}`;
      const html = templateHtml.split(NEWSLETTER_UNSUB_PLACEHOLDER).join(
        unsubscribeUrl
      );
      try {
        const res = await fetch(BREVO_API_URL, {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "api-key": apiKey,
          },
          body: JSON.stringify({
            sender: { name: sender.name, email: sender.email },
            to: [{ email: sub.emailNormalized }],
            subject: args.subject.trim(),
            htmlContent: html,
          }),
        });
        if (!res.ok) {
          failed += 1;
          const errBody = await res.text();
          errors.push(`${sub.emailNormalized}: ${res.status} ${errBody.slice(0, 120)}`);
        } else {
          sent += 1;
        }
      } catch (e) {
        failed += 1;
        errors.push(
          `${sub.emailNormalized}: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    }

    return { sent, failed, errors };
  },
});
