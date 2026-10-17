import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

/**
 * PSP webhook stub (Stripe / Przelewy24).
 *
 * Expected JSON body:
 * {
 *   "provider": "stripe" | "przelewy24",
 *   "externalId": "evt_…",
 *   "source": "class_invoice" | "camp_registration" | "nocowanka_registration",
 *   "sourceId": "<convex id>",
 *   "amountGrosze": 24000,
 *   "secret": "<PAYMENTS_WEBHOOK_SECRET>"
 * }
 *
 * Wire real provider signature verification before enabling in production.
 */
http.route({
  path: "/payments/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.PAYMENTS_WEBHOOK_SECRET?.trim();
    if (!secret) {
      return new Response(
        JSON.stringify({ error: "PAYMENTS_WEBHOOK_SECRET not configured" }),
        { status: 503, headers: { "content-type": "application/json" } }
      );
    }

    let body: {
      provider?: string;
      externalId?: string;
      source?: string;
      sourceId?: string;
      amountGrosze?: number;
      secret?: string;
      method?: string;
    };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    if (body.secret !== secret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    const provider = body.provider;
    const source = body.source;
    if (
      (provider !== "stripe" && provider !== "przelewy24") ||
      (source !== "class_invoice" &&
        source !== "camp_registration" &&
        source !== "nocowanka_registration") ||
      !body.externalId ||
      !body.sourceId ||
      typeof body.amountGrosze !== "number" ||
      body.amountGrosze <= 0
    ) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const method =
      body.method === "card" ||
      body.method === "online" ||
      body.method === "bank_transfer"
        ? body.method
        : "online";

    const result = await ctx.runMutation(internal.payments.applyExternalPayment, {
      provider,
      externalId: body.externalId,
      source,
      sourceId: body.sourceId,
      amountGrosze: Math.round(body.amountGrosze),
      method,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }),
});

export default http;
