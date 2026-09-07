import { NextRequest, NextResponse } from "next/server";
import { sendBrevoEmail } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { username, email, phone, message } = data;

  try {
    await sendBrevoEmail({
      to: { email: process.env.CONTACT_EMAIL || "kontakt@risuteam.pl" },
      subject: `Kontakt od ${username}`,
      htmlContent: `
        <h2>Nowa wiadomość z formularza kontaktowego Risu Team</h2>
        <p><strong>Imię i nazwisko:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <hr />
        <p>${message}</p>
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
