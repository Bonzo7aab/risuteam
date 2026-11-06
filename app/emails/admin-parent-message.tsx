import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import * as React from "react";

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

const DEFAULT_BASE =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://risuteam.pl";

function formatPln(amount: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export type AdminParentMessageEmailProps = {
  mode: "reminder" | "payment" | "custom";
  parentName?: string;
  childName?: string;
  eventTitle: string;
  eventUrl?: string;
  customBody?: string;
  amountDuePln?: number;
  amountPaidPln?: number;
  amountMissingPln?: number;
  baseUrl?: string;
  previewText?: string;
};

export function AdminParentMessageEmail({
  mode,
  parentName,
  childName,
  eventTitle,
  eventUrl,
  customBody,
  amountDuePln = 0,
  amountPaidPln = 0,
  amountMissingPln,
  baseUrl = DEFAULT_BASE,
  previewText,
}: AdminParentMessageEmailProps) {
  const logoUrl = `${baseUrl.replace(/\/$/, "")}/logoWithBorder.png`;
  const first = parentName?.trim().split(/\s+/)[0] || "";
  const greeting = first ? `Witaj ${first},` : "Witaj,";
  const missing =
    amountMissingPln ?? Math.max(0, amountDuePln - amountPaidPln);

  const eyebrow =
    mode === "reminder"
      ? "Przypomnienie"
      : mode === "payment"
        ? "Płatność"
        : "Wiadomość";
  const title =
    mode === "reminder"
      ? "Przypomnienie o wydarzeniu"
      : mode === "payment"
        ? "Przypomnienie o płatności"
        : eventTitle || "Wiadomość od Risu Team";
  const preview =
    previewText ??
    (mode === "payment"
      ? `Płatność — ${eventTitle}`
      : mode === "reminder"
        ? `Przypomnienie — ${eventTitle}`
        : eventTitle);

  return (
    <Html lang="pl">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body
          className="mx-auto my-auto px-2 py-8 font-sans"
          style={{ backgroundColor: BRAND.soft }}
        >
          <Container
            className="mx-auto overflow-hidden rounded-2xl"
            style={{
              maxWidth: "600px",
              backgroundColor: BRAND.white,
              border: `1px solid ${BRAND.line}`,
            }}
          >
            <Section className="px-6 py-5" style={{ backgroundColor: BRAND.ink }}>
              <Img
                src={logoUrl}
                width="44"
                height="44"
                alt="Risu Team"
                className="rounded-full"
              />
              <Text
                className="m-0 mt-3 text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{ color: BRAND.orange }}
              >
                Risu Team · {eyebrow}
              </Text>
              <Heading
                className="m-0 mt-2 text-[22px] font-bold leading-tight"
                style={{ color: BRAND.white }}
              >
                {title}
              </Heading>
              <Text
                className="m-0 mt-2 text-[14px] leading-relaxed"
                style={{ color: "#d6d3d1" }}
              >
                {eventTitle}
              </Text>
            </Section>

            <Section className="px-6 pt-6 pb-2">
              <Text
                className="m-0 text-[15px] leading-relaxed"
                style={{ color: BRAND.muted }}
              >
                {greeting}
              </Text>
              {mode === "reminder" ? (
                <Text
                  className="m-0 mt-3 text-[15px] leading-relaxed"
                  style={{ color: BRAND.muted }}
                >
                  Przypominamy o nadchodzącym wydarzeniu{" "}
                  <strong style={{ color: BRAND.ink }}>{eventTitle}</strong>.
                  Jesteśmy do dyspozycji, jeśli potrzebujesz informacji przed
                  startem.
                </Text>
              ) : null}
              {mode === "payment" ? (
                <Text
                  className="m-0 mt-3 text-[15px] leading-relaxed"
                  style={{ color: BRAND.muted }}
                >
                  Przypominamy o uregulowaniu płatności za{" "}
                  <strong style={{ color: BRAND.ink }}>{eventTitle}</strong>.
                  Poniżej znajdziesz podsumowanie kwot.
                </Text>
              ) : null}
            </Section>

            {mode === "payment" ? (
              <Section className="px-6 py-3">
                <Section
                  className="rounded-xl px-4 py-4"
                  style={{
                    backgroundColor: BRAND.roseBg,
                    border: `1px solid ${BRAND.roseBorder}`,
                  }}
                >
                  <Text
                    className="m-0 text-[12px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: BRAND.roseText }}
                  >
                    Do zapłaty
                  </Text>
                  <Text
                    className="m-0 mt-1 text-[28px] font-extrabold"
                    style={{ color: BRAND.ink }}
                  >
                    {formatPln(missing)}
                  </Text>
                  <Text
                    className="m-0 mt-3 text-[13px]"
                    style={{ color: BRAND.muted }}
                  >
                    Kwota wydarzenia:{" "}
                    <strong style={{ color: BRAND.ink }}>
                      {formatPln(amountDuePln)}
                    </strong>
                    {" · "}
                    Opłacono:{" "}
                    <strong style={{ color: BRAND.ink }}>
                      {formatPln(amountPaidPln)}
                    </strong>
                  </Text>
                </Section>
              </Section>
            ) : null}

            {mode === "reminder" && childName?.trim() ? (
              <Section className="px-6 py-3">
                <Text
                  className="m-0 mb-2 text-[12px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: BRAND.orange }}
                >
                  Uczestnik
                </Text>
                <Section
                  className="rounded-xl px-4 py-3"
                  style={{ backgroundColor: BRAND.card }}
                >
                  <Text
                    className="m-0 text-[11px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: BRAND.muted }}
                  >
                    Imię i nazwisko
                  </Text>
                  <Text
                    className="m-0 mt-1 text-[15px]"
                    style={{ color: BRAND.ink }}
                  >
                    {childName}
                  </Text>
                  <Text
                    className="m-0 mt-3 text-[11px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: BRAND.muted }}
                  >
                    Wydarzenie
                  </Text>
                  <Text
                    className="m-0 mt-1 text-[15px]"
                    style={{ color: BRAND.ink }}
                  >
                    {eventTitle}
                  </Text>
                </Section>
              </Section>
            ) : null}

            {mode === "payment" && childName?.trim() ? (
              <Section className="px-6 pb-2">
                <Text
                  className="m-0 text-[13px]"
                  style={{ color: BRAND.muted }}
                >
                  Dotyczy rejestracji:{" "}
                  <strong style={{ color: BRAND.ink }}>{childName}</strong>
                </Text>
              </Section>
            ) : null}

            {mode === "custom" && customBody?.trim() ? (
              <Section className="px-6 py-3">
                <Section
                  className="rounded-xl px-4 py-4"
                  style={{ backgroundColor: BRAND.card }}
                >
                  <Text
                    className="m-0 whitespace-pre-wrap text-[15px] leading-relaxed"
                    style={{ color: BRAND.ink }}
                  >
                    {customBody}
                  </Text>
                </Section>
              </Section>
            ) : null}

            {eventUrl?.trim() ? (
              <Section className="px-6 pb-6 pt-2">
                <Button
                  href={eventUrl}
                  className="rounded-xl px-5 py-3 text-sm font-bold text-white"
                  style={{ backgroundColor: BRAND.orange }}
                >
                  Zobacz szczegóły wydarzenia →
                </Button>
              </Section>
            ) : (
              <Section className="pb-4" />
            )}

            <Hr className="mx-6" style={{ borderColor: BRAND.line }} />

            <Section className="px-6 pb-7 pt-5">
              <Text
                className="m-0 font-semibold"
                style={{ color: BRAND.ink }}
              >
                Pozdrawiamy,
              </Text>
              <Text className="m-0 mt-1 text-sm" style={{ color: BRAND.muted }}>
                Zespół Risu Team
              </Text>
              <Text
                className="m-0 mt-4 text-xs"
                style={{ color: BRAND.muted }}
              >
                W razie pytań odpowiedz na tę wiadomość.
              </Text>
              <Text
                className="m-0 mt-2 text-[11px]"
                style={{ color: "#a8a29e" }}
              >
                © {new Date().getFullYear()} Risu Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

AdminParentMessageEmail.PreviewProps = {
  mode: "payment",
  parentName: "Anna Kowalska",
  childName: "Jan Kowalski",
  eventTitle: "Obóz letni 2026",
  eventUrl: "https://risuteam.pl/obozy/letni",
  amountDuePln: 1200,
  amountPaidPln: 400,
  amountMissingPln: 800,
} as AdminParentMessageEmailProps;

export default AdminParentMessageEmail;
