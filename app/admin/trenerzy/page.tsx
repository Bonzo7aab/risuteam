"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DISCIPLINE_OPTIONS } from "@/lib/disciplines";

const PAGE_SIZE = 15;

type CoachFormState = {
  name: string;
  bio: string;
  photoUrl: string;
  disciplines: string[];
  isActive: boolean;
};

type StatusFilter = "all" | "active" | "inactive";
type SortKey = "name" | "status" | "disciplines";
type SortDirection = "asc" | "desc";

type AdminCoach = {
  _id: Id<"coaches">;
  name: string;
  bio?: string;
  photoUrl?: string;
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

function SortHeader({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-bold"
      onClick={onClick}
    >
      {label}
      <span
        className={cn(
          "material-symbols-outlined text-base",
          active ? "text-primary" : "text-stone-400"
        )}
      >
        {active ? (direction === "asc" ? "arrow_upward" : "arrow_downward") : "swap_vert"}
      </span>
    </button>
  );
}

export default function AdminTrenerzyPage() {
  const coaches = useQuery(api.coaches.listForAdmin);
  const createCoach = useMutation(api.coaches.create);
  const updateCoach = useMutation(api.coaches.update);
  const removeCoach = useMutation(api.coaches.remove);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [disciplineFilter, setDisciplineFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(0);

  const [dialogMode, setDialogMode] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<Id<"coaches"> | null>(null);
  const [form, setForm] = useState<CoachFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<Id<"coaches"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (!coaches) return { total: 0, active: 0, inactive: 0, disciplines: 0 };
    const disc = new Set(coaches.flatMap((c) => c.disciplines));
    return {
      total: coaches.length,
      active: coaches.filter((c) => c.isActive).length,
      inactive: coaches.filter((c) => !c.isActive).length,
      disciplines: disc.size,
    };
  }, [coaches]);

  const filtered = useMemo(() => {
    if (!coaches) return [];
    const q = search.trim().toLowerCase();
    let rows = coaches.filter((c) => {
      if (statusFilter === "active" && !c.isActive) return false;
      if (statusFilter === "inactive" && c.isActive) return false;
      if (disciplineFilter && !c.disciplines.includes(disciplineFilter)) return false;
      if (!q) return true;
      const haystack = [c.name, c.bio, ...c.disciplines]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    const dir = sortDirection === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      if (sortKey === "status") {
        return dir * (Number(a.isActive) - Number(b.isActive));
      }
      if (sortKey === "disciplines") {
        return dir * (a.disciplines.length - b.disciplines.length);
      }
      return dir * a.name.localeCompare(b.name, "pl");
    });

    return rows;
  }, [coaches, search, statusFilter, disciplineFilter, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(0);
  };

  const openAdd = () => {
    setDialogMode("add");
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const openEdit = (c: AdminCoach) => {
    setDialogMode("edit");
    setEditingId(c._id);
    setForm({
      name: c.name,
      bio: c.bio ?? "",
      photoUrl: c.photoUrl ?? "",
      disciplines: [...c.disciplines],
      isActive: c.isActive,
    });
    setError(null);
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        bio: form.bio.trim() || undefined,
        photoUrl: form.photoUrl.trim() || undefined,
        disciplines: form.disciplines.length ? form.disciplines : ["Judo"],
        isActive: form.isActive,
      };
      if (dialogMode === "edit" && editingId) {
        await updateCoach({ id: editingId, ...payload });
        setSuccess("Zapisano zmiany.");
      } else {
        await createCoach(payload);
        setSuccess("Trener dodany.");
      }
      closeDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: Id<"coaches">) => {
    if (!confirm("Na pewno chcesz usunąć tego trenera?")) return;
    setError(null);
    setSuccess(null);
    setDeletingId(id);
    try {
      await removeCoach({ id });
      setSuccess("Trener usunięty.");
      if (editingId === id) closeDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDisciplineFilter(null);
    setPage(0);
  };

  const hasActiveFilters =
    search.trim() !== "" || statusFilter !== "all" || disciplineFilter != null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-white">
            Trenerzy
          </h1>
          <p className="mt-1 text-sm text-text-light dark:text-stone-400">
            Zarządzanie kadrą trenerską i dyscyplinami.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {coaches !== undefined && (
            <p className="text-sm text-text-light dark:text-stone-400">
              {filtered.length === stats.total
                ? `${stats.total} trenerów`
                : `${filtered.length} z ${stats.total}`}
            </p>
          )}
          <Button onClick={openAdd}>
            <span className="material-symbols-outlined mr-1 text-base">add</span>
            Dodaj trenera
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Wszyscy", stats.total, "group"],
            ["Aktywni", stats.active, "check_circle"],
            ["Nieaktywni", stats.inactive, "pause_circle"],
            ["Dyscypliny", stats.disciplines, "sports_martial_arts"],
          ] as const
        ).map(([label, value, icon]) => (
          <div
            key={label}
            className="rounded-xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900/60"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-text-light dark:text-stone-400">
              <span className="material-symbols-outlined text-base">{icon}</span>
              {label}
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-text-main dark:text-white">
              {coaches === undefined ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-stone-200 bg-stone-100 p-3 dark:border-stone-700 dark:bg-stone-800/60">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Szukaj po imieniu, bio lub dyscyplinie…"
            className="min-w-[16rem] flex-1 bg-white dark:bg-stone-900"
          />
          <Button
            variant="outline"
            className="bg-white dark:bg-stone-900"
            disabled={!hasActiveFilters}
            onClick={clearFilters}
          >
            Wyczyść filtry
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(
            [
              ["all", "Wszyscy"],
              ["active", "Aktywni"],
              ["inactive", "Nieaktywni"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                statusFilter === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-stone-300 bg-white text-stone-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200"
              )}
              onClick={() => {
                setStatusFilter(value);
                setPage(0);
              }}
            >
              {label}
            </button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-stone-300 sm:inline-block dark:bg-stone-600" />
          {DISCIPLINE_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                disciplineFilter === d
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-stone-300 bg-white text-stone-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200"
              )}
              onClick={() => {
                setDisciplineFilter((prev) => (prev === d ? null : d));
                setPage(0);
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
          {success}
        </div>
      )}

      <Card className="overflow-hidden border-stone-200 dark:border-stone-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/80">
                  <th className="px-4 py-3 text-left">
                    <SortHeader
                      label="Trener"
                      active={sortKey === "name"}
                      direction={sortDirection}
                      onClick={() => toggleSort("name")}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader
                      label="Dyscypliny"
                      active={sortKey === "disciplines"}
                      direction={sortDirection}
                      onClick={() => toggleSort("disciplines")}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-bold">Bio</th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader
                      label="Status"
                      active={sortKey === "status"}
                      direction={sortDirection}
                      onClick={() => toggleSort("status")}
                    />
                  </th>
                  <th className="px-4 py-3 text-right font-bold">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {coaches === undefined ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-text-light dark:text-stone-400"
                    >
                      Ładowanie…
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-text-light dark:text-stone-400"
                    >
                      Brak wyników.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b border-stone-100 transition-colors hover:bg-stone-50/80 dark:border-stone-800 dark:hover:bg-stone-800/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
                            {c.photoUrl ? (
                              <Image
                                src={c.photoUrl}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-stone-400">
                                Brak
                              </div>
                            )}
                          </div>
                          <p className="font-medium text-text-main dark:text-white">
                            {c.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex max-w-[18rem] flex-wrap gap-1">
                          {c.disciplines.map((d) => (
                            <span
                              key={d}
                              className="inline-flex rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-700 dark:bg-stone-700/50 dark:text-stone-200"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-[20rem] truncate text-text-light dark:text-stone-400">
                          {c.bio?.trim() || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                            c.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/35 dark:text-green-200"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-200"
                          )}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {c.isActive ? "check_circle" : "pause_circle"}
                          </span>
                          {c.isActive ? "Aktywny" : "Nieaktywny"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            title="Edytuj"
                            onClick={() => openEdit(c)}
                          >
                            <span className="material-symbols-outlined text-base">
                              edit
                            </span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Usuń"
                            disabled={deletingId === c._id}
                            onClick={() => handleDelete(c._id)}
                          >
                            <span className="material-symbols-outlined text-base">
                              delete
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-light dark:text-stone-400">
            Pokazano {currentPage * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE + PAGE_SIZE, filtered.length)} z{" "}
            {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Poprzednia
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Następna
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={dialogMode != null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "edit" ? "Edycja trenera" : "Nowy trener"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "edit"
                ? "Zaktualizuj dane i widoczność w kadrze."
                : "Dodaj trenera do listy kadry."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="coach-name">Imię i nazwisko *</Label>
              <Input
                id="coach-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="coach-bio">Bio</Label>
              <Textarea
                id="coach-bio"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className="mt-1 min-h-[80px]"
                placeholder="Krótki opis doświadczenia i osiągnięć"
              />
            </div>
            <div>
              <Label htmlFor="coach-photo">URL zdjęcia</Label>
              <Input
                id="coach-photo"
                type="url"
                value={form.photoUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, photoUrl: e.target.value }))
                }
                className="mt-1"
                placeholder="https://..."
              />
            </div>
            <div>
              <span className="text-sm font-medium">Dyscypliny *</span>
              <div className="mt-2 flex flex-wrap gap-3">
                {DISCIPLINE_OPTIONS.map((d) => (
                  <label
                    key={d}
                    className="flex cursor-pointer items-center gap-2 text-sm text-text-main dark:text-stone-300"
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
                id="coach-active"
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, isActive: checked === true }))
                }
              />
              <Label htmlFor="coach-active" className="cursor-pointer">
                Aktywny (widoczny w kadrze)
              </Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Anuluj
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Zapisywanie…"
                  : dialogMode === "edit"
                    ? "Zapisz"
                    : "Dodaj"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
