import { NextRequest, NextResponse } from "next/server";
import { sendCampReminderSchema } from "@/lib/schemas/email";
import { parseBody } from "@/lib/validation";
import { sendBrevoEmail } from "@/lib/brevo";
import { renderEmailToHtml } from "@/lib/email-render";
import { GeneralInfoEmail } from "@/app/emails/general-info";
import React from "react";

function requireEmailApiKey(req: NextRequest): NextResponse | null {
  const secret = process.env.EMAIL_SEND_API_KEY?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Email send not configured (EMAIL_SEND_API_KEY missing)." },
      { status: 503 }
    );
  }
  const key = req.headers.get("x-email-api-key")?.trim() ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (key !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const authError = requireEmailApiKey(req);
  if (authError) return authError;

  const parsed = await parseBody(req, sendCampReminderSchema);
  if ("error" in parsed) return parsed.error;

  const {
    to,
    subject,
    title,
    introText,
    arrivalDetails,
    packingItems,
    ctaLabel,
    ctaUrl,
    heroImageUrl,
    heroOverlayText,
    tagline,
    footerGreeting,
    footerTeamName,
    baseUrl,
  } = parsed.data;

  try {
    const html = await renderEmailToHtml(
      React.createElement(GeneralInfoEmail, {
        title,
        introText,
        arrivalDetails,
        packingItems: packingItems ?? [],
        ctaLabel,
        ctaUrl: ctaUrl ?? "#",
        heroImageUrl,
        heroOverlayText,
        tagline,
        footerGreeting,
        footerTeamName,
        baseUrl,
      })
    );
    await sendBrevoEmail({
      to: { email: to },
      subject,
      htmlContent: html,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
