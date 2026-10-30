"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { campRegistrationSchema } from "@/lib/schemas";
import { firstZodMessage } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { getNocowankaDisplayName } from "@/lib/nocowanki";
import { useMyEventEnrollment } from "@/hooks/use-my-event-enrollment";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DobPicker } from "@/components/ui/dob-picker";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  slug: string;
  backHref: string;
  backLabel?: string;
  successHref: string;
  successLabel?: string;
  /** "camp" = obóz (requires Convex camp by slug), "nocowanka" = nocowanka (slug only) */
  eventType?: "camp" | "nocowanka";
};

const fieldInputClassName =
  "h-12 rounded-xl border-stone-200 bg-white px-4 text-sm shadow-none transition-colors placeholder:text-stone-400 focus-visible:border-primary/40 focus-visible:ring-primary/20 dark:border-stone-700 dark:bg-stone-950/50 dark:placeholder:text-stone-500";

const textareaClassName =
  "flex min-h-[5.5rem] w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-none transition-colors placeholder:text-stone-400 focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-stone-700 dark:bg-stone-950/50 dark:placeholder:text-stone-500";

function FieldLabel({
  htmlFor,
  children,
  required,
  optional,
}: {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="mb-0 block text-sm font-semibold leading-5 tracking-normal text-stone-700 dark:text-stone-200"
    >
      {children}
      {required ? (
        <span className="ml-1 font-bold text-primary" aria-hidden>
          *
        </span>
      ) : null}
      {optional ? (
        <span className="ml-1.5 text-xs font-medium text-stone-400 dark:text-stone-500">
          opcjonalne
        </span>
      ) : null}
    </Label>
  );
}

function FieldGroup({
  htmlFor,
  label,
  required,
  optional,
  hint,
  children,
}: {
  htmlFor?: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-1">
        <FieldLabel htmlFor={htmlFor} required={required} optional={optional}>
          {label}
        </FieldLabel>
        {hint ? (
          <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
            {hint}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark sm:p-8">
      <div className="mb-6 space-y-1.5 border-b border-stone-100 pb-5 dark:border-stone-800">
        <h2 className="text-lg font-black tracking-tight text-text-main dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export function CampRegistrationForm({
  slug,
  backHref,
  backLabel = "Powrót",
  successHref,
  successLabel = "Powrót do zapisów",
  eventType = "camp",
}: Props) {
  const myChildren = useQuery(api.children.listMyChildren, {});

  const camps = useQuery(
    api.camps.getCamps,
    eventType === "camp" && slug ? { slug, activeOnly: false } : "skip"
  );
  const camp = camps?.[0];
  const campQuestions = useQuery(
    api.registrationFormQuestions.listByCampPublic,
    eventType === "camp" && camp?._id ? { campId: camp._id } : "skip"
  );
  const nocowankaQuestions = useQuery(
    api.registrationFormQuestions.listByNocowankaPublic,
    eventType === "nocowanka" && slug ? { slug } : "skip"
  );
  const customQuestions =
    eventType === "camp" ? campQuestions : nocowankaQuestions;

  const createCampRegistration = useMutation(
    api.registrations.createCampRegistration
  );
  const createNocowankaRegistration = useMutation(
    api.registrations.createNocowankaRegistration
  );
  const {
    ready: enrollmentReady,
    isEnrolledInCampSlug,
    isEnrolledInNocowanka,
  } = useMyEventEnrollment();
  const alreadyEnrolled =
    eventType === "camp"
      ? isEnrolledInCampSlug(slug)
      : isEnrolledInNocowanka(slug);

  const [selectedChildId, setSelectedChildId] = useState<Id<"children"> | null>(
    null
  );
  const [manualFirstName, setManualFirstName] = useState("");
  const [manualLastName, setManualLastName] = useState("");
  const [manualChildDob, setManualChildDob] = useState("");
  const [manualChildPesel, setManualChildPesel] = useState("");
  /** When profile child has no DOB stored */
  const [profileDobSupplement, setProfileDobSupplement] = useState("");

  const hasSavedChildren = (myChildren?.length ?? 0) > 0;

  const resolvedChildId = useMemo(() => {
    if (!myChildren?.length) return null;
    if (selectedChildId && myChildren.some((c) => c._id === selectedChildId)) {
      return selectedChildId;
    }
    return myChildren[0]._id;
  }, [myChildren, selectedChildId]);

  const selectedChild =
    hasSavedChildren && resolvedChildId
      ? myChildren!.find((c) => c._id === resolvedChildId)
      : undefined;

  useEffect(() => {
    setProfileDobSupplement("");
  }, [resolvedChildId]);

  const childNameValue =
    hasSavedChildren && selectedChild
      ? selectedChild.firstName.trim()
      : manualFirstName.trim();
  const childSurnameValue =
    hasSavedChildren && selectedChild
      ? selectedChild.lastName.trim()
      : manualLastName.trim();
  const childDobValue =
    hasSavedChildren && selectedChild
      ? (selectedChild.dateOfBirth?.trim() || profileDobSupplement).trim()
      : manualChildDob.trim();
  const childPeselValue =
    hasSavedChildren && selectedChild
      ? (selectedChild.pesel?.trim() ?? "")
      : manualChildPesel.trim();

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventNoun = eventType === "camp" ? "obóz" : "nocowankę";
  const termsLabel =
    eventType === "camp" ? "regulamin obozu" : "regulamin nocowanki";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData) as Record<string, string>;

    data.childName = childNameValue;
    data.childSurname = childSurnameValue;
    data.childDob = childDobValue;
    data.childPesel = childPeselValue;

    const payload = { ...data, campSlug: slug };
    const parsed = campRegistrationSchema.safeParse(payload);
    if (!parsed.success) {
      setError(firstZodMessage(parsed.error));
      return;
    }

    const valid = parsed.data;
    const customAnswers: Record<string, string> = {};
    if (customQuestions?.length) {
      for (const q of customQuestions) {
        const val = data[`custom_${q._id}`];
        if (q.type === "checkbox") {
          customAnswers[q._id] =
            val === "on" || val === "true" || val === "1" ? "true" : "false";
        } else {
          customAnswers[q._id] = typeof val === "string" ? val.trim() : "";
        }
      }
    }

    setSending(true);
    setError(null);

    try {
      if (eventType === "camp") {
        if (!camp?._id) {
          setError(
            "Nie znaleziono obozu. Odśwież stronę lub wróć do listy obozów."
          );
          setSending(false);
          return;
        }
        await createCampRegistration({
          campId: camp._id as Id<"camps">,
          childName: valid.childName,
          childSurname: valid.childSurname,
          childDob: valid.childDob || undefined,
          childPesel: valid.childPesel || undefined,
          dietary: valid.dietary || undefined,
          allergies: valid.allergies || undefined,
          medicalNotes: valid.medicalNotes || undefined,
          parentName: valid.parentName,
          parentPhone: valid.parentPhone || undefined,
          parentEmail: valid.parentEmail,
          customAnswers: Object.keys(customAnswers).length
            ? customAnswers
            : undefined,
        });
      } else {
        await createNocowankaRegistration({
          slug,
          childName: valid.childName,
          childSurname: valid.childSurname,
          childDob: valid.childDob || undefined,
          childPesel: valid.childPesel || undefined,
          dietary: valid.dietary || undefined,
          allergies: valid.allergies || undefined,
          medicalNotes: valid.medicalNotes || undefined,
          parentName: valid.parentName,
          parentPhone: valid.parentPhone || undefined,
          parentEmail: valid.parentEmail,
          customAnswers: Object.keys(customAnswers).length
            ? customAnswers
            : undefined,
        });
      }

      const res = await fetch("/api/camp-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          campSlug: eventType === "camp" ? slug : undefined,
          nocowankaSlug: eventType === "nocowanka" ? slug : undefined,
          eventType,
          eventName:
            eventType === "camp"
              ? camp?.name
              : getNocowankaDisplayName(slug),
          childName: valid.childName,
          childSurname: valid.childSurname,
          parentName: valid.parentName,
          parentEmail: valid.parentEmail,
          parentPhone: valid.parentPhone ?? "",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Błąd rejestracji");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się zapisać");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-stone-200/80 bg-white px-6 py-12 text-center shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark sm:px-10 sm:py-14">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
          <span className="material-symbols-outlined text-3xl" aria-hidden>
            check_circle
          </span>
        </span>
        <h2 className="mt-5 text-2xl font-black tracking-tight text-text-main dark:text-white">
          Rejestracja zakończona
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          Skontaktujemy się wkrótce ze szczegółami i danymi do przelewu. Sprawdź
          skrzynkę email.
        </p>
        <Link
          href={successHref}
          className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 font-bold text-primary-foreground hover:bg-primary-hover"
        >
          {successLabel}
        </Link>
      </div>
    );
  }

  if (myChildren === undefined || !enrollmentReady) {
    return (
      <div className="flex justify-center py-16">
        <Loader size="lg" />
      </div>
    );
  }

  if (alreadyEnrolled) {
    return (
      <div className="rounded-2xl border border-stone-200/80 bg-white px-6 py-12 text-center shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark sm:px-10 sm:py-14">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-3xl" aria-hidden>
            how_to_reg
          </span>
        </span>
        <h2 className="mt-5 text-2xl font-black tracking-tight text-text-main dark:text-white">
          Jesteś już zapisany
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          Masz aktywny zapis na {eventNoun}. Zarządzaj zgłoszeniem w panelu
          zapisów — stamtąd możesz też się wypisać.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard/zapisy"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 font-bold text-primary-foreground hover:bg-primary-hover"
          >
            Przejdź do zapisów
          </Link>
          <Link
            href={backHref}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-stone-200 px-6 font-semibold text-text-main hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  if (!hasSavedChildren) {
    return (
      <div className="rounded-2xl border border-stone-200/80 bg-white px-6 py-12 text-center shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark sm:px-10 sm:py-14">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-3xl" aria-hidden>
            child_care
          </span>
        </span>
        <h2 className="mt-5 text-2xl font-black tracking-tight text-text-main dark:text-white">
          Najpierw dodaj dziecko
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          Aby zapisać się na {eventNoun}, dodaj najpierw profil dziecka w panelu
          rodzica.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard/dzieci"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 font-bold text-primary-foreground hover:bg-primary-hover"
          >
            Dodaj dziecko
          </Link>
          <Link
            href={backHref}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-stone-200 px-6 font-semibold text-text-main hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <FormSection
          title="Dane dziecka"
          description="Wybierz profil dziecka, na które składasz zgłoszenie."
        >
          {hasSavedChildren ? (
            <>
              <FieldGroup htmlFor="camp-child-select" label="Dziecko" required>
                <Select
                  value={resolvedChildId ?? undefined}
                  onValueChange={(v) => setSelectedChildId(v as Id<"children">)}
                >
                  <SelectTrigger
                    id="camp-child-select"
                    className={cn(fieldInputClassName, "w-full")}
                  >
                    <SelectValue placeholder="Wybierz dziecko" />
                  </SelectTrigger>
                  <SelectContent>
                    {myChildren!.map((ch) => (
                      <SelectItem key={ch._id} value={ch._id}>
                        {ch.firstName} {ch.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>
              {selectedChild && !selectedChild.dateOfBirth?.trim() ? (
                <FieldGroup
                  htmlFor="childDobProfile"
                  label="Data urodzenia"
                  required
                  hint="Brak daty w profilu — uzupełnij przed wysłaniem zgłoszenia."
                >
                  <DobPicker
                    id="childDobProfile"
                    valueYmd={profileDobSupplement}
                    onChangeYmd={setProfileDobSupplement}
                    className={cn(
                      fieldInputClassName,
                      "font-normal hover:bg-white dark:hover:bg-stone-950/50"
                    )}
                  />
                </FieldGroup>
              ) : null}
            </>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <FieldGroup htmlFor="childNameManual" label="Imię" required>
                  <Input
                    id="childNameManual"
                    value={manualFirstName}
                    onChange={(e) => setManualFirstName(e.target.value)}
                    required
                    className={fieldInputClassName}
                    autoComplete="given-name"
                    placeholder="np. Anna"
                  />
                </FieldGroup>
                <FieldGroup
                  htmlFor="childSurnameManual"
                  label="Nazwisko"
                  required
                >
                  <Input
                    id="childSurnameManual"
                    value={manualLastName}
                    onChange={(e) => setManualLastName(e.target.value)}
                    required
                    className={fieldInputClassName}
                    autoComplete="family-name"
                    placeholder="np. Kowalska"
                  />
                </FieldGroup>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <FieldGroup
                  htmlFor="childDobManual"
                  label="Data urodzenia"
                  required
                >
                  <DobPicker
                    id="childDobManual"
                    valueYmd={manualChildDob}
                    onChangeYmd={setManualChildDob}
                    className={cn(
                      fieldInputClassName,
                      "font-normal hover:bg-white dark:hover:bg-stone-950/50"
                    )}
                  />
                </FieldGroup>
                <FieldGroup
                  htmlFor="childPeselManual"
                  label="PESEL"
                  optional
                >
                  <Input
                    id="childPeselManual"
                    value={manualChildPesel}
                    onChange={(e) => setManualChildPesel(e.target.value)}
                    className={fieldInputClassName}
                    placeholder="11 cyfr"
                    inputMode="numeric"
                  />
                </FieldGroup>
              </div>
            </>
          )}
        </FormSection>

        <FormSection
          title="Zdrowie"
          description="Informacje opcjonalne — pomagają zadbać o bezpieczeństwo dziecka."
        >
          <FieldGroup htmlFor="dietary" label="Dieta / nietolerancje" optional>
            <Input
              id="dietary"
              name="dietary"
              className={fieldInputClassName}
              placeholder="Np. wegetariańska, alergia na orzechy"
            />
          </FieldGroup>
          <FieldGroup htmlFor="allergies" label="Alergie i leki" optional>
            <textarea
              id="allergies"
              name="allergies"
              rows={3}
              className={textareaClassName}
              placeholder="Wymień alergie i przyjmowane leki"
            />
          </FieldGroup>
          <FieldGroup htmlFor="medicalNotes" label="Uwagi medyczne" optional>
            <textarea
              id="medicalNotes"
              name="medicalNotes"
              rows={2}
              className={textareaClassName}
            />
          </FieldGroup>
        </FormSection>

        {customQuestions?.length ? (
          <FormSection
            title="Dodatkowe informacje"
            description="Pytania dotyczące tego wydarzenia."
          >
            {customQuestions.map((q) => (
              <FieldGroup
                key={q._id}
                htmlFor={`custom_${q._id}`}
                label={q.label}
                required={q.required}
                optional={!q.required}
              >
                {q.type === "short_text" && (
                  <Input
                    id={`custom_${q._id}`}
                    name={`custom_${q._id}`}
                    className={fieldInputClassName}
                    required={q.required}
                  />
                )}
                {q.type === "long_text" && (
                  <textarea
                    id={`custom_${q._id}`}
                    name={`custom_${q._id}`}
                    rows={3}
                    className={textareaClassName}
                    required={q.required}
                  />
                )}
                {q.type === "checkbox" && (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200/80 bg-stone-50/60 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/30">
                    <input
                      type="checkbox"
                      id={`custom_${q._id}`}
                      name={`custom_${q._id}`}
                      className="size-4 rounded border-stone-300 text-primary focus:ring-primary/30"
                    />
                    <span className="text-sm font-medium text-text-main dark:text-stone-200">
                      Tak
                    </span>
                  </label>
                )}
                {q.type === "single_choice" && (
                  <select
                    id={`custom_${q._id}`}
                    name={`custom_${q._id}`}
                    className={cn(fieldInputClassName, "w-full")}
                    required={q.required}
                  >
                    {!q.required && <option value="">—</option>}
                    {(q.options ?? []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </FieldGroup>
            ))}
          </FormSection>
        ) : null}

        <FormSection
          title="Dane opiekuna i zgody"
          description="Dane kontaktowe oraz wymagane zgody do finalizacji rejestracji."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <FieldGroup
              htmlFor="parentName"
              label="Imię i nazwisko opiekuna"
              required
            >
              <Input
                id="parentName"
                name="parentName"
                required
                className={fieldInputClassName}
                autoComplete="name"
                placeholder="np. Jan Kowalski"
              />
            </FieldGroup>
            <FieldGroup htmlFor="parentPhone" label="Telefon" optional>
              <Input
                id="parentPhone"
                name="parentPhone"
                type="tel"
                className={fieldInputClassName}
                autoComplete="tel"
                placeholder="+48 …"
              />
            </FieldGroup>
          </div>
          <FieldGroup htmlFor="parentEmail" label="Email" required>
            <Input
              id="parentEmail"
              name="parentEmail"
              type="email"
              required
              className={fieldInputClassName}
              autoComplete="email"
              placeholder="jan@example.com"
            />
          </FieldGroup>

          <div className="space-y-3 border-t border-stone-100 pt-6 dark:border-stone-800">
            <p className="text-sm font-bold text-text-main dark:text-white">
              Zgody
            </p>
            <label className="flex cursor-pointer items-start gap-3.5 rounded-xl border border-stone-200/80 bg-stone-50/60 px-4 py-4 dark:border-stone-800 dark:bg-stone-950/30">
              <input
                type="checkbox"
                name="medicalConsent"
                required
                className="mt-0.5 size-4 shrink-0 rounded border-stone-300 text-primary focus:ring-primary/30"
              />
              <span className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                <span className="font-semibold text-text-main dark:text-white">
                  Zgoda medyczna{" "}
                  <span className="text-primary" aria-hidden>
                    *
                  </span>
                </span>
                <span className="mt-1 block text-stone-500 dark:text-stone-400">
                  Wyrażam zgodę na udzielenie dziecku pierwszej pomocy i/lub
                  zabiegów medycznych w razie konieczności.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3.5 rounded-xl border border-stone-200/80 bg-stone-50/60 px-4 py-4 dark:border-stone-800 dark:bg-stone-950/30">
              <input
                type="checkbox"
                name="photoConsent"
                value="1"
                className="mt-0.5 size-4 shrink-0 rounded border-stone-300 text-primary focus:ring-primary/30"
              />
              <span className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                <span className="font-semibold text-text-main dark:text-white">
                  Zgoda na zdjęcia{" "}
                  <span className="text-xs font-medium text-stone-400">
                    opcjonalne
                  </span>
                </span>
                <span className="mt-1 block text-stone-500 dark:text-stone-400">
                  Wyrażam zgodę na publikację zdjęć z udziałem dziecka (strona,
                  social media).
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3.5 rounded-xl border border-stone-200/80 bg-stone-50/60 px-4 py-4 dark:border-stone-800 dark:bg-stone-950/30">
              <input
                type="checkbox"
                name="terms"
                required
                className="mt-0.5 size-4 shrink-0 rounded border-stone-300 text-primary focus:ring-primary/30"
              />
              <span className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                <span className="font-semibold text-text-main dark:text-white">
                  Akceptacja regulaminu{" "}
                  <span className="text-primary" aria-hidden>
                    *
                  </span>
                </span>
                <span className="mt-1 block text-stone-500 dark:text-stone-400">
                  Akceptuję{" "}
                  <Link
                    href="/regulamin"
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    {termsLabel}
                  </Link>
                  .
                </span>
              </span>
            </label>
          </div>
        </FormSection>

        {error ? (
          <div
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            <span
              className="material-symbols-outlined mt-0.5 text-[20px]"
              aria-hidden
            >
              error
            </span>
            <span className="leading-relaxed">{error}</span>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <Link
            href={backHref}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-stone-200 px-6 font-semibold text-text-main transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            {backLabel}
          </Link>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-70 sm:flex-none sm:min-w-[14rem]"
          >
            {sending ? (
              "Wysyłanie…"
            ) : (
              <>
                Zapisz się
                <span className="material-symbols-outlined text-[20px]" aria-hidden>
                  send
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
