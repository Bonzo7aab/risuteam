"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import {
  getNocowankaDescription,
  getNocowankaDisplayName,
  getNocowankaMaxParticipants,
} from "@/lib/nocowanki";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventRegistrationsView } from "@/app/admin/rejestracje/event-registrations-view";

export default function AdminRejestracjeNocowankaPage() {
  const params = useParams();
  const slug = decodeURIComponent((params.slug as string) ?? "");
  const createNocowankaRegistration = useMutation(
    api.registrations.createNocowankaRegistration
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSaving, setCreateSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    childName: "",
    childSurname: "",
    childDob: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    dietary: "",
    allergies: "",
    medicalNotes: "",
  });
  const registrations = useQuery(
    api.registrations.listRegistrationsByNocowankaSlug,
    { slug }
  );
  const nocowankaDoc = useQuery(
    api.nocowanki.getBySlug,
    slug ? { slug } : "skip"
  );
  const formQuestions = useQuery(api.registrationFormQuestions.listByNocowanka, { slug });
  const customQuestionLabels = formQuestions
    ? Object.fromEntries(formQuestions.map((q) => [q._id, q.label]))
    : undefined;

  if (registrations === undefined || nocowankaDoc === undefined) {
    return (
      <div className="text-text-light dark:text-stone-400">Ładowanie…</div>
    );
  }

  const displayName = nocowankaDoc?.name ?? getNocowankaDisplayName(slug);
  const description =
    nocowankaDoc?.description ?? getNocowankaDescription(slug);
  const maxParticipants =
    nocowankaDoc?.maxParticipants ?? getNocowankaMaxParticipants(slug);
  const registrationOpen = nocowankaDoc ? nocowankaDoc.isActive !== false : true;

  const paidCount =
    registrations.filter((r) => r.paymentStatus === "paid").length ?? 0;
  const pendingCount = registrations.filter(
    (r) =>
      r.paymentStatus === "partial" ||
      r.paymentStatus === "unpaid" ||
      !r.paymentStatus
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

  const editSlot =
    nocowankaDoc !== null ? (
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button asChild variant="outline" size="sm" className="w-full font-semibold sm:w-auto sm:flex-1">
          <Link href={`/admin/wydarzenia/nocowanka/${encodeURIComponent(slug)}/edit`}>
            Edytuj nocowankę
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="w-full border-2 border-primary/35 font-semibold text-primary hover:bg-primary/10 sm:w-auto sm:flex-1 dark:border-primary/45 dark:hover:bg-primary/15">
          <Link href={`/admin/wydarzenia/nocowanka/${encodeURIComponent(slug)}/pytania`}>
            Pytania formularza
          </Link>
        </Button>
      </div>
    ) : null;

  const handleCreateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (
      !createForm.childName.trim() ||
      !createForm.childSurname.trim() ||
      !createForm.parentName.trim() ||
      !createForm.parentEmail.trim()
    ) {
      setCreateError("Imię i nazwisko dziecka oraz dane rodzica są wymagane.");
      return;
    }
    setCreateSaving(true);
    try {
      await createNocowankaRegistration({
        slug,
        childName: createForm.childName.trim(),
        childSurname: createForm.childSurname.trim(),
        childDob: createForm.childDob.trim() || undefined,
        parentName: createForm.parentName.trim(),
        parentEmail: createForm.parentEmail.trim(),
        parentPhone: createForm.parentPhone.trim() || undefined,
        dietary: createForm.dietary.trim() || undefined,
        allergies: createForm.allergies.trim() || undefined,
        medicalNotes: createForm.medicalNotes.trim() || undefined,
      });
      setCreateDialogOpen(false);
      setCreateForm({
        childName: "",
        childSurname: "",
        childDob: "",
        parentName: "",
        parentEmail: "",
        parentPhone: "",
        dietary: "",
        allergies: "",
        medicalNotes: "",
      });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setCreateSaving(false);
    }
  };

  return (
    <>
      <EventRegistrationsView
        eventTitle={displayName}
        eventDescription={description}
        newRegistrationOnClick={() => setCreateDialogOpen(true)}
        formQuestionsHref={`/admin/wydarzenia/nocowanka/${encodeURIComponent(slug)}/pytania`}
        customQuestionLabels={customQuestionLabels}
        participants={participants}
        totalRegistered={registrations.length}
        maxParticipants={maxParticipants}
        paidCount={paidCount}
        pendingCount={pendingCount}
        isRegistrationOpen={registrationOpen}
        pendingPaymentsCount={pendingPaymentsCount}
        missingMedicalFormsCount={missingMedicalFormsCount}
        slotAboveStats={editSlot}
      />
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Nowa rejestracja (ręcznie)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRegistration} className="space-y-4">
            {createError ? (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {createError}
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="reg-child-name">Imię dziecka *</Label>
                <Input
                  id="reg-child-name"
                  value={createForm.childName}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, childName: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="reg-child-surname">Nazwisko dziecka *</Label>
                <Input
                  id="reg-child-surname"
                  value={createForm.childSurname}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, childSurname: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="reg-child-dob">Data urodzenia</Label>
                <Input
                  id="reg-child-dob"
                  type="date"
                  value={createForm.childDob}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, childDob: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="reg-parent-phone">Telefon rodzica</Label>
                <Input
                  id="reg-parent-phone"
                  value={createForm.parentPhone}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, parentPhone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="reg-parent-name">Imię i nazwisko rodzica *</Label>
                <Input
                  id="reg-parent-name"
                  value={createForm.parentName}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, parentName: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="reg-parent-email">E-mail rodzica *</Label>
                <Input
                  id="reg-parent-email"
                  type="email"
                  value={createForm.parentEmail}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, parentEmail: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="reg-dietary">Dieta</Label>
                <Input
                  id="reg-dietary"
                  value={createForm.dietary}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, dietary: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="reg-allergies">Alergie</Label>
                <Input
                  id="reg-allergies"
                  value={createForm.allergies}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, allergies: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reg-medical">Uwagi medyczne</Label>
              <Textarea
                id="reg-medical"
                value={createForm.medicalNotes}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, medicalNotes: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={createSaving}>
                {createSaving ? "Dodawanie..." : "Dodaj rejestrację"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
