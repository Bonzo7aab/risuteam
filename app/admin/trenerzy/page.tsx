"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const DISCIPLINE_OPTIONS = ["Judo", "Karate", "Gimnastyka"] as const;

type CoachFormState = {
  name: string;
  bio: string;
  photoUrl: string;
  disciplines: string[];
  isActive: boolean;
};

const emptyForm: CoachFormState = {
  name: "",
  bio: "",
  photoUrl: "",
  disciplines: [],
  isActive: true,
};

export default function AdminTrenerzyPage() {
  const coaches = useQuery(api.coaches.listForAdmin);
  const createCoach = useMutation(api.coaches.create);
  const updateCoach = useMutation(api.coaches.update);
  const removeCoach = useMutation(api.coaches.remove);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"coaches"> | null>(null);
  const [form, setForm] = useState<CoachFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setForm(emptyForm);
    setError(null);
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await createCoach({
        name: form.name.trim(),
        bio: form.bio.trim() || undefined,
        photoUrl: form.photoUrl.trim() || undefined,
        disciplines: form.disciplines.length ? form.disciplines : ["Judo"],
        isActive: form.isActive,
      });
      setSuccess("Trener dodany.");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    }
  };

  const handleUpdate = async (e: React.FormEvent, id: Id<"coaches">) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await updateCoach({
        id,
        name: form.name.trim(),
        bio: form.bio.trim() || undefined,
        photoUrl: form.photoUrl.trim() || undefined,
        disciplines: form.disciplines.length ? form.disciplines : ["Judo"],
        isActive: form.isActive,
      });
      setSuccess("Zapisano zmiany.");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    }
  };

  const handleDelete = async (id: Id<"coaches">) => {
    if (!confirm("Na pewno chcesz usunąć tego trenera?")) return;
    setError(null);
    setSuccess(null);
    try {
      await removeCoach({ id });
      setSuccess("Trener usunięty.");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    }
  };

  const startEdit = (c: {
    _id: Id<"coaches">;
    name: string;
    bio?: string;
    photoUrl?: string;
    disciplines: string[];
    isActive: boolean;
  }) => {
    setEditingId(c._id);
    setForm({
      name: c.name,
      bio: c.bio ?? "",
      photoUrl: c.photoUrl ?? "",
      disciplines: [...c.disciplines],
      isActive: c.isActive,
    });
    setShowAddForm(false);
    setError(null);
  };

  const CoachForm = ({
    onSubmit,
    onCancel,
    submitLabel,
    embedded,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    submitLabel: string;
    /** When true, form sits inside a bordered card — no inner border/panel */
    embedded?: boolean;
  }) => (
    <form
      onSubmit={onSubmit}
      className={
        embedded
          ? "space-y-4"
          : "space-y-4 p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50"
      }
    >
      <div>
        <Label htmlFor="name" className="text-text-main dark:text-stone-200">
          Imię i nazwisko *
        </Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="bio" className="text-text-main dark:text-stone-200">
          Bio
        </Label>
        <Textarea
          id="bio"
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          className="mt-1 min-h-[80px]"
          placeholder="Krótki opis doświadczenia i osiągnięć"
        />
      </div>
      <div>
        <Label htmlFor="photoUrl" className="text-text-main dark:text-stone-200">
          URL zdjęcia
        </Label>
        <Input
          id="photoUrl"
          type="url"
          value={form.photoUrl}
          onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
          className="mt-1"
          placeholder="https://..."
        />
      </div>
      <div>
        <span className="text-sm font-medium text-text-main dark:text-stone-200">
          Dyscypliny *
        </span>
        <div className="flex flex-wrap gap-3 mt-2">
          {DISCIPLINE_OPTIONS.map((d) => (
            <label
              key={d}
              className="flex items-center gap-2 cursor-pointer text-sm text-text-main dark:text-stone-300"
            >
              <Checkbox
                checked={form.disciplines.includes(d)}
                onCheckedChange={(checked) =>
                  setForm((f) => ({
                    ...f,
                    disciplines: checked
                      ? [...f.disciplines, d]
                      : f.disciplines.filter((x) => x !== d),
                  }))
                }
              />
              {d}
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="isActive"
          checked={form.isActive}
          onCheckedChange={(checked) =>
            setForm((f) => ({ ...f, isActive: checked === true }))
          }
        />
        <Label
          htmlFor="isActive"
          className="text-sm font-medium text-text-main dark:text-stone-200 cursor-pointer"
        >
          Aktywny (widoczny w kadrze)
        </Label>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </form>
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-text-main dark:text-white mb-2">
        Trenerzy
      </h1>
      <p className="text-text-light dark:text-stone-400 mb-6">
        Zarządzanie kadrą trenerską. Lista, dodawanie, edycja i usuwanie trenerów.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary text-sm">
          {success}
        </div>
      )}

      <div className="mb-6">
        {!showAddForm && !editingId && (
          <Button onClick={() => setShowAddForm(true)}>Dodaj trenera</Button>
        )}
        {showAddForm && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-text-main dark:text-white mb-2">
              Nowy trener
            </h2>
            <CoachForm
              onSubmit={handleCreate}
              onCancel={() => resetForm()}
              submitLabel="Dodaj"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {coaches === undefined ? (
          <p className="text-text-light dark:text-stone-400">Ładowanie...</p>
        ) : coaches.length === 0 ? (
          <p className="text-text-light dark:text-stone-400">
            Brak trenerów. Dodaj pierwszego.
          </p>
        ) : (
          coaches.map((c) => (
            <div
              key={c._id}
              className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-4 shadow-soft"
            >
              {editingId === c._id ? (
                <>
                  <h2 className="text-lg font-semibold text-text-main dark:text-white mb-2">
                    Edycja: {c.name}
                  </h2>
                  <CoachForm
                    embedded
                    onSubmit={(e) => handleUpdate(e, c._id)}
                    onCancel={resetForm}
                    submitLabel="Zapisz"
                  />
                </>
              ) : (
                <div className="flex flex-wrap items-start gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
                    {c.photoUrl ? (
                      <Image
                        src={c.photoUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-xs">
                        Brak zdj.
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-main dark:text-white">
                      {c.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {c.disciplines.map((d) => (
                        <span
                          key={d}
                          className="inline-flex px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    {!c.isActive && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                        Nieaktywny
                      </span>
                    )}
                    {c.bio && (
                      <p className="text-sm text-text-light dark:text-stone-400 mt-2 line-clamp-2">
                        {c.bio}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(c)}
                    >
                      Edytuj
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(c._id)}
                    >
                      Usuń
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
