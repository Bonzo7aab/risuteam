import type { EmailConfig } from "@auth/core/providers";
import { generateRandomString, RandomReader } from "@oslojs/crypto/random";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function getSender(): { name: string; email: string } {
  const fromEnv = process.env.CONTACT_EMAIL;
  const email = fromEnv || process.env.CONTACT_EMAIL || "kontakt@risuteam.pl";
  const name = process.env.BREVO_SENDER_NAME || "Risu Team";
  return { name, email };
}

export function BrevoPasswordReset(): EmailConfig {
  const rawKey = process.env.BREVO_API_KEY;
  const apiKey = typeof rawKey === "string" ? rawKey.trim() : undefined;
  return {
    id: "brevo-password-reset",
    type: "email",
    name: "Brevo",
    apiKey,
    from: "Risu Team <kontakt@risuteam.pl>",
    maxAge: 60 * 60, // 1 hour
    async generateVerificationToken() {
      const random: RandomReader = {
        read(bytes: Uint8Array) {
          crypto.getRandomValues(bytes);
        },
      };
      return generateRandomString(random, "0123456789", 8);
    },
    async sendVerificationRequest({ identifier: email, provider, token }) {
      const raw = provider.apiKey ?? process.env.BREVO_API_KEY;
      const key = typeof raw === "string" ? raw.trim() : "";
      if (!key) {
        throw new Error("BREVO_API_KEY is not set. Set it in Convex dashboard → Settings → Environment Variables.");
      }
      const sender = getSender();
      const body = {
        sender: { name: sender.name, email: sender.email },
        to: [{ email }],
        subject: "Reset hasła — Risu Team",
        textContent: `Twój kod do resetu hasła: ${token}. Kod jest ważny przez 1 godzinę.`,
      };
      const res = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": key,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errBody = await res.text();
        let errMessage: string;
        try {
          const parsed = JSON.parse(errBody);
          errMessage = parsed.message ?? parsed.code ?? errBody;
        } catch {
          errMessage = errBody || res.statusText;
        }
        throw new Error("Could not send password reset email: " + errMessage);
      }
    },
  };
}
