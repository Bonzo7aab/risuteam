import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/validation";
import { sendBrevoEmail } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  try {
    const result = await parseBody(req, contactSchema);
    if ("error" in result) return result.error;

    const data = result.data;
    const name = [data.firstname, data.lastname].filter(Boolean).join(" ");

    await sendBrevoEmail({
      to: { email: process.env.CONTACT_EMAIL || "kontakt@risuteam.pl" },
      subject: data.subject || `Kontakt od ${name || "nieznajomy"}`,
      htmlContent: `
        <h2>Nowa wiadomość z formularza kontaktowego</h2>
        <p><strong>Imię i nazwisko:</strong> ${name || "—"}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Telefon:</strong> ${data.phone_number || "—"}</p>
        <hr />
        <p>${(data.message || "").replace(/\n/g, "<br />")}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
