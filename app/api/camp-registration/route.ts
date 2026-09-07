import { NextRequest, NextResponse } from "next/server";
import { campRegistrationApiSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/validation";
import { sendBrevoEmail } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  try {
    const result = await parseBody(req, campRegistrationApiSchema);
    if ("error" in result) return result.error;

    const data = result.data;
    const to = process.env.CONTACT_EMAIL || "kontakt@risuteam.pl";

    if (process.env.BREVO_API_KEY) {
      await sendBrevoEmail({
        to: { email: to },
        subject: `Rejestracja na obóz: ${data.childName} ${data.childSurname}`,
        htmlContent: `
          <h2>Nowa rejestracja na obóz (${data.campSlug?.trim() || "obóz"})</h2>
          <h3>Dane dziecka</h3>
          <p><strong>Imię i nazwisko:</strong> ${data.childName} ${data.childSurname}</p>
          <p><strong>Data urodzenia:</strong> ${data.childDob ?? "—"}</p>
          <p><strong>PESEL:</strong> ${data.childPesel ?? "—"}</p>
          <h3>Zdrowie</h3>
          <p><strong>Dieta:</strong> ${data.dietary ?? "—"}</p>
          <p><strong>Alergie:</strong> ${data.allergies ?? "—"}</p>
          <p><strong>Uwagi medyczne:</strong> ${data.medicalNotes ?? "—"}</p>
          <h3>Opiekun</h3>
          <p><strong>Imię i nazwisko:</strong> ${data.parentName}</p>
          <p><strong>Email:</strong> ${data.parentEmail}</p>
          <p><strong>Telefon:</strong> ${data.parentPhone ?? "—"}</p>
        `,
        sender: {
          name: "Risu Team Obozy",
          email: process.env.CONTACT_EMAIL || "kontakt@risuteam.pl",
        },
      });
    } else {
      console.warn("Missing BREVO_API_KEY – camp registration email not sent");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
