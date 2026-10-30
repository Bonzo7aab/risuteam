import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { campRegistrationApiSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/validation";
import { sendBrevoEmail } from "@/lib/brevo";
import { renderEmailToHtml } from "@/lib/email-render";
import { EventRegistrationEmail } from "@/app/emails/event-registration";

export async function POST(req: NextRequest) {
  try {
    const result = await parseBody(req, campRegistrationApiSchema);
    if ("error" in result) return result.error;

    const data = result.data;
    const eventType =
      data.eventType ??
      (data.nocowankaSlug?.trim() ? "nocowanka" : "camp");
    const eventSlug =
      (eventType === "nocowanka"
        ? data.nocowankaSlug?.trim()
        : data.campSlug?.trim()) || undefined;
    const eventName = data.eventName?.trim() || undefined;
    const eventLabel =
      eventName ||
      eventSlug ||
      (eventType === "camp" ? "obóz" : "nocowanka");
    const contactTo = process.env.CONTACT_EMAIL || "kontakt@risuteam.pl";
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "https://risuteam.pl";

    if (!process.env.BREVO_API_KEY) {
      console.warn("Missing BREVO_API_KEY – registration emails not sent");
      return NextResponse.json({ ok: true });
    }

    const sharedProps = {
      eventType: eventType as "camp" | "nocowanka",
      eventName,
      eventSlug,
      childName: data.childName,
      childSurname: data.childSurname,
      childDob: data.childDob,
      childPesel: data.childPesel,
      dietary: data.dietary,
      allergies: data.allergies,
      medicalNotes: data.medicalNotes,
      parentName: data.parentName,
      parentEmail: data.parentEmail,
      parentPhone: data.parentPhone,
      baseUrl,
    };

    const parentHtml = await renderEmailToHtml(
      React.createElement(EventRegistrationEmail, {
        ...sharedProps,
        variant: "parent",
      })
    );

    const adminHtml = await renderEmailToHtml(
      React.createElement(EventRegistrationEmail, {
        ...sharedProps,
        variant: "admin",
      })
    );

    const sender = {
      name: "Risu Team",
      email: contactTo,
    };

    const childFull = `${data.childName} ${data.childSurname}`.trim();

    await Promise.all([
      sendBrevoEmail({
        to: { email: data.parentEmail, name: data.parentName },
        subject:
          eventType === "camp"
            ? `Potwierdzenie rejestracji na obóz — ${eventLabel}`
            : `Potwierdzenie rejestracji na nocowankę — ${eventLabel}`,
        htmlContent: parentHtml,
        sender,
      }),
      sendBrevoEmail({
        to: { email: contactTo },
        subject: `Nowa rejestracja: ${childFull} — ${eventLabel}`,
        htmlContent: adminHtml,
        sender,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
