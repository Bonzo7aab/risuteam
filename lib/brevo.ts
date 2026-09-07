/**
 * Brevo (ex-Sendinblue) transactional email via REST API.
 * @see https://developers.brevo.com/docs/send-a-transactional-email
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export type BrevoSender = {
  name: string;
  email: string;
};

export type BrevoRecipient = {
  email: string;
  name?: string;
};

export type SendBrevoEmailParams = {
  to: BrevoRecipient | BrevoRecipient[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  sender?: BrevoSender;
};

function getDefaultSender(): BrevoSender {
  return {
    name: process.env.BREVO_SENDER_NAME || "Risu Team",
    email: process.env.CONTACT_EMAIL || "kontakt@risuteam.pl",
  };
}

/**
 * Send a transactional email via Brevo. Uses BREVO_API_KEY from env.
 * @throws Error if BREVO_API_KEY is missing or Brevo API returns non-2xx
 */
export async function sendBrevoEmail(params: SendBrevoEmailParams): Promise<{ messageId: string }> {
  const rawKey = process.env.BREVO_API_KEY;
  const apiKey = typeof rawKey === "string" ? rawKey.trim() : "";
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not set. Add it to .env.local and restart the dev server.");
  }

  const to = Array.isArray(params.to) ? params.to : [params.to];
  const sender = params.sender ?? getDefaultSender();

  const body: Record<string, unknown> = {
    sender: { name: sender.name, email: sender.email },
    to: to.map((r) => (r.name ? { email: r.email, name: r.name } : { email: r.email })),
    subject: params.subject,
  };

  if (params.htmlContent) body.htmlContent = params.htmlContent;
  if (params.textContent) body.textContent = params.textContent;
  if (!body.htmlContent && !body.textContent) {
    throw new Error("Either htmlContent or textContent is required");
  }

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    } as Record<string, string>,
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
    throw new Error(`Brevo error: ${res.status} ${errMessage}`);
  }

  const data = (await res.json()) as { messageId?: string };
  return { messageId: data.messageId ?? "" };
}
