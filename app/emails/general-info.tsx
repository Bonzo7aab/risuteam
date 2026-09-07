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

export type ArrivalDetails = {
  date: string;
  checkIn: string;
  locationName: string;
  locationAddress?: string;
};

export type PackingItem = {
  title: string;
  description: string;
  icon?: string;
};

export type GeneralInfoEmailProps = {
  title?: string;
  introText?: string;
  arrivalDetails?: ArrivalDetails;
  packingItems?: PackingItem[];
  ctaLabel?: string;
  ctaUrl?: string;
  heroImageUrl?: string;
  heroOverlayText?: string;
  tagline?: string;
  footerGreeting?: string;
  footerTeamName?: string;
  baseUrl?: string;
  previewText?: string;
};

const DEFAULT_BASE = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://risuteam.pl";

export function GeneralInfoEmail({
  title = "Przypomnienie o obozie",
  introText = "Cieszymy się, że do nas dołączasz. Czeka na Was niezapomniana noc pod gwiazdami — gry, opowieści i nowi przyjaciele.",
  arrivalDetails,
  packingItems = [],
  ctaLabel = "Zobacz stronę obozu",
  ctaUrl = "#",
  heroImageUrl,
  heroOverlayText = "Gotowi na przygodę?",
  tagline = "Czeka Was przygoda!",
  footerGreeting = "Do zobaczenia!",
  footerTeamName = "Zespół Risu Team",
  baseUrl = DEFAULT_BASE,
  previewText = "Przypomnienie o obozie — Risu Team",
}: GeneralInfoEmailProps) {
  const logoUrl = `${baseUrl}/logoWithBorder.png`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto font-sans bg-[#f5f0eb] px-2 py-8">
          <Container className="mx-auto max-w-[600px] rounded-t-2xl bg-white shadow-sm">
            {/* Header */}
            <Section className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
              <Link href={baseUrl} className="flex items-center gap-2 no-underline">
                <Img src={logoUrl} width="40" height="40" alt="Risu Team" className="rounded-full" />
                <Text className="m-0 text-lg font-bold text-[#2d4a3e]">Risu Team</Text>
              </Link>
              <Text className="m-0 text-sm text-[#888]">{tagline}</Text>
            </Section>

            {/* Hero */}
            {(heroImageUrl || heroOverlayText) && (
              <Section className="relative px-6 pt-2 pb-4">
                <Section className="relative overflow-hidden rounded-xl">
                  {heroImageUrl && (
                    <Img src={heroImageUrl} alt="" width="568" height="240" className="w-full object-cover" />
                  )}
                  {heroOverlayText && (
                    <Section
                      className={heroImageUrl ? "absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-4" : "bg-[#2d4a3e] px-4 py-6"}
                    >
                      <Heading className="m-0 text-xl font-bold text-white">{heroOverlayText}</Heading>
                    </Section>
                  )}
                </Section>
              </Section>
            )}

            {/* Main content */}
            <Section className="px-6 pt-2 pb-6">
              <Heading className="m-0 text-2xl font-bold text-[#333]">{title}</Heading>
              <Text className="mt-4 text-sm leading-relaxed text-[#666]">{introText}</Text>
            </Section>

            {/* Arrival Details */}
            {arrivalDetails && (
              <Section className="px-6 pb-6">
                <Section className="flex flex-row items-center gap-2">
                  <Text className="m-0 text-lg">📅</Text>
                  <Heading className="m-0 text-lg font-bold text-[#333]">Szczegóły przyjazdu</Heading>
                </Section>
                <Section className="mt-3 rounded-xl bg-[#f0ebe6] p-4">
                  <Text className="m-0 text-xs uppercase text-[#888]">Data</Text>
                  <Text className="mt-1 font-medium text-[#333]">{arrivalDetails.date}</Text>
                  <Text className="mt-3 text-xs uppercase text-[#888]">Zameldowanie</Text>
                  <Text className="mt-1 font-medium text-[#333]">{arrivalDetails.checkIn}</Text>
                  <Text className="mt-3 text-xs uppercase text-[#888]">Miejsce</Text>
                  <Text className="mt-1 font-medium text-[#333]">{arrivalDetails.locationName}</Text>
                  {arrivalDetails.locationAddress && (
                    <Text className="mt-1 text-sm text-[#666]">{arrivalDetails.locationAddress}</Text>
                  )}
                </Section>
              </Section>
            )}

            {/* Packing Checklist */}
            {packingItems.length > 0 && (
              <Section className="px-6 pb-6">
                <Section className="flex flex-row items-center gap-2">
                  <Text className="m-0 text-lg">🎒</Text>
                  <Heading className="m-0 text-lg font-bold text-[#333]">Co zabrać</Heading>
                </Section>
                <Section className="mt-3 space-y-3">
                  {packingItems.map((item, i) => (
                    <Section key={i} className="rounded-xl border border-[#eee] bg-[#fdf9f5] p-4">
                      <Text className="m-0 font-bold text-[#333]">{item.title}</Text>
                      <Text className="mt-1 text-sm text-[#666]">{item.description}</Text>
                    </Section>
                  ))}
                </Section>
              </Section>
            )}

            {/* CTA */}
            <Section className="px-6 pb-6">
              <Text className="m-0 text-sm text-[#666]">
                Masz pytania? Zobacz pełny harmonogram, menu i listę atrakcji na stronie obozu.
              </Text>
              <Button
                href={ctaUrl}
                className="mt-4 rounded-xl bg-[#E98A00] px-5 py-3 text-sm font-bold text-white"
              >
                {ctaLabel} →
              </Button>
            </Section>

            <Hr className="mx-6 border-[#eee]" />

            {/* Footer */}
            <Section className="px-6 pb-6">
              <Text className="m-0 font-medium text-[#333]">{footerGreeting}</Text>
              <Text className="mt-1 text-sm text-[#666]">{footerTeamName}</Text>
              <Text className="mt-4 text-xs text-[#888]">© {new Date().getFullYear()} Risu Team. Wszelkie prawa zastrzeżone.</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

GeneralInfoEmail.PreviewProps = {
  title: "Przypomnienie o nadchodzącym obozie!",
  introText: "Cieszymy się, że do nas dołączasz. Czeka na Was niezapomniana noc pod gwiazdami — gry, opowieści i nowi przyjaciele.",
  arrivalDetails: {
    date: "Piątek, 15 lipca 2024",
    checkIn: "16:00 – 17:00",
    locationName: "Baza Risu Team",
    locationAddress: "ul. Leśna 1, 00-000 Miejscowość",
  },
  packingItems: [
    { title: "Śpiwór i materac", description: "Śpiwór, poduszka i mata." },
    { title: "Ciepłe ubranie", description: "Wieczory bywają chłodne!" },
    { title: "Latarka", description: "Z zapasowymi bateriami." },
    { title: "Bidon", description: "Wielorazowy, napełniony wodą." },
  ],
  ctaLabel: "Zobacz stronę obozu",
  ctaUrl: "#",
  heroOverlayText: "Gotowi na przygodę?",
  tagline: "Czeka Was przygoda!",
  footerGreeting: "Do zobaczenia!",
  footerTeamName: "Zespół Risu Team",
} as GeneralInfoEmailProps;

export default GeneralInfoEmail;
