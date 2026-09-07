"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CampHero,
  CampProgramSection,
  CampPricePaymentSection,
  CampBringAndBaseSection,
  CampCoachesList,
  CampCtaBlock,
} from "@/components/obozy";
import { CampRegistrationClosedBanner } from "@/components/obozy/camp-registration-closed-banner";
import { BlurFade } from "@/components/ui/blur-fade";
import { ImageZoom } from "@/components/ui/image-zoom";

function getSlug(params: unknown): string {
  const p = params as { slug?: string | string[] } | null;
  if (!p?.slug) return "";
  const raw = Array.isArray(p.slug) ? p.slug[0] ?? "" : p.slug;
  try {
    return decodeURIComponent(String(raw)).trim();
  } catch {
    return String(raw).trim();
  }
}

function formatDates(startDate: number, endDate: number): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return `${start.toLocaleDateString("pl-PL", opts)} – ${end.toLocaleDateString("pl-PL", opts)}`;
}

const DEFAULT_WHAT_TO_BRING = [
  "Wygodne buty do wędrówek",
  "Kurtka przeciwdeszczowa",
  "Latarka (najlepiej czołówka)",
  "Mały plecak na wycieczki",
  "Dużo dobrego humoru!",
];

/** Build placeholder installments with deadlines (I/II/III Rata, Przy zapisie, Do 30 maja, etc.) */
function buildPlaceholderInstallments(priceTotal: number): { label: string; deadline?: string; amount: string }[] {
  const deposit = 500;
  const rest = Math.max(0, priceTotal - deposit);
  const second = Math.ceil(rest / 2);
  const third = rest - second;
  return [
    { label: "I Rata - Zadatek", deadline: "Przy zapisie", amount: `${deposit} PLN` },
    { label: "II Rata", deadline: "Do 30 maja", amount: `${second} PLN` },
    { label: "III Rata", deadline: "Do 15 czerwca", amount: `${third} PLN` },
  ];
}

export default function CampBySlugPage() {
  const params = useParams();
  const slug = getSlug(params);
  const camp = useQuery(
    api.camps.getCampBySlugOrId,
    slug ? { slugOrId: slug.trim() } : "skip"
  );
  const coaches = useQuery(api.coaches.listActive);

  if (camp === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900/30">
        <p className="text-stone-600 dark:text-stone-400">Ładowanie…</p>
      </div>
    );
  }

  if (!camp || !slug) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50 dark:bg-stone-900/30 px-4">
        <h1 className="text-xl font-bold text-stone-900 dark:text-white">
          Nie znaleziono obozu
        </h1>
        <Link
          href="/obozy"
          className="text-primary font-medium risu-underline"
        >
          Wróć do listy obozów
        </Link>
      </div>
    );
  }

  const datesStr = formatDates(camp.startDate, camp.endDate);
  const locationStr = camp.location?.name ?? camp.location?.city ?? "—";
  const priceNum = camp.price ?? 0;
  const priceStr = priceNum > 0 ? `${priceNum} PLN` : "—";
  const heroImage = camp.heroImageUrl ?? "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=1200";
  const isRegistrationClosed = camp.isRegistrationOpen === false;
  const detailHref = `/obozy/${camp.slug}`;
  const registrationHref = `${detailHref}/rejestracja`;

  const scheduleByDay = camp.scheduleByDay ?? [];
  const programDays = scheduleByDay.map((day) => ({
    dayLabel: day.dayLabel,
    slots: day.slots.map((slot) => ({
      time: slot.time,
      title: slot.activity,
      description: "",
    })),
  }));

  /** When coachIds is missing (legacy), show all active coaches. When [] or non-empty, respect the list. */
  const campCoachIds = camp.coachIds;
  const displayCoaches =
    !coaches?.length
      ? []
      : campCoachIds == null
        ? coaches
        : coaches.filter((c) => campCoachIds.includes(c._id));

  const year = new Date(camp.startDate).getFullYear();
  const badge =
    camp.category === "letni"
      ? `LATO ${year}`
      : camp.category === "zimowy"
        ? `ZIMA ${year}`
        : camp.category === "polkolonie"
          ? `PÓŁKOLONIE ${year}`
          : `OBÓZ ${year}`;
  const registered = camp.registrationCount ?? 0;
  const maxSeats = camp.maxParticipants;
  const seatsLeft =
    maxSeats != null ? Math.max(0, maxSeats - registered) : null;
  const badgeSecondary =
    seatsLeft != null && seatsLeft > 0 && seatsLeft < 10
      ? "OSTATNIE MIEJSCA"
      : undefined;

  const priceDescription =
    "Wszystko wliczone w cenę: transport, noclegi, wyżywienie, opieka i program.";
  const priceIncluded = camp.includedItems?.length
    ? [
        ...camp.includedItems,
        "Ubezpieczenie NNW w cenie",
      ].slice(0, 4)
    : ["Rabat rodzinny: -100 PLN na drugie dziecko", "Ubezpieczenie NNW w cenie"];
  const installments =
    priceNum >= 500
      ? buildPlaceholderInstallments(priceNum)
      : [
          { label: "I Rata - Zadatek", deadline: "Przy zapisie", amount: "500 PLN" },
          { label: "II Rata", deadline: "Do 30 maja", amount: "—" },
          { label: "III Rata", deadline: "Do 15 czerwca", amount: "—" },
        ];

  const galleryImages = (camp.galleryImageUrls ?? []).slice(0, 2);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900/30">
      <CampRegistrationClosedBanner slug={camp.slug} />

      <CampHero
        badge={badge}
        badgeSecondary={badgeSecondary}
        title={camp.name}
        image={heroImage}
        imageAlt={camp.name}
        backLink={{ href: "/obozy", label: "Wszystkie obozy i nocowanki" }}
        registrationHref={registrationHref}
        isRegistrationClosed={isRegistrationClosed}
        meta={[
          { icon: "calendar_today", text: datesStr },
          { icon: "location_on", text: locationStr },
          ...(camp.ageGroup ? [{ icon: "group", text: camp.ageGroup }] : []),
        ]}
      />

      {camp.description?.trim() ? (
        <section className="py-8 md:py-12 bg-white dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-700">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
              Opis
            </h2>
            <p className="text-stone-600 dark:text-stone-400 whitespace-pre-wrap leading-relaxed">
              {camp.description.trim()}
            </p>
          </div>
        </section>
      ) : null}

      {camp.generalAttractions && camp.generalAttractions.length > 0 ? (
        <section className="py-8 md:py-12 bg-white dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-700">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
              Atrakcje ogólne
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
              Wspólne atrakcje i aktywności dla całej grupy — oprócz programu dnia.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {camp.generalAttractions.map((item, i) => (
                <li
                  key={`${item}-${i}`}
                  className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 shadow-sm dark:border-stone-600 dark:bg-stone-800/50 dark:text-stone-200"
                >
                  <span
                    className="material-symbols-outlined shrink-0 text-xl text-primary"
                    aria-hidden
                  >
                    verified
                  </span>
                  <span className="text-sm font-medium leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {galleryImages.length > 0 ? (
        <section className="py-8 md:py-12 bg-stone-50 dark:bg-stone-900/30 border-t border-stone-200 dark:border-stone-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4 text-center">
              Galeria
            </h2>
            <div
              className={
                galleryImages.length === 1
                  ? "mx-auto max-w-2xl"
                  : "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5"
              }
            >
              {galleryImages.map((src, i) => {
                const alt = `${camp.name} – zdjęcie ${i + 1}`;
                return (
                  <BlurFade
                    key={`${src}-${i}`}
                    delay={0.08 + i * 0.06}
                    inView
                    inViewMargin="-40px"
                    blur="6px"
                    duration={0.45}
                  >
                    <ImageZoom src={src} alt={alt} title={camp.name}>
                      <button
                        type="button"
                        aria-label={`Powiększ: ${alt}`}
                        className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-200 text-left shadow-sm outline-none ring-offset-2 transition-shadow focus-visible:ring-2 focus-visible:ring-primary dark:border-stone-700 dark:bg-stone-800"
                      >
                        <Image
                          src={src}
                          alt={alt}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, 672px"
                          unoptimized={src.startsWith("data:")}
                        />
                        <span
                          className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/55 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden
                        >
                          <span className="material-symbols-outlined text-2xl text-white drop-shadow-md">
                            zoom_in
                          </span>
                        </span>
                      </button>
                    </ImageZoom>
                  </BlurFade>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {programDays.some((d) => d.slots.length > 0) && (
        <CampProgramSection days={programDays} pdfHref="#" />
      )}

      <CampPricePaymentSection
        priceDescription={priceDescription}
        price={priceStr}
        priceIncluded={priceIncluded}
        installments={installments}
        registrationHref={registrationHref}
        isRegistrationClosed={isRegistrationClosed}
      />

      <CampBringAndBaseSection
        whatToBringItems={
          camp.includedItems?.length ? camp.includedItems : DEFAULT_WHAT_TO_BRING
        }
        location={
          camp.location
            ? {
                name: camp.location.name,
                address: camp.location.address,
                city: camp.location.city,
                mapsUrl: camp.location.mapsUrl,
              }
            : null
        }
      />

      {displayCoaches.length > 0 && (
        <CampCoachesList
          title="Poznaj naszą kadrę"
          subtitle="Doświadczona kadra na obozie."
          coaches={displayCoaches.map((c) => ({
            id: c._id,
            name: c.name,
            photoUrl: c.photoUrl,
            imageAlt: c.name,
            disciplines: c.disciplines ?? [],
            bio: c.bio ?? undefined,
          }))}
        />
      )}

      <CampCtaBlock
        signUpHref={registrationHref}
        isRegistrationClosed={isRegistrationClosed}
        signUpLabel={isRegistrationClosed ? "Rejestracja zakończona" : "Zapisz się teraz"}
      />
    </div>
  );
}
