"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { campRegistrationSchema } from "@/lib/schemas";
import { firstZodMessage } from "@/lib/validation";
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
  const customQuestions = eventType === "camp" ? campQuestions : nocowankaQuestions;

  const createCampRegistration = useMutation(api.registrations.createCampRegistration);
  const createNocowankaRegistration = useMutation(api.registrations.createNocowankaRegistration);

  const [selectedChildId, setSelectedChildId] = useState<Id<"children"> | null>(null);
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
          customAnswers[q._id] = val === "on" || val === "true" || val === "1" ? "true" : "false";
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
          setError("Nie znaleziono obozu. Odśwież stronę lub wróć do listy obozów.");
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
          customAnswers: Object.keys(customAnswers).length ? customAnswers : undefined,
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
          customAnswers: Object.keys(customAnswers).length ? customAnswers : undefined,
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
      <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-green-500 mb-4 block">
          check_circle
        </span>
        <h2 className="text-2xl font-bold text-text-main dark:text-white mb-2">
          Rejestracja zakończona
        </h2>
        <p className="text-text-light dark:text-stone-400 mb-8">
          Skontaktujemy się wkrótce ze szczegółami i danymi do przelewu. Sprawdź skrzynkę email.
        </p>
        <Link
          href={successHref}
          className="inline-flex items-center justify-center rounded-xl h-12 px-8 bg-primary text-primary-foreground font-bold hover:bg-primary-hover"
        >
          {successLabel}
        </Link>
      </div>
    );
  }

  if (myChildren === undefined) {
    return (
      <div className="flex justify-center py-16">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-bold text-text-main dark:text-white">Dane dziecka</h2>
          {hasSavedChildren ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="camp-child-select">Dziecko</Label>
                <Select
                  value={resolvedChildId ?? undefined}
                  onValueChange={(v) => setSelectedChildId(v as Id<"children">)}
                >
                  <SelectTrigger
                    id="camp-child-select"
                    className="mt-1 rounded-xl h-11 w-full border-input"
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
              </div>
              {selectedChild && !selectedChild.dateOfBirth?.trim() ? (
                <div>
                  <Label htmlFor="childDobProfile">Data urodzenia</Label>
                  <div className="mt-1">
                    <DobPicker
                      id="childDobProfile"
                      valueYmd={profileDobSupplement}
                      onChangeYmd={setProfileDobSupplement}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Brak daty w profilu — uzupełnij przed wysłaniem zgłoszenia.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="childNameManual">Imię</Label>
                  <Input
                    id="childNameManual"
                    value={manualFirstName}
                    onChange={(e) => setManualFirstName(e.target.value)}
                    required
                    className="rounded-xl mt-1"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <Label htmlFor="childSurnameManual">Nazwisko</Label>
                  <Input
                    id="childSurnameManual"
                    value={manualLastName}
                    onChange={(e) => setManualLastName(e.target.value)}
                    required
                    className="rounded-xl mt-1"
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="childDobManual">Data urodzenia</Label>
                  <div className="mt-1">
                    <DobPicker
                      id="childDobManual"
                      valueYmd={manualChildDob}
                      onChangeYmd={setManualChildDob}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="childPeselManual">PESEL (opcjonalnie)</Label>
                  <Input
                    id="childPeselManual"
                    value={manualChildPesel}
                    onChange={(e) => setManualChildPesel(e.target.value)}
                    className="rounded-xl mt-1"
                    placeholder="11 cyfr"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-bold text-text-main dark:text-white">Zdrowie</h2>
          <div>
            <Label htmlFor="dietary">Dieta / nietolerancje</Label>
            <Input
              id="dietary"
              name="dietary"
              className="rounded-xl mt-1"
              placeholder="Np. wegetariańska, alergia na orzechy"
            />
          </div>
          <div>
            <Label htmlFor="allergies">Alergie i leki</Label>
            <textarea
              id="allergies"
              name="allergies"
              rows={3}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm mt-1"
              placeholder="Wymień alergie i przyjmowane leki"
            />
          </div>
          <div>
            <Label htmlFor="medicalNotes">Uwagi medyczne</Label>
            <textarea
              id="medicalNotes"
              name="medicalNotes"
              rows={2}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm mt-1"
            />
          </div>
        </div>

        {customQuestions?.length ? (
          <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-bold text-text-main dark:text-white">
              Dodatkowe informacje
            </h2>
            {customQuestions.map((q) => (
              <div key={q._id}>
                <Label htmlFor={`custom_${q._id}`}>
                  {q.label}
                  {q.required && " *"}
                </Label>
                {q.type === "short_text" && (
                  <Input
                    id={`custom_${q._id}`}
                    name={`custom_${q._id}`}
                    className="rounded-xl mt-1"
                    required={q.required}
                  />
                )}
                {q.type === "long_text" && (
                  <textarea
                    id={`custom_${q._id}`}
                    name={`custom_${q._id}`}
                    rows={3}
                    className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm mt-1"
                    required={q.required}
                  />
                )}
                {q.type === "checkbox" && (
                  <label className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id={`custom_${q._id}`}
                      name={`custom_${q._id}`}
                      className="rounded"
                    />
                    <span className="text-sm text-text-main dark:text-stone-300">Tak</span>
                  </label>
                )}
                {q.type === "single_choice" && (
                  <select
                    id={`custom_${q._id}`}
                    name={`custom_${q._id}`}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
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
              </div>
            ))}
          </div>
        ) : null}

        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-bold text-text-main dark:text-white">
            Dane opiekuna i zgody
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parentName">Imię i nazwisko opiekuna</Label>
              <Input id="parentName" name="parentName" required className="rounded-xl mt-1" />
            </div>
            <div>
              <Label htmlFor="parentPhone">Telefon</Label>
              <Input id="parentPhone" name="parentPhone" type="tel" required className="rounded-xl mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="parentEmail">Email</Label>
            <Input id="parentEmail" name="parentEmail" type="email" required className="rounded-xl mt-1" />
          </div>
          <div className="space-y-4 pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="medicalConsent" required className="rounded mt-1" />
              <span className="text-sm text-text-main dark:text-stone-300">
                Wyrażam zgodę na udzielenie dziecku pierwszej pomocy i/lub zabiegów medycznych w razie konieczności.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="photoConsent" value="1" className="rounded mt-1" />
              <span className="text-sm text-text-main dark:text-stone-300">
                Wyrażam zgodę na publikację zdjęć z udziałem dziecka (strona, social media).
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="terms" required className="rounded mt-1" />
              <span className="text-sm text-text-main dark:text-stone-300">
                Akceptuję <Link href="/regulamin" className="text-primary underline">regulamin</Link> obozu.
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div
            className="p-4 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Link
            href={backHref}
            className="rounded-xl h-12 px-8 border-2 border-stone-200 dark:border-stone-700 font-bold text-text-main dark:text-white hover:bg-stone-50 dark:hover:bg-stone-800 inline-flex items-center justify-center"
          >
            {backLabel}
          </Link>
          <button
            type="submit"
            disabled={sending}
            className="flex-1 rounded-xl h-12 bg-primary text-primary-foreground font-bold hover:bg-primary-hover disabled:opacity-70"
          >
            {sending ? "Wysyłanie…" : "Zapisz się"}
          </button>
        </div>
      </form>
    </div>
  );
}
