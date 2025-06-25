"use client";
import { useEffect, useState } from "react";

import { createFaq, deleteFaq, fetchFaq, updateFaq } from "@/app/actions";
import { FaqType } from "@/app/types/types";
import { Button, Input, Label, Table, Textarea } from "@/components/ui";

export default function AdminFaqPanel() {
  const [faq, setFaq] = useState<FaqType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<FaqType>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFaq() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await fetchFaq();
        if (error) setError(error);
        setFaq(data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadFaq();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(item: FaqType) {
    setEditingId(item.id);
    setForm(item);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({});
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    const { error } = await deleteFaq(id);
    if (error) setError(error);
    else {
      const { data, error: fetchError } = await fetchFaq();
      if (fetchError) setError(fetchError);
      setFaq(data || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.question || !form.answer) {
      setError("Question and answer are required.");
      return;
    }
    if (editingId) {
      // Update
      const { error } = await updateFaq(editingId, form);
      if (error) setError(error);
      else {
        cancelEdit();
        const { data, error: fetchError } = await fetchFaq();
        if (fetchError) setError(fetchError);
        setFaq(data || []);
      }
    } else {
      // Insert
      const { error } = await createFaq(form);
      if (error) setError(error);
      else {
        setForm({});
        const { data, error: fetchError } = await fetchFaq();
        if (fetchError) setError(fetchError);
        setFaq(data || []);
      }
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Zarządzaj FAQ</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 items-end"
      >
        <div className="md:col-span-2">
          <Label htmlFor="question">Pytanie</Label>
          <Input
            name="question"
            value={form.question || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="answer">Odpowiedź</Label>
          <Textarea
            name="answer"
            value={form.answer || ""}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button
            type="submit"
            variant="default"
            className="bg-risu-300 hover:bg-risu-600"
          >
            {editingId ? "Zapisz zmiany" : "Dodaj FAQ"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Anuluj
            </Button>
          )}
        </div>
      </form>
      <div className="overflow-x-auto">
        <Table
          columns={[
            { key: "question", header: "Pytanie" },
            { key: "answer", header: "Odpowiedź" },
            {
              key: "actions",
              header: "Akcje",
              render: (row) => (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(row)}
                  >
                    Edytuj
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(row.id)}
                  >
                    Usuń
                  </Button>
                </div>
              ),
            },
          ]}
          data={[...faq]}
          loading={loading}
          emptyText="Brak FAQ."
        />
      </div>
    </div>
  );
}
