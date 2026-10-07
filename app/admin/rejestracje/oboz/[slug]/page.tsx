"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  EventFactsSheet,
  EventRegistrationsView,
} from "@/app/admin/rejestracje/event-registrations-view";

function getSlug(params: unknown): string {
  const p = params as { slug?: string | string[] } | null;
  if (!p?.slug) return "";
  return decodeURIComponent(
    Array.isArray(p.slug) ? p.slug[0] ?? "" : p.slug
  );
}

function formatCampDates(startDate: number, endDate: number): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return `${start.toLocaleDateString("pl-PL", opts)} – ${end.toLocaleDateString("pl-PL", opts)}`;
}

export default function AdminRejestracjeObozPage() {
  const params = useParams();
  const slug = getSlug(params);
  const camp = useQuery(
    api.camps.getCampBySlug,
    slug ? { slug } : "skip"
  );
  const campId = camp?._id;
  const registrations = useQuery(
    api.registrations.listRegistrationsByCamp,
    campId ? { campId } : "skip"
  );
  const formQuestions = useQuery(
    api.registrationFormQuestions.listByCamp,
    campId ? { campId } : "skip"
  );
  const setRegistrationOpen = useMutation(api.camps.setCampRegistrationOpen);
  const customQuestionLabels = formQuestions
    ? Object.fromEntries(formQuestions.map((q) => [q._id, q.label]))
    : undefined;

  if (camp === undefined || registrations === undefined) {
    return (
      <div className="text-text-light dark:text-stone-400">Ładowanie…</div>
    );
  }

  if (!camp || !slug) {
    return (
      <div className="text-text-main dark:text-white">
        Nie znaleziono obozu.
      </div>
    );
  }

  const paidCount =
    registrations.filter((r) => r.paymentStatus === "paid").length ?? 0;
  const pendingCount = registrations.filter(
    (r) => r.paymentStatus === "partial" || r.paymentStatus === "unpaid" || !r.paymentStatus
  ).length;
  const pendingPaymentsCount = pendingCount;
  const missingMedicalFormsCount = registrations.filter(
    (r) => r.medicalFormStatus !== "complete" && !r.medicalFormStatus
  ).length;

  const participants = registrations.map((r) => ({
    _id: r._id,
    childName: r.childName,
    childSurname: r.childSurname,
    childDob: r.childDob,
    paymentStatus: r.paymentStatus,
    medicalFormStatus: r.medicalFormStatus,
    consent: r.consent,
    parentEmail: r.parentEmail,
    parentName: r.parentName,
    parentPhone: r.parentPhone,
    dietary: r.dietary,
    allergies: r.allergies,
    medicalNotes: r.medicalNotes,
    customAnswers: r.customAnswers,
  }));

  const categoryLabel =
    camp.category === "letni"
      ? "Letni"
      : camp.category === "zimowy"
        ? "Zimowy"
        : camp.category === "polkolonie"
          ? "Półkolonie"
          : camp.category ?? "—";

  const facts = [
    {
      icon:
        camp.category === "zimowy"
          ? "ac_unit"
          : camp.category === "polkolonie"
            ? "diversity_3"
            : "sunny",
      label: "Kategoria",
      value: categoryLabel,
    },
    { icon: "cake", label: "Wiek", value: camp.ageGroup ?? "—" },
    { icon: "calendar_month", label: "Termin", value: formatCampDates(camp.startDate, camp.endDate) },
    {
      icon: "location_on",
      label: "Miejsce",
      value: camp.location
        ? `${camp.location.name}${camp.location.address ? `, ${camp.location.address}` : ""}`
        : "—",
    },
    { icon: "payments", label: "Cena", value: camp.price != null ? `${camp.price} PLN` : "—" },
    {
      icon: "groups",
      label: "Miejsca",
      value: camp.maxParticipants != null ? String(camp.maxParticipants) : "—",
    },
  ];

  return (
    <EventRegistrationsView
        eventTitle={camp.name}
        eventDescription={camp.description ?? undefined}
        hideEventDescriptionOnMobile
        campSlug={camp.slug}
        formQuestionsHref={`/admin/wydarzenia/oboz/${encodeURIComponent(camp.slug)}/pytania`}
        editCampHref={`/admin/wydarzenia/oboz/${encodeURIComponent(camp.slug)}/edit`}
        customQuestionLabels={customQuestionLabels}
        participants={participants}
        totalRegistered={registrations.length}
        maxParticipants={camp.maxParticipants ?? 999}
        paidCount={paidCount}
        pendingCount={pendingCount}
        isRegistrationOpen={camp.isRegistrationOpen !== false}
        onToggleRegistrationOpen={() =>
          setRegistrationOpen({
            campId: camp._id,
            isOpen: camp.isRegistrationOpen === false,
          })
        }
        pendingPaymentsCount={pendingPaymentsCount}
        missingMedicalFormsCount={missingMedicalFormsCount}
        slotAboveStats={
          <EventFactsSheet
            title="Szczegóły obozu"
            href={`/obozy/${encodeURIComponent(camp.slug)}`}
            hrefLabel="Strona obozu"
            facts={facts}
          />
        }
      />
  );
}
