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

export default function DzieciPage() {
  const children = useQuery(api.children.listMyChildren, {});
  const addChild = useMutation(api.children.addChild);
  const updateChild = useMutation(api.children.updateChild);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [pesel, setPesel] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
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
      setFirstName("");
      setLastName("");
      setDateOfBirth("");
      setPesel("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się dodać dziecka.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-text-main dark:text-white mb-6">
        Moje dzieci
      </h1>

      {children === undefined ? (
        <p className="text-text-light dark:text-stone-400">Ładowanie…</p>
      ) : (
        <>
          {children.length > 0 && (
            <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 mb-8">
              <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
                Lista dzieci
              </h2>
              <ul className="space-y-3">
                {children.map((ch) => (
                  <li
                    key={ch._id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-text-main dark:text-white">
                        {ch.firstName} {ch.lastName}
                      </span>
                      {ch.dateOfBirth && (
                        <span className="block sm:inline sm:ml-2 text-sm text-text-light dark:text-stone-400">
                          {ch.dateOfBirth}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => openEditDialog(ch)}
                    >
                      <span className="material-symbols-outlined text-lg mr-1">
                        edit
                      </span>
                      Edytuj
                    </Button>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/zapisy"
                className="inline-flex items-center gap-2 mt-4 text-primary font-bold risu-underline text-sm"
              >
                <span className="material-symbols-outlined text-lg">
                  edit_calendar
                </span>
                Zapisz na zajęcia
              </Link>
            </div>
          )}

          <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 mb-8">
            <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
              {children.length > 0 ? "Dodaj kolejne dziecko" : "Dodaj dziecko"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">Imię *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nazwisko *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="dateOfBirth">Data urodzenia</Label>
                  <DobPicker
                    id="dateOfBirth"
                    valueYmd={dateOfBirth}
                    onChangeYmd={setDateOfBirth}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="pesel">PESEL</Label>
                  <Input
                    id="pesel"
                    value={pesel}
                    onChange={(e) => setPesel(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={pending}>
                {pending ? "Dodawanie…" : "Dodaj dziecko"}
              </Button>
            </form>
          </div>

          {children.length > 0 && (
            <p className="text-sm text-text-light dark:text-stone-400">
              Zapisz dziecko na zajęcia w{" "}
              <Link href="/dashboard/zapisy" className="text-primary font-medium risu-underline">
                Zapisy
              </Link>{" "}
              lub zobacz{" "}
              <Link href="/grafik" className="text-primary font-medium risu-underline">
                grafik zajęć
              </Link>
              .
            </p>
          )}
        </>
      )}

      <Dialog open={editOpen} onOpenChange={(o) => !o && closeEditDialog()}>
        <DialogContent
          ref={setEditDialogSurface}
          className="sm:max-w-md border-stone-200 dark:border-stone-700 overflow-visible"
        >
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="text-text-main dark:text-white">
                Edytuj dane dziecka
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="editFirstName">Imię *</Label>
                  <Input
                    id="editFirstName"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Nazwisko *</Label>
                  <Input
                    id="editLastName"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="editDateOfBirth">Data urodzenia</Label>
                  <DobPicker
                    id="editDateOfBirth"
                    valueYmd={editDateOfBirth}
                    onChangeYmd={setEditDateOfBirth}
                    inDialog
                    popoverContainer={editDialogSurface}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="editPesel">PESEL</Label>
                  <Input
                    id="editPesel"
                    value={editPesel}
                    onChange={(e) => setEditPesel(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              {editError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {editError}
                </p>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditDialog}
                disabled={editPending}
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={editPending}>
                {editPending ? "Zapisywanie…" : "Zapisz zmiany"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
