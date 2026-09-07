"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const QUESTION_TYPES = [
  { value: "short_text", label: "Krótki tekst" },
  { value: "long_text", label: "Długi tekst" },
  { value: "checkbox", label: "Checkbox" },
  { value: "single_choice", label: "Pojedynczy wybór (lista)" },
] as const;

type Mode = "camp" | "nocowanka";

type Props = {
  mode: Mode;
  id: Id<"camps"> | string;
  title: string;
  backHref: string;
  backLabel: string;
};

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
  const [editingId, setEditingId] = useState<Id<"registrationFormQuestions"> | null>(null);
  const [formLabel, setFormLabel] = useState("");
  const [formType, setFormType] = useState<"short_text" | "long_text" | "checkbox" | "single_choice">("short_text");
  const [formRequired, setFormRequired] = useState(false);
  const [formOptions, setFormOptions] = useState("");

  const openAdd = () => {
    setEditingId(null);
    setFormLabel("");
    setFormType("short_text");
    setFormRequired(false);
    setFormOptions("");
    setDialogOpen(true);
  };

  const openEdit = (q: { _id: Id<"registrationFormQuestions">; label: string; type: "short_text" | "long_text" | "checkbox" | "single_choice"; required: boolean; options?: string[] }) => {
    setEditingId(q._id);
    setFormLabel(q.label);
    setFormType(q.type);
    setFormRequired(q.required);
    setFormOptions(q.options?.join("\n") ?? "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formLabel.trim()) return;
    const options = formType === "single_choice"
      ? formOptions.split("\n").map((s) => s.trim()).filter(Boolean)
      : undefined;
    if (formType === "single_choice" && (!options || options.length === 0)) return;

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
          ...(mode === "camp" ? { campId: campId! } : { nocowankaSlug: slug! }),
          label: formLabel.trim(),
          type: formType,
          required: formRequired,
          options,
        });
      }
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = async (questionId: Id<"registrationFormQuestions">) => {
    if (!confirm("Usunąć to pytanie?")) return;
    try {
      await removeQuestion({ questionId });
    } catch (e) {
      console.error(e);
    }
  };

  const moveUp = async (index: number) => {
    if (!list || index <= 0) return;
    const orderedIds = list.map((q) => q._id);
    [orderedIds[index - 1], orderedIds[index]] = [orderedIds[index], orderedIds[index - 1]];
    await reorderQuestions(
      mode === "camp" ? { campId: campId!, orderedIds } : { nocowankaSlug: slug!, orderedIds }
    );
  };

  const moveDown = async (index: number) => {
    if (!list || index >= list.length - 1) return;
    const orderedIds = list.map((q) => q._id);
    [orderedIds[index], orderedIds[index + 1]] = [orderedIds[index + 1], orderedIds[index]];
    await reorderQuestions(
      mode === "camp" ? { campId: campId!, orderedIds } : { nocowankaSlug: slug!, orderedIds }
    );
  };

  if (list === undefined) {
    return <div className="text-text-light dark:text-stone-400">Ładowanie…</div>;
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm text-text-light dark:text-stone-400">
        <Link href={backHref} className="hover:text-primary transition-colors">
          {backLabel}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-main dark:text-white">Pytania formularza</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-text-main dark:text-white">
          Pytania formularza – {title}
        </h1>
        <Button onClick={openAdd}>Dodaj pytanie</Button>
      </div>

      <Card className="border-stone-200 dark:border-stone-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-text-light dark:text-stone-400 uppercase tracking-wide">
            Lista pytań ({list.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-text-light dark:text-stone-400 py-4">
              Brak pytań. Kliknij „Dodaj pytanie”, aby dodać pytania do formularza rejestracji.
            </p>
          ) : (
            <ul className="space-y-2">
              {list.map((q, index) => (
                <li
                  key={q._id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-stone-200 dark:border-stone-700 p-3",
                    "bg-stone-50/50 dark:bg-stone-800/30"
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-40"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      aria-label="Przesuń w górę"
                    >
                      <span className="material-symbols-outlined text-lg">arrow_upward</span>
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-40"
                      onClick={() => moveDown(index)}
                      disabled={index === list.length - 1}
                      aria-label="Przesuń w dół"
                    >
                      <span className="material-symbols-outlined text-lg">arrow_downward</span>
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-main dark:text-white truncate">{q.label}</p>
                    <p className="text-xs text-text-light dark:text-stone-400">
                      {QUESTION_TYPES.find((t) => t.value === q.type)?.label ?? q.type}
                      {q.required && " • Wymagane"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => openEdit(q)}>
                      Edytuj
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleRemove(q._id)}
                    >
                      Usuń
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edytuj pytanie" : "Dodaj pytanie"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="form-label">Treść pytania</Label>
              <Input
                id="form-label"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                className="mt-1"
                placeholder="Np. Czy dziecko ma specjalne potrzeby?"
              />
            </div>
            <div>
              <Label htmlFor="form-type">Typ</Label>
              <select
                id="form-type"
                value={formType}
                onChange={(e) => {
                  const v = e.target.value as "short_text" | "long_text" | "checkbox" | "single_choice";
                  setFormType(v);
                  if (v !== "single_choice") setFormOptions("");
                }}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            {formType === "checkbox" && (
              <p className="text-sm text-text-light dark:text-stone-400">
                Odpowiedź Tak/Nie – nie trzeba wpisywać opcji.
              </p>
            )}
            {formType === "single_choice" && (
              <div key="single_choice_options">
                <Label htmlFor="form-options">Opcje (jedna per linia)</Label>
                <textarea
                  id="form-options"
                  value={formOptions}
                  onChange={(e) => setFormOptions(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Opcja 1&#10;Opcja 2&#10;Opcja 3"
                />
              </div>
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formRequired}
                onChange={(e) => setFormRequired(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-text-main dark:text-stone-300">Pytanie wymagane</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Anuluj
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formLabel.trim() || (formType === "single_choice" && !formOptions.trim().split("\n").some((s) => s.trim()))}
            >
              {editingId ? "Zapisz" : "Dodaj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
