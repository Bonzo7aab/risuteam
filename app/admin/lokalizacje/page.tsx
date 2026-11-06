"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LocationFormState = {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  mapsUrl: string;
  lat: string;
  lng: string;
  hours: string;
  isPublic: boolean;
};

const emptyForm: LocationFormState = {
  name: "",
  address: "",
  city: "",
  postalCode: "",
  mapsUrl: "",
  lat: "",
  lng: "",
  hours: "",
  isPublic: true,
};

function parseOptionalCoord(value: string): number | undefined {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : Number.NaN;
}

export default function AdminLokalizacjePage() {
  const locations = useQuery(api.locations.listForAdmin);
  const createLocation = useMutation(api.locations.create);
  const updateLocation = useMutation(api.locations.update);
  const removeLocation = useMutation(api.locations.remove);
  const backfillPublicMeta = useMutation(api.locations.backfillPublicMeta);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"locations"> | null>(null);
  const [form, setForm] = useState<LocationFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [backfilling, setBackfilling] = useState(false);

  const resetForm = () => {
    setForm(emptyForm);
    setError(null);
    setEditingId(null);
    setShowAddForm(false);
  };

  const readCoordsOrThrow = (): { lat?: number; lng?: number } => {
    const lat = parseOptionalCoord(form.lat);
    const lng = parseOptionalCoord(form.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new Error("Współrzędne muszą być liczbami (np. 52.1141).");
    }
    if ((lat === undefined) !== (lng === undefined)) {
      throw new Error("Podaj zarówno szerokość, jak i długość geograficzną.");
    }
    return { lat, lng };
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { lat, lng } = readCoordsOrThrow();
      await createLocation({
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim() || undefined,
        mapsUrl: form.mapsUrl.trim() || undefined,
        lat,
        lng,
        hours: form.hours.trim() || undefined,
        isPublic: form.isPublic,
      });
      setSuccess("Lokalizacja dodana.");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    }
  };

  const handleUpdate = async (e: React.FormEvent, id: Id<"locations">) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { lat, lng } = readCoordsOrThrow();
      await updateLocation({
        id,
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim() || undefined,
        mapsUrl: form.mapsUrl.trim() || undefined,
        lat: lat ?? null,
        lng: lng ?? null,
        hours: form.hours.trim() || null,
        isPublic: form.isPublic,
      });
      setSuccess("Zapisano zmiany.");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    }
  };

  const handleDelete = async (id: Id<"locations">) => {
    if (!confirm("Na pewno chcesz usunąć tę lokalizację?")) return;
    setError(null);
    setSuccess(null);
    try {
      await removeLocation({ id });
      setSuccess("Lokalizacja usunięta.");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    }
  };

  const handleBackfill = async () => {
    setBackfilling(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await backfillPublicMeta({});
      setSuccess(
        result.patched > 0
          ? `Uzupełniono dane mapy dla ${result.patched} lokalizacji.`
          : "Wszystkie znane lokalizacje mają już dane mapy.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setBackfilling(false);
    }
  };

  const startEdit = (loc: {
    _id: Id<"locations">;
    name: string;
    address: string;
    city: string;
    postalCode?: string;
    mapsUrl?: string;
    lat?: number;
    lng?: number;
    hours?: string;
    isPublic?: boolean;
  }) => {
    setEditingId(loc._id);
    setForm({
      name: loc.name,
      address: loc.address,
      city: loc.city,
      postalCode: loc.postalCode ?? "",
      mapsUrl: loc.mapsUrl ?? "",
      lat: loc.lat !== undefined ? String(loc.lat) : "",
      lng: loc.lng !== undefined ? String(loc.lng) : "",
      hours: loc.hours ?? "",
      isPublic: loc.isPublic !== false,
    });
    setShowAddForm(false);
    setError(null);
  };

  const LocationForm = ({
    onSubmit,
    onCancel,
    submitLabel,
    embedded,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    submitLabel: string;
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
          Nazwa *
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
        <Label htmlFor="address" className="text-text-main dark:text-stone-200">
          Adres *
        </Label>
        <Input
          id="address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className="mt-1"
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="text-text-main dark:text-stone-200">
            Miasto *
          </Label>
          <Input
            id="city"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="postalCode" className="text-text-main dark:text-stone-200">
            Kod pocztowy
          </Label>
          <Input
            id="postalCode"
            value={form.postalCode}
            onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
            className="mt-1"
            placeholder="00-000"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="mapsUrl" className="text-text-main dark:text-stone-200">
          Link do map (Google Maps)
        </Label>
        <Input
          id="mapsUrl"
          type="url"
          value={form.mapsUrl}
          onChange={(e) => setForm((f) => ({ ...f, mapsUrl: e.target.value }))}
          className="mt-1"
          placeholder="https://maps.app.goo.gl/..."
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lat" className="text-text-main dark:text-stone-200">
            Szerokość (lat)
          </Label>
          <Input
            id="lat"
            value={form.lat}
            onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
            className="mt-1"
            placeholder="52.1141"
            inputMode="decimal"
          />
        </div>
        <div>
          <Label htmlFor="lng" className="text-text-main dark:text-stone-200">
            Długość (lng)
          </Label>
          <Input
            id="lng"
            value={form.lng}
            onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
            className="mt-1"
            placeholder="20.9791"
            inputMode="decimal"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="hours" className="text-text-main dark:text-stone-200">
          Godziny (strona publiczna)
        </Label>
        <Input
          id="hours"
          value={form.hours}
          onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
          className="mt-1"
          placeholder="15:00–20:00"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-text-main dark:text-stone-200">
        <input
          type="checkbox"
          checked={form.isPublic}
          onChange={(e) =>
            setForm((f) => ({ ...f, isPublic: e.target.checked }))
          }
          className="size-4 rounded border-stone-300 text-primary focus:ring-primary"
        />
        Pokazuj na stronie /lokalizacja
      </label>
      <p className="text-xs text-text-light dark:text-stone-500">
        Dyscypliny na stronie publicznej biorą się z aktywnych zajęć w grafiku.
        Do mapy potrzebne są współrzędne lat/lng.
      </p>
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
        Lokalizacje
      </h1>
      <p className="text-text-light dark:text-stone-400 mb-6">
        Zarządzanie miejscami zajęć. Ta sama lista zasila stronę publiczną
        /lokalizacja (gdy lokalizacja jest publiczna i ma współrzędne).
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

      <div className="mb-6 flex flex-wrap gap-2">
        {!showAddForm && !editingId && (
          <>
            <Button onClick={() => setShowAddForm(true)}>Dodaj lokalizację</Button>
            <Button
              type="button"
              variant="outline"
              disabled={backfilling}
              onClick={handleBackfill}
            >
              {backfilling ? "Uzupełnianie…" : "Uzupełnij dane mapy"}
            </Button>
          </>
        )}
        {showAddForm && (
          <div className="mt-4 w-full">
            <h2 className="text-lg font-semibold text-text-main dark:text-white mb-2">
              Nowa lokalizacja
            </h2>
            <LocationForm
              onSubmit={handleCreate}
              onCancel={() => resetForm()}
              submitLabel="Dodaj"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {locations === undefined ? (
          <p className="text-text-light dark:text-stone-400">Ładowanie...</p>
        ) : locations.length === 0 ? (
          <p className="text-text-light dark:text-stone-400">
            Brak lokalizacji. Dodaj pierwszą.
          </p>
        ) : (
          locations.map((loc) => {
            const onPublicMap =
              loc.isPublic !== false &&
              typeof loc.lat === "number" &&
              typeof loc.lng === "number";
            return (
              <div
                key={loc._id}
                className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-surface-dark p-4 shadow-soft"
              >
                {editingId === loc._id ? (
                  <>
                    <h2 className="text-lg font-semibold text-text-main dark:text-white mb-2">
                      Edycja: {loc.name}
                    </h2>
                    <LocationForm
                      embedded
                      onSubmit={(e) => handleUpdate(e, loc._id)}
                      onCancel={resetForm}
                      submitLabel="Zapisz"
                    />
                  </>
                ) : (
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-text-main dark:text-white">
                          {loc.name}
                        </h3>
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            onPublicMap
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200"
                              : "bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-300"
                          }`}
                        >
                          {onPublicMap ? "Na stronie publicznej" : "Tylko admin"}
                        </span>
                      </div>
                      <p className="text-sm text-text-light dark:text-stone-400 mt-1">
                        {loc.address}
                        {loc.postalCode ? `, ${loc.postalCode}` : ""} {loc.city}
                      </p>
                      {loc.hours ? (
                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                          Godziny: {loc.hours}
                        </p>
                      ) : null}
                      {typeof loc.lat === "number" && typeof loc.lng === "number" ? (
                        <p className="mt-1 text-xs tabular-nums text-stone-500 dark:text-stone-400">
                          {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                          Brak współrzędnych — nie pojawi się na mapie publicznej.
                        </p>
                      )}
                      {loc.mapsUrl && (
                        <a
                          href={loc.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary font-medium risu-underline mt-2 inline-block"
                        >
                          Otwórz w mapach →
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(loc)}
                      >
                        Edytuj
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(loc._id)}
                      >
                        Usuń
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
