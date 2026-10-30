import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import * as React from "react";

export type EventRegistrationEmailProps = {
  /** Parent confirmation vs internal admin notice */
  variant?: "parent" | "admin";
  eventType?: "camp" | "nocowanka";
  eventName?: string;
  eventSlug?: string;
  childName: string;
  childSurname: string;
  childDob?: string;
  childPesel?: string;
  dietary?: string;
  allergies?: string;
  medicalNotes?: string;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  ctaUrl?: string;
  baseUrl?: string;
  previewText?: string;
};

const DEFAULT_BASE =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://risuteam.pl";

const BRAND = {
  orange: "#E98A00",
  ink: "#1c1917",
  muted: "#78716c",
  soft: "#f5f0eb",
  card: "#faf7f3",
  line: "#e7e0d8",
  white: "#ffffff",
} as const;

function dash(value?: string): string {
  const v = value?.trim();
  return v ? v : "—";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Section className="mb-0 py-2">
      <Text
        className="m-0 text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{ color: BRAND.muted }}
      >
        {label}
      </Text>
      <Text
        className="m-0 mt-1 text-[15px] leading-snug"
        style={{ color: BRAND.ink }}
      >
        {value}
      </Text>
    </Section>
  );
}

export function EventRegistrationEmail({
  variant = "parent",
  eventType = "camp",
  eventName,
  eventSlug,
  childName,
  childSurname,
  childDob,
  childPesel,
  dietary,
  allergies,
  medicalNotes,
  parentName,
  parentEmail,
  parentPhone,
  ctaUrl,
  baseUrl = DEFAULT_BASE,
  previewText,
}: EventRegistrationEmailProps) {
  const isCamp = eventType === "camp";
  const eventKindGenitive = isCamp ? "obóz" : "nocowankę";
  const resolvedName =
    eventName?.trim() ||
    (eventSlug?.trim() ? eventSlug.trim() : isCamp ? "Obóz" : "Nocowanka");
  const logoUrl = `${baseUrl}/logoWithBorder.png`;
  const detailsUrl =
    ctaUrl ??
    (eventSlug
      ? isCamp
        ? `${baseUrl}/obozy/${encodeURIComponent(eventSlug)}`
        : `${baseUrl}/obozy/nocowanki/${encodeURIComponent(eventSlug)}`
      : `${baseUrl}/obozy`);

  const childFull = `${childName} ${childSurname}`.trim();
  const isParent = variant === "parent";

  const title = isParent
    ? `Rejestracja potwierdzona`
    : `Nowa rejestracja — ${resolvedName}`;

  const intro = isParent
    ? `Dziękujemy, ${parentName.split(/\s+/)[0] || "Rodzicu"}! Otrzymaliśmy zgłoszenie ${childFull} na ${eventKindGenitive}${eventName ? ` „${resolvedName}”` : ""}. Wkrótce prześlemy szczegóły i dane do przelewu.`
    : `Nowe zgłoszenie na ${eventKindGenitive}: ${resolvedName}.`;

  const preview =
    previewText ??
    (isParent
      ? `Potwierdzenie rejestracji — ${resolvedName}`
      : `Nowa rejestracja: ${childFull} — ${resolvedName}`);

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
            {/* Header */}
            <Section
              className="px-6 py-5"
              style={{ backgroundColor: BRAND.ink }}
            >
              <Section>
                <Img
                  src={logoUrl}
                  width="44"
                  height="44"
                  alt="Risu Team"
                  className="rounded-full"
                />
              </Section>
              <Text
                className="m-0 mt-3 text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{ color: BRAND.orange }}
              >
                Risu Team
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
                {isCamp ? "Obóz" : "Nocowanka"}
                {eventName ? ` · ${resolvedName}` : ""}
              </Text>
            </Section>

            {/* Intro */}
            <Section className="px-6 pt-6 pb-2">
              <Text
                className="m-0 text-[15px] leading-relaxed"
                style={{ color: BRAND.muted }}
              >
                {intro}
              </Text>
            </Section>

            {/* Child */}
            <Section className="px-6 pt-4 pb-2">
              <Text
                className="m-0 mb-2 text-[12px] font-bold uppercase tracking-[0.14em]"
                style={{ color: BRAND.orange }}
              >
                Dane dziecka
              </Text>
              <Section
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: BRAND.card }}
              >
                <DetailRow label="Imię i nazwisko" value={childFull} />
                <DetailRow label="Data urodzenia" value={dash(childDob)} />
                {childPesel?.trim() ? (
                  <DetailRow label="PESEL" value={childPesel.trim()} />
                ) : null}
              </Section>
            </Section>

            {/* Health — only if any filled */}
            {(dietary?.trim() ||
              allergies?.trim() ||
              medicalNotes?.trim()) && (
              <Section className="px-6 pt-4 pb-2">
                <Text
                  className="m-0 mb-2 text-[12px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: BRAND.orange }}
                >
                  Zdrowie
                </Text>
                <Section
                  className="rounded-xl px-4 py-3"
                  style={{ backgroundColor: BRAND.card }}
                >
                  {dietary?.trim() ? (
                    <DetailRow label="Dieta / nietolerancje" value={dietary} />
                  ) : null}
                  {allergies?.trim() ? (
                    <DetailRow label="Alergie i leki" value={allergies} />
                  ) : null}
                  {medicalNotes?.trim() ? (
                    <DetailRow label="Uwagi medyczne" value={medicalNotes} />
                  ) : null}
                </Section>
              </Section>
            )}

            {/* Parent */}
            <Section className="px-6 pt-4 pb-2">
              <Text
                className="m-0 mb-2 text-[12px] font-bold uppercase tracking-[0.14em]"
                style={{ color: BRAND.orange }}
              >
                Opiekun
              </Text>
              <Section
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: BRAND.card }}
              >
                <DetailRow label="Imię i nazwisko" value={parentName} />
                <DetailRow label="Email" value={parentEmail} />
                <DetailRow label="Telefon" value={dash(parentPhone)} />
              </Section>
            </Section>

            {/* Next steps / CTA */}
            <Section className="px-6 pt-5 pb-2">
              {isParent ? (
                <>
                  <Text
                    className="m-0 text-[14px] leading-relaxed"
                    style={{ color: BRAND.muted }}
                  >
                    To potwierdzenie otrzymania zgłoszenia. Status płatności i
                    dalsze instrukcje prześlemy osobno.
                  </Text>
                  <Button
                    href={detailsUrl}
                    className="mt-4 rounded-xl px-5 py-3 text-[14px] font-bold no-underline"
                    style={{
                      backgroundColor: BRAND.orange,
                      color: BRAND.white,
                    }}
                  >
                    Zobacz szczegóły wydarzenia
                  </Button>
                </>
              ) : (
                <Text
                  className="m-0 text-[14px] leading-relaxed"
                  style={{ color: BRAND.muted }}
                >
                  Zgłoszenie pojawiło się w panelu administracyjnym. Skontaktuj
                  się z opiekunem, aby potwierdzić płatność.
                </Text>
              )}
            </Section>

            <Hr
              className="mx-6 my-6"
              style={{ borderColor: BRAND.line, borderTopWidth: "1px" }}
            />

            {/* Footer */}
            <Section className="px-6 pb-7">
              <Text
                className="m-0 text-[14px] font-medium"
                style={{ color: BRAND.ink }}
              >
                {isParent ? "Do zobaczenia!" : "Risu Team — powiadomienie systemowe"}
              </Text>
              <Text
                className="m-0 mt-1 text-[13px]"
                style={{ color: BRAND.muted }}
              >
                Zespół Risu Team
              </Text>
              <Text
                className="m-0 mt-4 text-[12px]"
                style={{ color: BRAND.muted }}
              >
                Pytania?{" "}
                <Link
                  href={`mailto:kontakt@risuteam.pl`}
                  style={{ color: BRAND.orange }}
                >
                  kontakt@risuteam.pl
                </Link>
                {" · "}
                <Link href={baseUrl} style={{ color: BRAND.orange }}>
                  risuteam.pl
                </Link>
              </Text>
              <Text
                className="m-0 mt-3 text-[11px]"
                style={{ color: "#a8a29e" }}
              >
                © {new Date().getFullYear()} Risu Team. Wszelkie prawa
                zastrzeżone.
              </Text>
            </Section>
          </Container>

          {!isParent ? (
            <Text
              className="mx-auto mt-4 text-center text-[11px]"
              style={{ color: "#a8a29e", maxWidth: "600px" }}
            >
              Powiadomienie wewnętrzne — nie odpowiadaj na tę wiadomość.
            </Text>
          ) : null}
        </Body>
      </Tailwind>
    </Html>
  );
}

EventRegistrationEmail.PreviewProps = {
  variant: "parent",
  eventType: "camp",
  eventName: "Obóz letni — Mazury",
  eventSlug: "oboz-letni-mazury",
  childName: "Anna",
  childSurname: "Kowalska",
  childDob: "2015-06-12",
  dietary: "Wegetariańska",
  allergies: "Orzechy",
  parentName: "Jan Kowalski",
  parentEmail: "jan.kowalski@example.com",
  parentPhone: "+48 600 000 000",
} as EventRegistrationEmailProps;

export default EventRegistrationEmail;
