"use client";

import { useEffect, useState } from "react";

import {
  deleteSchedule,
  fetchPlaces,
  fetchSchedule,
  fetchTrainers,
  insertSchedule,
  updateSchedule,
} from "@/app/actions";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
} from "@/components/ui";
import { POLISH_DAY_ORDER } from "@/utils/constants";

import { PlaceType, ScheduleType, TrainerType } from "../../types/types";

export default function AdminSchedulePanel() {
  const [schedule, setSchedule] = useState<ScheduleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<ScheduleType>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<TrainerType[]>([]);
  const [places, setPlaces] = useState<PlaceType[]>([]);

  useEffect(() => {
    loadSchedule();
    loadTrainers();
    loadPlaces();
  }, []);

  async function loadSchedule() {
    setLoading(true);
    const { data, error } = await fetchSchedule();
    if (error) setError(error);
    setSchedule(data || []);
    setLoading(false);
  }

  async function loadTrainers() {
    const { data, error } = await fetchTrainers();
    if (error) setError(error);
    setTrainers(data || []);
  }

  async function loadPlaces() {
    const { data, error } = await fetchPlaces();
    if (error) setError(error);
    setPlaces(data || []);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleSelectChange(name: string, value: string | number) {
    setForm({ ...form, [name]: value });
  }

  function startEdit(row: ScheduleType) {
    setEditingId(row.id);
    setForm({ ...row });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({});
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this schedule entry?"))
      return;
    const { error } = await deleteSchedule(id);
    if (error) setError(error);
    else loadSchedule();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (
      !form.activity ||
      !form.trainer_id ||
      !form.day ||
      !form.start ||
      !form.end ||
      !form.place_id
    ) {
      setError("All fields are required.");
      return;
    }
    if (editingId) {
      // Update
      const { error } = await updateSchedule(editingId, form);
      if (error) setError(error);
      else {
        cancelEdit();
        loadSchedule();
      }
    } else {
      // Insert
      const { error } = await insertSchedule(form);
      if (error) setError(error);
      else {
        setForm({});
        loadSchedule();
      }
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Zarządzaj grafikiem</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
      >
        <div>
          <Label htmlFor="activity">Zajęcia</Label>
          <Input
            name="activity"
            value={form.activity || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="trainer">Trener</Label>
          <Select
            value={form.trainer_id ? String(form.trainer_id) : ""}
            onValueChange={(v) => handleSelectChange("trainer_id", Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Wybierz trenera" />
            </SelectTrigger>
            <SelectContent>
              {trainers.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="day">Dzień</Label>
          <Select
            value={form.day || ""}
            onValueChange={(v) => handleSelectChange("day", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Wybierz dzień" />
            </SelectTrigger>
            <SelectContent>
              {POLISH_DAY_ORDER.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="start">Godzina startu</Label>
          <Input
            name="start"
            type="time"
            value={form.start || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="end">Godzina końca</Label>
          <Input
            name="end"
            type="time"
            value={form.end || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="place">Miejsce</Label>
          <Select
            value={form.place_id ? String(form.place_id) : ""}
            onValueChange={(v) => handleSelectChange("place_id", Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Wybierz miejsce" />
            </SelectTrigger>
            <SelectContent>
              {places.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3 flex gap-2">
          <Button
            type="submit"
            variant="default"
            className="bg-risu-300 hover:bg-risu-600"
          >
            {editingId ? "Zapisz zmiany" : "Dodaj zajęcia"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Anuluj
            </Button>
          )}
        </div>
      </form>

      <Table
        columns={[
          { key: "day", header: "Dzień" },
          {
            key: "time",
            header: "Godzina",
            render: (row) =>
              `${row.start?.slice(0, 5) || ""} - ${row.end?.slice(0, 5) || ""}`,
          },
          { key: "activity", header: "Zajęcia" },
          {
            key: "trainer",
            header: "Trener",
            render: (row) => {
              if (row.trainer_id == null) return "—";
              const trainer = trainers.find(
                (t) => Number(t.id) === Number(row.trainer_id)
              );
              return trainer ? trainer.name : "—";
            },
          },
          {
            key: "place",
            header: "Miejsce",
            render: (row) => {
              if (row.place_id == null) return "—";
              const place = places.find(
                (p) => Number(p.id) === Number(row.place_id)
              );
              return place ? place.name : "—";
            },
          },
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
        data={[...schedule].sort((a, b) => {
          const aIdx = POLISH_DAY_ORDER.indexOf(a.day);
          const bIdx = POLISH_DAY_ORDER.indexOf(b.day);
          return aIdx - bIdx;
        })}
        loading={loading}
        emptyText="Brak zajęć w grafiku."
      />
    </div>
  );
}
