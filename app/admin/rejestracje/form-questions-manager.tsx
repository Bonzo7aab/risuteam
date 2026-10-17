"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

const QUESTION_TYPES = [
  { value: "short_text", label: "Krótki tekst", icon: "short_text" },
  { value: "long_text", label: "Długi tekst", icon: "notes" },
  { value: "checkbox", label: "Tak / Nie", icon: "check_box" },
  { value: "single_choice", label: "Lista wyboru", icon: "list" },
] as const;

type QuestionType = (typeof QUESTION_TYPES)[number]["value"];

type Mode = "camp" | "nocowanka";

type QuestionRow = {
  _id: Id<"registrationFormQuestions">;
  label: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
};

type Props = {
  mode: Mode;
  id: Id<"camps"> | string;
  title: string;
  backHref: string;
  backLabel: string;
};

function typeMeta(type: QuestionType) {
  return QUESTION_TYPES.find((t) => t.value === type) ?? QUESTION_TYPES[0];
}

export function FormQuestionsManager({
  mode,
  id,
  title,
  backHref,
  backLabel,
}: Props) {
  const campId = mode === "camp" ? (id as Id<"camps">) : undefined;
  const slug = mode === "nocowanka" ? (id as string) : undefined;

  const questions = useQuery(
    api.registrationFormQuestions.listByCamp,
    mode === "camp" && campId ? { campId } : "skip"
  );
  const questionsNocowanka = useQuery(
    api.registrationFormQuestions.listByNocowanka,
    mode === "nocowanka" && slug ? { slug } : "skip"
  );
  const list = mode === "camp" ? questions : questionsNocowanka;

  const addQuestion = useMutation(api.registrationFormQuestions.add);
  const updateQuestion = useMutation(api.registrationFormQuestions.update);
  const removeQuestion = useMutation(api.registrationFormQuestions.remove);
  const reorderQuestions = useMutation(api.registrationFormQuestions.reorder);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] =
    useState<Id<"registrationFormQuestions"> | null>(null);
  const [formLabel, setFormLabel] = useState("");
  const [formType, setFormType] = useState<QuestionType>("short_text");
  const [formRequired, setFormRequired] = useState(false);
  const [formOptions, setFormOptions] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<QuestionRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setFormLabel("");
    setFormType("short_text");
    setFormRequired(false);
    setFormOptions("");
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (q: QuestionRow) => {
    setEditingId(q._id);
    setFormLabel(q.label);
    setFormType(q.type);
    setFormRequired(q.required);
    setFormOptions(q.options?.join("\n") ?? "");
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formLabel.trim()) {
      setFormError("Podaj treść pytania.");
      return;
    }
    const options =
      formType === "single_choice"
        ? formOptions
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;
    if (formType === "single_choice" && (!options || options.length === 0)) {
      setFormError("Dodaj co najmniej jedną opcję (jedna na linię).");
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateQuestion({
          questionId: editingId,
          label: formLabel.trim(),
          type: formType,
          required: formRequired,
          options,
        });
      } else {
        await addQuestion({
          ...(mode === "camp"
            ? { campId: campId! }
            : { nocowankaSlug: slug! }),
          label: formLabel.trim(),
          type: formType,
          required: formRequired,
          options,
        });
      }
      setDialogOpen(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Wystąpił błąd.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await removeQuestion({ questionId: pendingDelete._id });
      setPendingDelete(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    if (!list) return;
    const next = index + direction;
    if (next < 0 || next >= list.length) return;
    const orderedIds = list.map((q) => q._id);
    [orderedIds[index], orderedIds[next]] = [orderedIds[next]!, orderedIds[index]!];
    setReordering(true);
    try {
      await reorderQuestions(
        mode === "camp"
          ? { campId: campId!, orderedIds }
          : { nocowankaSlug: slug!, orderedIds }
      );
    } finally {
      setReordering(false);
    }
  };

  if (list === undefined) {
    return (
      <div className="text-text-light dark:text-stone-400">Ładowanie…</div>
    );
  }

  return (
    <div className="space-y-5">
      <nav className="text-sm text-text-light dark:text-stone-400">
        <Link
          href="/admin/wydarzenia"
          className="transition-colors hover:text-primary"
        >
          Wydarzenia
        </Link>
        <span className="mx-2 text-stone-300 dark:text-stone-600">/</span>
        <Link href={backHref} className="transition-colors hover:text-primary">
          {backLabel}
        </Link>
        <span className="mx-2 text-stone-300 dark:text-stone-600">/</span>
        <span className="text-text-main dark:text-white">Pytania</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-white">
            Pytania formularza
          </h1>
          <p className="mt-1 text-sm text-text-light dark:text-stone-400">
            {title} · {list.length}{" "}
            {list.length === 1
              ? "pytanie"
              : list.length < 5
                ? "pytania"
                : "pytań"}
          </p>
        </div>
        <Button onClick={openAdd}>
          <span className="material-symbols-outlined mr-1 text-base">add</span>
          Dodaj pytanie
        </Button>
      </div>

      <Card className="overflow-hidden border-stone-200 dark:border-stone-700">
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <span className="material-symbols-outlined text-4xl text-stone-300 dark:text-stone-600">
                quiz
              </span>
              <div>
                <p className="font-medium text-text-main dark:text-white">
                  Brak pytań
                </p>
                <p className="mt-1 text-sm text-text-light dark:text-stone-400">
                  Dodaj pytania dodatkowe do formularza rejestracji.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={openAdd}>
                Dodaj pierwsze pytanie
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/80">
                    <th className="w-12 px-3 py-3 text-left font-bold">#</th>
                    <th className="px-4 py-3 text-left font-bold">Pytanie</th>
                    <th className="px-4 py-3 text-left font-bold">Typ</th>
                    <th className="px-4 py-3 text-left font-bold">Wymagane</th>
                    <th className="w-36 px-4 py-3 text-right font-bold">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((q, index) => {
                    const meta = typeMeta(q.type);
                    return (
                      <tr
                        key={q._id}
                        className="border-b border-stone-100 transition-colors hover:bg-stone-50/80 dark:border-stone-800 dark:hover:bg-stone-800/40"
                      >
                        <td className="px-3 py-3 tabular-nums text-stone-400">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-text-main dark:text-white">
                            {q.label}
                          </p>
                          {q.type === "single_choice" &&
                          (q.options?.length ?? 0) > 0 ? (
                            <p className="mt-0.5 text-xs text-text-light dark:text-stone-500">
                              {q.options!.length} opcji
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-700 dark:bg-stone-700/50 dark:text-stone-200">
                            <span className="material-symbols-outlined text-sm">
                              {meta.icon}
                            </span>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {q.required ? (
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/35 dark:text-amber-200">
                              Tak
                            </span>
                          ) : (
                            <span className="text-text-light dark:text-stone-500">
                              Nie
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={reordering || index === 0}
                              onClick={() => void move(index, -1)}
                              title="Wyżej"
                              aria-label="Przesuń w górę"
                            >
                              <span className="material-symbols-outlined text-base">
                                arrow_upward
                              </span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={
                                reordering || index === list.length - 1
                              }
                              onClick={() => void move(index, 1)}
                              title="Niżej"
                              aria-label="Przesuń w dół"
                            >
                              <span className="material-symbols-outlined text-base">
                                arrow_downward
                              </span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(q)}
                              title="Edytuj"
                              aria-label="Edytuj"
                            >
                              <span className="material-symbols-outlined text-base">
                                edit
                              </span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setPendingDelete(q)}
                              title="Usuń"
                              aria-label="Usuń"
                            >
                              <span className="material-symbols-outlined text-base">
                                delete
                              </span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edytuj pytanie" : "Nowe pytanie"}
            </DialogTitle>
            <DialogDescription>
              Pytanie pojawi się w formularzu rejestracji.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {formError ? (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            ) : null}
            <div>
              <Label htmlFor="form-label">Treść pytania</Label>
              <Input
                id="form-label"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                className="mt-1.5"
                placeholder="Np. Czy dziecko ma specjalne potrzeby?"
                autoFocus
              />
            </div>
            <div>
              <Label className="mb-2 block">Typ</Label>
              <div className="grid grid-cols-2 gap-2">
                {QUESTION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setFormType(t.value);
                      if (t.value !== "single_choice") setFormOptions("");
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      formType === t.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
                    )}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {t.icon}
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            {formType === "checkbox" ? (
              <p className="text-sm text-text-light dark:text-stone-400">
                Odpowiedź Tak/Nie — bez dodatkowych opcji.
              </p>
            ) : null}
            {formType === "single_choice" ? (
              <div>
                <Label htmlFor="form-options">Opcje (jedna na linię)</Label>
                <textarea
                  id="form-options"
                  value={formOptions}
                  onChange={(e) => setFormOptions(e.target.value)}
                  rows={4}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder={"Opcja 1\nOpcja 2\nOpcja 3"}
                />
              </div>
            ) : null}
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={formRequired}
                onCheckedChange={(c) => setFormRequired(c === true)}
              />
              <span className="text-sm font-medium text-text-main dark:text-stone-200">
                Pytanie wymagane
              </span>
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => setDialogOpen(false)}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {saving
                ? "Zapisywanie…"
                : editingId
                  ? "Zapisz"
                  : "Dodaj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Usunąć pytanie?</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `„${pendingDelete.label}” zniknie z formularza rejestracji.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setPendingDelete(null)}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting ? "Usuwanie…" : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
