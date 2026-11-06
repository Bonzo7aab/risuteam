/** Shared branded HTML for admin → parent emails (Convex-safe, no React). */

const BRAND = {
  orange: "#E98A00",
  ink: "#1c1917",
  muted: "#78716c",
  soft: "#f5f0eb",
  card: "#faf7f3",
  line: "#e7e0d8",
  white: "#ffffff",
  roseBg: "#fff1f2",
  roseBorder: "#fecdd3",
  roseText: "#9f1239",
} as const;

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatPln(amount: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export type ParentMessageHtmlArgs = {
  mode: "reminder" | "payment" | "custom";
  parentName?: string;
  childName?: string;
  eventTitle: string;
  eventUrl?: string;
  senderName: string;
  baseUrl?: string;
  /** Custom mode */
  customBody?: string;
  /** Payment mode */
  amountDuePln?: number;
  amountPaidPln?: number;
  amountMissingPln?: number;
};

function firstName(name?: string): string {
  const part = name?.trim().split(/\s+/)[0];
  return part || "";
}

export function buildParentMessageHtml(args: ParentMessageHtmlArgs): string {
  const baseUrl = (args.baseUrl || "https://risuteam.pl").replace(/\/$/, "");
  const logoUrl = `${baseUrl}/logoWithBorder.png`;
  const eventTitle = escapeHtml(args.eventTitle.trim() || "wydarzenie Risu Team");
  const parent = firstName(args.parentName);
  const greeting = parent
    ? `Witaj ${escapeHtml(parent)},`
    : "Witaj,";

  let eyebrow = "Wiadomość";
  let title = args.eventTitle.trim() || "Risu Team";
  let intro = "";
  let highlight = "";
  let bodyBlock = "";

  if (args.mode === "reminder") {
    eyebrow = "Przypomnienie";
    title = `Przypomnienie o wydarzeniu`;
    intro = `Przypominamy o nadchodzącym wydarzeniu <strong>${eventTitle}</strong>. Jesteśmy do dyspozycji, jeśli potrzebujesz jakichkolwiek informacji przed startem.`;
    if (args.childName?.trim()) {
      bodyBlock = `
        <tr><td style="padding:16px 24px 8px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.orange};">Uczestnik</p>
          <div style="background:${BRAND.card};border-radius:12px;padding:14px 16px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.muted};">Imię i nazwisko</p>
            <p style="margin:4px 0 0;font-size:15px;color:${BRAND.ink};">${escapeHtml(args.childName.trim())}</p>
            <p style="margin:12px 0 0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.muted};">Wydarzenie</p>
            <p style="margin:4px 0 0;font-size:15px;color:${BRAND.ink};">${eventTitle}</p>
          </div>
        </td></tr>`;
    }
  } else if (args.mode === "payment") {
    const due = args.amountDuePln ?? 0;
    const paid = args.amountPaidPln ?? 0;
    const missing = args.amountMissingPln ?? Math.max(0, due - paid);
    eyebrow = "Płatność";
    title = `Przypomnienie o płatności`;
    intro = `Przypominamy o uregulowaniu płatności za <strong>${eventTitle}</strong>. Poniżej znajdziesz podsumowanie kwot.`;
    highlight = `
      <tr><td style="padding:8px 24px 8px;">
        <div style="background:${BRAND.roseBg};border:1px solid ${BRAND.roseBorder};border-radius:12px;padding:16px;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.roseText};">Do zapłaty</p>
          <p style="margin:6px 0 0;font-size:28px;font-weight:800;color:${BRAND.ink};">${escapeHtml(formatPln(missing))}</p>
          <table role="presentation" width="100%" style="margin-top:12px;border-collapse:collapse;">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:${BRAND.muted};">Kwota wydarzenia</td>
              <td style="padding:4px 0;font-size:13px;color:${BRAND.ink};text-align:right;font-weight:600;">${escapeHtml(formatPln(due))}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:${BRAND.muted};">Opłacono</td>
              <td style="padding:4px 0;font-size:13px;color:${BRAND.ink};text-align:right;font-weight:600;">${escapeHtml(formatPln(paid))}</td>
            </tr>
          </table>
        </div>
      </td></tr>`;
    if (args.childName?.trim()) {
      bodyBlock = `
        <tr><td style="padding:8px 24px;">
          <p style="margin:0;font-size:13px;color:${BRAND.muted};">Dotyczy rejestracji: <strong style="color:${BRAND.ink};">${escapeHtml(args.childName.trim())}</strong></p>
        </td></tr>`;
    }
  } else {
    eyebrow = "Wiadomość";
    title = args.eventTitle.trim() || "Wiadomość od Risu Team";
    intro = "";
    const bodyHtml = escapeHtml((args.customBody || "").trim()).replace(
      /\n/g,
      "<br />",
    );
    bodyBlock = `
      <tr><td style="padding:8px 24px 16px;">
        <div style="background:${BRAND.card};border-radius:12px;padding:16px;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.ink};">${bodyHtml}</p>
        </div>
      </td></tr>`;
  }

  const cta =
    args.eventUrl?.trim() && args.mode !== "custom"
      ? `
      <tr><td style="padding:8px 24px 24px;">
        <a href="${escapeHtml(args.eventUrl.trim())}" style="display:inline-block;background:${BRAND.orange};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:12px;">
          Zobacz szczegóły wydarzenia →
        </a>
      </td></tr>`
      : args.eventUrl?.trim() && args.mode === "custom"
        ? `
      <tr><td style="padding:0 24px 24px;">
        <a href="${escapeHtml(args.eventUrl.trim())}" style="display:inline-block;background:${BRAND.orange};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:12px;">
          Otwórz stronę wydarzenia →
        </a>
      </td></tr>`
        : "";

  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${BRAND.soft};font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.soft};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${BRAND.white};border:1px solid ${BRAND.line};border-radius:16px;overflow:hidden;">
        <tr><td style="background:${BRAND.ink};padding:20px 24px;">
          <img src="${escapeHtml(logoUrl)}" width="44" height="44" alt="Risu Team" style="display:block;border-radius:999px;" />
          <p style="margin:12px 0 0;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.orange};">Risu Team · ${escapeHtml(eyebrow)}</p>
          <h1 style="margin:8px 0 0;font-size:22px;line-height:1.25;color:${BRAND.white};font-weight:800;">${escapeHtml(title)}</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#d6d3d1;">${eventTitle}</p>
        </td></tr>
        <tr><td style="padding:24px 24px 8px;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.muted};">${greeting}</p>
          ${intro ? `<p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:${BRAND.muted};">${intro}</p>` : ""}
        </td></tr>
        ${highlight}
        ${bodyBlock}
        ${cta}
        <tr><td style="padding:0 24px;">
          <hr style="border:none;border-top:1px solid ${BRAND.line};margin:8px 0 0;" />
        </td></tr>
        <tr><td style="padding:20px 24px 28px;">
          <p style="margin:0;font-size:14px;font-weight:600;color:${BRAND.ink};">Pozdrawiamy,</p>
          <p style="margin:4px 0 0;font-size:14px;color:${BRAND.muted};">${escapeHtml(args.senderName)}</p>
          <p style="margin:16px 0 0;font-size:12px;color:${BRAND.muted};">W razie pytań odpowiedz na tę wiadomość.</p>
          <p style="margin:8px 0 0;font-size:11px;color:#a8a29e;">© ${new Date().getFullYear()} Risu Team</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
