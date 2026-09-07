"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROLE_OPTIONS = [
  { value: "user", label: "Użytkownik" },
  { value: "admin", label: "Admin" },
] as const;

type UserFormState = {
  name: string;
  role: string;
};

export default function AdminUzytkownicyPage() {
  const users = useQuery(api.users.listForAdmin);
  const updateUser = useMutation(api.users.updateForAdmin);
  const removeUser = useMutation(api.users.removeForAdmin);
  const currentUser = useQuery(api.authHelpers.getCurrentUser);

  const [editingId, setEditingId] = useState<Id<"users"> | null>(null);
  const [form, setForm] = useState<UserFormState>({ name: "", role: "user" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ name: "", role: "user" });
    setEditingId(null);
    setError(null);
  };

  const startEdit = (u: {
    _id: Id<"users">;
    name?: string;
    role?: string;
  }) => {
    setEditingId(u._id);
    setForm({
      name: u.name ?? "",
      role: u.role ?? "user",
    });
    setError(null);
  };

  const handleUpdate = async (e: React.FormEvent, id: Id<"users">) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await updateUser({
        id,
        name: form.name.trim() || undefined,
        role: form.role || undefined,
      });
      setSuccess("Zapisano zmiany.");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    }
  };

  const handleDelete = async (id: Id<"users">) => {
    if (!confirm("Na pewno chcesz usunąć tego użytkownika? Zostaną też usunięte powiązane dzieci i subskrypcje.")) return;
    setError(null);
    setSuccess(null);
    try {
      await removeUser({ id });
      setSuccess("Użytkownik usunięty.");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    }
  };

  const UserForm = ({
    onSubmit,
    onCancel,
    submitLabel,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    submitLabel: string;
  }) => (
    <form
      onSubmit={onSubmit}
      className="space-y-4 p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50"
    >
      <div>
        <Label htmlFor="name" className="text-text-main dark:text-stone-200">
          Imię / nazwa
        </Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="mt-1"
          placeholder="np. Jan Kowalski"
        />
      </div>
      <div>
        <Label className="text-text-main dark:text-stone-200">Rola</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {ROLE_OPTIONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: r.value }))}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                form.role === r.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-stone-100 dark:bg-stone-800 text-text-main dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
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
        Użytkownicy
      </h1>
      <p className="text-text-light dark:text-stone-400 mb-6">
        Lista użytkowników. Możesz edytować imię i rolę (użytkownik / admin).
        Adres e-mail jest ustawiany przy rejestracji i nie można go zmieniać z
        poziomu panelu.
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

      <div className="space-y-4">
        {users === undefined ? (
          <p className="text-text-light dark:text-stone-400">Ładowanie...</p>
        ) : users.length === 0 ? (
          <p className="text-text-light dark:text-stone-400">
            Brak użytkowników.
          </p>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-4 shadow-soft"
            >
              {editingId === u._id ? (
                <>
                  <h2 className="text-lg font-semibold text-text-main dark:text-white mb-2">
                    Edycja: {u.email ?? "—"}
                  </h2>
                  <UserForm
                    onSubmit={(e) => handleUpdate(e, u._id)}
                    onCancel={resetForm}
                    submitLabel="Zapisz"
                  />
                </>
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-text-main dark:text-white">
                      {u.email ?? "—"}
                    </h3>
                    <p className="text-sm text-text-light dark:text-stone-400 mt-0.5">
                      {u.name ? (
                        <span>{u.name}</span>
                      ) : (
                        <span className="italic">Brak imienia</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-primary/15 text-primary"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                        }`}
                      >
                        {u.role === "admin" ? "Admin" : "Użytkownik"}
                      </span>
                      {u.emailVerificationTime != null ? (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                          E-mail zweryfikowany
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                          E-mail niezweryfikowany
                        </span>
                      )}
                      {u.childrenCount > 0 && (
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {u.childrenCount} {u.childrenCount === 1 ? "dziecko" : "dzieci"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(u)}
                    >
                      Edytuj
                    </Button>
                    {currentUser?._id !== u._id && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(u._id)}
                      >
                        Usuń
                      </Button>
                    )}
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
