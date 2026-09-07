"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { EventRegistrationsView } from "@/app/admin/rejestracje/event-registrations-view";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  const szczegolyObozuCollapsible = (
    <Accordion type="single" collapsible className="border border-stone-200 dark:border-stone-700 rounded-lg bg-card overflow-hidden">
      <AccordionItem value="szczegoly-obozu" className="border-b-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/20">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-text-main dark:text-white">
              Szczegóły obozu
            </span>
            <div
              className="flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href={`/obozy/${encodeURIComponent(camp.slug)}`}
                className="text-sm text-primary risu-underline"
              >
                Zobacz stronę obozu →
              </Link>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-0">
          <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide">
                Nazwa
              </p>
              <p className="text-text-main dark:text-white">{camp.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide">
                Identyfikator URL
              </p>
              <p className="font-mono text-sm text-text-main dark:text-white">{camp.slug}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide">
                Kategoria
              </p>
              <p className="text-text-main dark:text-white">{categoryLabel}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide">
                Grupa wiekowa
              </p>
              <p className="text-text-main dark:text-white">{camp.ageGroup ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide">
                Termin
              </p>
              <p className="text-text-main dark:text-white">
                {formatCampDates(camp.startDate, camp.endDate)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide">
                Lokalizacja
              </p>
              <p className="text-text-main dark:text-white">
                {camp.location
                  ? `${camp.location.name}${camp.location.address ? `, ${camp.location.address}` : ""}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide">
                Cena (PLN)
              </p>
              <p className="text-text-main dark:text-white">
                {camp.price != null ? camp.price : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide">
                Maks. uczestników
              </p>
              <p className="text-text-main dark:text-white">
                {camp.maxParticipants ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide">
                Aktywny / Rejestracja
              </p>
              <p className="text-text-main dark:text-white">
                {camp.isActive ? "Tak" : "Nie"} /{" "}
                {camp.isRegistrationOpen !== false ? "Otwarta" : "Zamknięta"}
              </p>
            </div>
          </div>
          {camp.description?.trim() ? (
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide mb-1">
                Opis (fragment)
              </p>
              <p className="text-sm text-text-main dark:text-stone-300 line-clamp-3">
                {camp.description.trim()}
              </p>
            </div>
          ) : null}
          {(camp.heroImageUrl ?? "").trim() ? (
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide mb-2">
                Obraz
              </p>
              <div className="relative w-24 h-24 rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden bg-stone-100 dark:bg-stone-800">
                <Image
                  src={camp.heroImageUrl!}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized={camp.heroImageUrl!.startsWith("data:")}
                />
              </div>
            </div>
          ) : null}
          {camp.scheduleByDay && camp.scheduleByDay.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide mb-1">
                Program (dni)
              </p>
              <p className="text-sm text-text-main dark:text-stone-300">
                {camp.scheduleByDay.length} dni,{" "}
                {camp.scheduleByDay.reduce((acc, d) => acc + (d.slots?.length ?? 0), 0)} slotów
              </p>
            </div>
          ) : null}
          {camp.includedItems && camp.includedItems.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide mb-1">
                Co w cenie
              </p>
              <p className="text-sm text-text-main dark:text-stone-300">
                {camp.includedItems.join(", ")}
              </p>
            </div>
          ) : null}
          {camp.generalAttractions && camp.generalAttractions.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide mb-1">
                Atrakcje ogólne
              </p>
              <p className="text-sm text-text-main dark:text-stone-300">
                {camp.generalAttractions.join(", ")}
              </p>
            </div>
          ) : null}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
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
        slotAboveStats={szczegolyObozuCollapsible}
      />
    </div>
  );
}
