import {
  Body,
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

export type NewsletterClass = {
  title: string;
  ageRange: string;
  description: string;
  enrollUrl?: string;
  imageUrl?: string;
};

export type NewsletterCamp = {
  dateLabel: string;
  title: string;
  description: string;
  detailsUrl?: string;
};

export type NewsletterStory = {
  title: string;
  quote: string;
  author: string;
  authorMeta?: string;
  readMoreUrl?: string;
};

export type NewsletterEmailProps = {
  monthLabel?: string;
  tagline?: string;
  classes?: NewsletterClass[];
  camps?: NewsletterCamp[];
  story?: NewsletterStory;
  unsubscribeUrl?: string;
  previewText?: string;
  baseUrl?: string;
  classesLink?: string;
  campsLink?: string;
  storiesLink?: string;
};

const DEFAULT_BASE = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://risuteam.pl";

export function NewsletterEmail({
  monthLabel = "STYCZEŃ 2025",
  tagline = "Rozpalając ciekawość i budując przyszłość — jedna przygoda na raz.",
  classes = [],
  camps = [],
  story,
  unsubscribeUrl = "#",
  previewText = "Newsletter Risu Team",
  baseUrl = DEFAULT_BASE,
  classesLink = "#",
  campsLink = "#",
  storiesLink = "#",
}: NewsletterEmailProps) {
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
                <Text className="m-0 text-lg font-bold text-[#333]">Risu Team</Text>
              </Link>
              <Section className="flex gap-4">
                <Link href={classesLink} className="text-sm font-medium text-[#333] no-underline">Zajęcia</Link>
                <Link href={campsLink} className="text-sm font-medium text-[#333] no-underline">Obozy</Link>
                <Link href={storiesLink} className="text-sm font-medium text-[#333] no-underline">Historie</Link>
              </Section>
            </Section>

            {/* Hero */}
            <Section className="px-6 pt-4 pb-6">
              <Section className="rounded-2xl bg-[#fdf9f5] p-6">
                <Text className="m-0 mb-2 inline-block rounded-lg bg-[#E98A00] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  {monthLabel}
                </Text>
                <Heading className="m-0 text-2xl font-bold text-[#333]">Newsletter miesięczny</Heading>
                <Text className="mt-2 text-sm leading-relaxed text-[#666]">{tagline}</Text>
              </Section>
            </Section>

            {/* New Classes */}
            {classes.length > 0 && (
              <Section className="px-6 pb-6">
                <Section className="mb-4 flex flex-row items-center justify-between">
                  <Heading className="m-0 text-xl font-bold text-[#333]">Nowe zajęcia</Heading>
                  <Link href={classesLink} className="text-sm font-medium text-[#E98A00] no-underline">Zobacz wszystkie →</Link>
                </Section>
                <Section className="grid grid-cols-2 gap-4">
                  {classes.slice(0, 2).map((c, i) => (
                    <Section key={i} className="overflow-hidden rounded-xl border border-[#eee] bg-white shadow-sm">
                      {c.imageUrl && (
                        <Img src={c.imageUrl} alt={c.title} width="280" height="140" className="w-full object-cover" />
                      )}
                      <Section className="p-4">
                        <Text className="m-0 text-base font-bold text-[#333]">{c.title}</Text>
                        <Text className="mt-1 text-xs text-[#E98A00]">{c.ageRange}</Text>
                        <Text className="mt-2 text-sm leading-snug text-[#666]">{c.description}</Text>
                        {c.enrollUrl && (
                          <Link
                            href={c.enrollUrl}
                            className="mt-3 inline-block rounded-lg bg-[#E98A00] px-4 py-2 text-sm font-bold text-white no-underline"
                          >
                            Zapisz się
                          </Link>
                        )}
                      </Section>
                    </Section>
                  ))}
                </Section>
              </Section>
            )}

            {/* Upcoming Camps */}
            {camps.length > 0 && (
              <Section className="px-6 pb-6">
                <Heading className="m-0 mb-4 text-xl font-bold text-[#333]">Nadchodzące obozy</Heading>
                <Section className="space-y-4">
                  {camps.map((camp, i) => (
                    <Section key={i} className="flex flex-row gap-4 rounded-xl border border-[#eee] bg-[#fdf9f5] p-4">
                      <Section className="w-14 shrink-0 rounded-lg bg-[#333] py-2 text-center">
                        <Text className="m-0 text-xs font-bold uppercase leading-tight text-white">{camp.dateLabel}</Text>
                      </Section>
                      <Section className="min-w-0 flex-1">
                        <Text className="m-0 font-bold text-[#333]">{camp.title}</Text>
                        <Text className="mt-1 text-sm text-[#666]">{camp.description}</Text>
                      </Section>
                      {camp.detailsUrl && (
                        <Link href={camp.detailsUrl} className="shrink-0 text-sm font-medium text-[#E98A00] no-underline">Szczegóły</Link>
                      )}
                    </Section>
                  ))}
                </Section>
              </Section>
            )}

            {/* Story of the Month */}
            {story && (
              <Section className="px-6 pb-6">
                <Section className="rounded-2xl bg-[#333] p-6 text-white">
                  <Text className="m-0 text-xs font-bold uppercase tracking-wide text-white/80">Historia miesiąca</Text>
                  <Heading className="mt-2 text-xl font-bold text-white">{story.title}</Heading>
                  <Text className="mt-3 text-sm leading-relaxed text-white/95">&quot;{story.quote}&quot;</Text>
                  <Text className="mt-3 text-sm text-white/80">
                    {story.author}{story.authorMeta ? `, ${story.authorMeta}` : ""}
                  </Text>
                  {story.readMoreUrl && (
                    <Link
                      href={story.readMoreUrl}
                      className="mt-4 inline-block rounded-lg bg-[#E98A00] px-4 py-2 text-sm font-bold text-white no-underline"
                    >
                      Czytaj całość →
                    </Link>
                  )}
                </Section>
              </Section>
            )}

            <Hr className="mx-6 border-[#eee]" />

            {/* Footer */}
            <Section className="px-6 pb-6">
              <Section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Section>
                  <Link href={baseUrl} className="flex items-center gap-2 no-underline">
                    <Img src={logoUrl} width="32" height="32" alt="" className="rounded-full" />
                    <Text className="m-0 font-bold text-[#333]">Risu Team</Text>
                  </Link>
                  <Text className="mt-2 text-sm leading-relaxed text-[#666]">
                    Wspieramy kolejne pokolenie twórców i odkrywców przez technologię i zabawę.
                  </Text>
                </Section>
                <Section>
                  <Text className="m-0 text-xs font-bold uppercase tracking-wide text-[#333]">Linki</Text>
                  <Link href={`${baseUrl}/rodzaje_zajec`} className="mt-2 block text-sm text-[#666] no-underline">Zajęcia</Link>
                  <Link href={`${baseUrl}/obozy`} className="mt-1 block text-sm text-[#666] no-underline">Obozy</Link>
                  <Link href={`${baseUrl}/kontakt`} className="mt-1 block text-sm text-[#666] no-underline">Kontakt</Link>
                </Section>
                <Section>
                  <Text className="m-0 text-xs font-bold uppercase tracking-wide text-[#333]">Dołącz</Text>
                  <Text className="mt-2 text-sm text-[#666]">© {new Date().getFullYear()} Risu Team. Wszelkie prawa zastrzeżone.</Text>
                </Section>
              </Section>
              <Text className="mt-6 text-center text-xs text-[#aaa]">
                Otrzymujesz ten newsletter, ponieważ zapisałeś się do listy Risu Team.{" "}
                <Link href={unsubscribeUrl} className="text-[#E98A00] underline">Wypisz się</Link>.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

NewsletterEmail.PreviewProps = {
  monthLabel: "STYCZEŃ 2025",
  tagline: "Rozpalając ciekawość i budując przyszłość — jedna przygoda na raz.",
  classes: [
    { title: "Kreatywne kodowanie", ageRange: "7–10 lat", description: "Nauka Pythona przez gry i projekty.", enrollUrl: "#" },
    { title: "Robotyka", ageRange: "5–8 lat", description: "Budowanie i programowanie robotów.", enrollUrl: "#" },
  ],
  camps: [
    { dateLabel: "LUT 15", title: "Obozy zimowe", description: "Warsztaty w górach.", detailsUrl: "#" },
    { dateLabel: "MAR 22", title: "Obozy wiosenne", description: "Przyroda i technologia.", detailsUrl: "#" },
  ],
  story: {
    title: "Pierwsza aplikacja Leosia",
    quote: "Nie myślałem, że uda mi się zrobić coś, z czego ludzie naprawdę korzystają — Risu Team pomógł mi wypuścić aplikację w 4 tygodnie!",
    author: "Leo M.",
    authorMeta: "uczeń od 2022",
    readMoreUrl: "#",
  },
  unsubscribeUrl: "#",
} as NewsletterEmailProps;

export default NewsletterEmail;
