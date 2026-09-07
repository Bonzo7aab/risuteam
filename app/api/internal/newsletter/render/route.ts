import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { NewsletterEmail } from "@/app/emails/newsletter";
import { newsletterTemplateSchema } from "@/lib/schemas/email";
import { renderEmailToHtml } from "@/lib/email-render";
import { parseBody } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const secret = process.env.NEWSLETTER_RENDER_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "NEWSLETTER_RENDER_SECRET is not configured." },
      { status: 503 }
    );
  }
  const header = req.headers.get("x-newsletter-render-secret")?.trim();
  if (header !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = await parseBody(req, newsletterTemplateSchema);
  if ("error" in parsed) return parsed.error;

  const d = parsed.data;
  try {
    const html = await renderEmailToHtml(
      React.createElement(NewsletterEmail, {
        monthLabel: d.monthLabel,
        tagline: d.tagline,
        classes: d.classes ?? [],
        camps: d.camps ?? [],
        story: d.story,
        unsubscribeUrl: d.unsubscribeUrl ?? "#",
        baseUrl: d.baseUrl,
      })
    );
    return NextResponse.json({ html });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
