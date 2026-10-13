"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DobPicker } from "@/components/ui/dob-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRightIcon } from "@/components/icons/arrow-right";

function formatChildDob(raw?: string): string | null {
  if (!raw?.trim()) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw.trim();
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function childInitials(firstName: string, lastName: string): string {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  return `${a}${b}`.toUpperCase() || "?";
}

type ChildFormFieldsProps = {
  idPrefix: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  pesel: string;
  onFirstName: (v: string) => void;
  onLastName: (v: string) => void;
  onDateOfBirth: (v: string) => void;
  onPesel: (v: string) => void;
  error: string | null;
  inDialog?: boolean;
  popoverContainer?: HTMLElement | null;
};

function ChildFormFields({
  idPrefix,
  firstName,
  lastName,
  dateOfBirth,
  pesel,
  onFirstName,
  onLastName,
  onDateOfBirth,
  onPesel,
  error,
  inDialog = false,
  popoverContainer,
}: ChildFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-firstName`}>Imię *</Label>
          <Input
            id={`${idPrefix}-firstName`}
            value={firstName}
            onChange={(e) => onFirstName(e.target.value)}
            placeholder="np. Anna"
            required
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-lastName`}>Nazwisko *</Label>
          <Input
            id={`${idPrefix}-lastName`}
            value={lastName}
            onChange={(e) => onLastName(e.target.value)}
            placeholder="np. Kowalska"
            required
            className="h-11 rounded-xl"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-dob`}>Data urodzenia</Label>
          <DobPicker
            id={`${idPrefix}-dob`}
            valueYmd={dateOfBirth}
            onChangeYmd={onDateOfBirth}
            inDialog={inDialog}
            popoverContainer={popoverContainer}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-pesel`}>PESEL</Label>
          <Input
            id={`${idPrefix}-pesel`}
            value={pesel}
            onChange={(e) => onPesel(e.target.value)}
            placeholder="11 cyfr"
            inputMode="numeric"
            className="h-11 rounded-xl"
          />
        </div>
      </div>
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
        >
          <span className="material-symbols-outlined mt-0.5 text-[18px]" aria-hidden>
            error
          </span>
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}

export default function DzieciPage() {
  const children = useQuery(api.children.listMyChildren, {});
  const addChild = useMutation(api.children.addChild);
  const updateChild = useMutation(api.children.updateChild);

  const [addOpen, setAddOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [pesel, setPesel] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addDialogSurface, setAddDialogSurface] =
    useState<HTMLDivElement | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editChildId, setEditChildId] = useState<Id<"children"> | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editDateOfBirth, setEditDateOfBirth] = useState("");
  const [editPesel, setEditPesel] = useState("");
  const [editPending, setEditPending] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editDialogSurface, setEditDialogSurface] =
    useState<HTMLDivElement | null>(null);

  const resetAddForm = () => {
    setFirstName("");
    setLastName("");
    setDateOfBirth("");
    setPesel("");
    setError(null);
  };

  const openAddDialog = () => {
    resetAddForm();
    setAddOpen(true);
  };

  const closeAddDialog = () => {
    setAddOpen(false);
    setError(null);
  };

  const openEditDialog = (ch: NonNullable<typeof children>[number]) => {
    setEditChildId(ch._id);
    setEditFirstName(ch.firstName);
    setEditLastName(ch.lastName);
    setEditDateOfBirth(ch.dateOfBirth ?? "");
    setEditPesel(ch.pesel ?? "");
    setEditError(null);
    setEditOpen(true);
  };

  const closeEditDialog = () => {
    setEditOpen(false);
    setEditChildId(null);
    setEditError(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setError("Imię i nazwisko są wymagane.");
      return;
    }
    setPending(true);
    try {
      await addChild({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim() || undefined,
        pesel: pesel.trim() || undefined,
      });
      closeAddDialog();
      resetAddForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się dodać dziecka.");
    } finally {
      setPending(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editChildId) return;
    setEditError(null);
    if (!editFirstName.trim() || !editLastName.trim()) {
      setEditError("Imię i nazwisko są wymagane.");
      return;
    }
    setEditPending(true);
    try {
      await updateChild({
        childId: editChildId,
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        dateOfBirth: editDateOfBirth.trim() || undefined,
        pesel: editPesel.trim() || undefined,
      });
      closeEditDialog();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Nie udało się zapisać zmian."
      );
    } finally {
      setEditPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Panel rodzica
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-text-main dark:text-white md:text-4xl">
            Moje dzieci
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400 sm:text-base">
            Zarządzaj profilami dzieci — dane wykorzystujemy przy zapisach na
            zajęcia i obozy.
          </p>
        </div>
        {children !== undefined && children.length > 0 ? (
          <Button
            type="button"
            onClick={openAddDialog}
            className="h-11 shrink-0 rounded-xl px-5 font-bold"
          >
            <span className="material-symbols-outlined mr-2 text-[20px]" aria-hidden>
              person_add
            </span>
            Dodaj dziecko
          </Button>
        ) : null}
      </header>

      {children === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl bg-stone-200/70 dark:bg-stone-800"
            />
          ))}
        </div>
      ) : children.length === 0 ? (
        <div className="rounded-2xl border border-stone-200/80 bg-white px-6 py-14 text-center shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark sm:px-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl" aria-hidden>
              family_restroom
            </span>
          </span>
          <h2 className="mt-5 text-xl font-black tracking-tight text-text-main dark:text-white">
            Dodaj pierwsze dziecko
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            Profil dziecka jest potrzebny, aby zapisać je na zajęcia, półkolonie
            lub obozy.
          </p>
          <Button
            type="button"
            onClick={openAddDialog}
            className="mt-6 h-11 rounded-xl px-6 font-bold"
          >
            <span className="material-symbols-outlined mr-2 text-[20px]" aria-hidden>
              person_add
            </span>
            Dodaj dziecko
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
              Lista ({children.length})
            </h2>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {children.map((ch) => {
              const dobLabel = formatChildDob(ch.dateOfBirth);
              const hasPesel = Boolean(ch.pesel?.trim());
              return (
                <li key={ch._id}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:hover:translate-y-0 dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark dark:hover:shadow-card-dark-hover">
                    <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-black tracking-wide text-primary">
                          {childInitials(ch.firstName, ch.lastName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-bold tracking-tight text-text-main dark:text-white">
                            {ch.firstName} {ch.lastName}
                          </h3>
                          <ul className="mt-2 space-y-1.5 text-sm text-stone-500 dark:text-stone-400">
                            <li className="flex items-center gap-2">
                              <span
                                className="material-symbols-outlined text-[18px] text-primary/80"
                                aria-hidden
                              >
                                cake
                              </span>
                              <span>
                                {dobLabel ? `ur. ${dobLabel}` : "Brak daty urodzenia"}
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span
                                className="material-symbols-outlined text-[18px] text-primary/80"
                                aria-hidden
                              >
                                badge
                              </span>
                              <span>
                                {hasPesel ? "PESEL uzupełniony" : "Brak PESEL"}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-stone-100 pt-4 dark:border-stone-800">
                        <button
                          type="button"
                          onClick={() => openEditDialog(ch)}
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900/50 dark:text-stone-200 dark:hover:border-stone-600 dark:hover:bg-stone-900"
                        >
                          <span
                            className="material-symbols-outlined text-[18px] text-stone-500 dark:text-stone-400"
                            aria-hidden
                          >
                            edit
                          </span>
                          Edytuj
                        </button>
                        <Link
                          href="/dashboard/zapisy"
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
                        >
                          Zapisz
                          <ArrowRightIcon className="text-[0.95em]" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          if (!open) closeAddDialog();
        }}
      >
        <DialogContent
          ref={setAddDialogSurface}
          className="overflow-visible border-stone-200 dark:border-stone-700 sm:max-w-lg"
        >
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle className="text-text-main dark:text-white">
                Dodaj dziecko
              </DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <ChildFormFields
                idPrefix="add"
                firstName={firstName}
                lastName={lastName}
                dateOfBirth={dateOfBirth}
                pesel={pesel}
                onFirstName={setFirstName}
                onLastName={setLastName}
                onDateOfBirth={setDateOfBirth}
                onPesel={setPesel}
                error={error}
                inDialog
                popoverContainer={addDialogSurface}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={closeAddDialog}
                disabled={pending}
              >
                Anuluj
              </Button>
              <Button type="submit" className="rounded-xl font-bold" disabled={pending}>
                {pending ? "Dodawanie…" : "Dodaj dziecko"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(o) => !o && closeEditDialog()}>
        <DialogContent
          ref={setEditDialogSurface}
          className="overflow-visible border-stone-200 dark:border-stone-700 sm:max-w-lg"
        >
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="text-text-main dark:text-white">
                Edytuj dane dziecka
              </DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <ChildFormFields
                idPrefix="edit"
                firstName={editFirstName}
                lastName={editLastName}
                dateOfBirth={editDateOfBirth}
                pesel={editPesel}
                onFirstName={setEditFirstName}
                onLastName={setEditLastName}
                onDateOfBirth={setEditDateOfBirth}
                onPesel={setEditPesel}
                error={editError}
                inDialog
                popoverContainer={editDialogSurface}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={closeEditDialog}
                disabled={editPending}
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                className="rounded-xl font-bold"
                disabled={editPending}
              >
                {editPending ? "Zapisywanie…" : "Zapisz zmiany"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
