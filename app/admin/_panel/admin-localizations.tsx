"use client";
import { useEffect, useState } from "react";

import { fetchPlaces } from "@/app/actions";
import { PlaceType } from "@/app/types/types";
import { Button, Input, Label } from "@/components/ui";
import { createClient } from "@/utils/supabase/client";

export default function AdminLocalizationsPanel() {
  const [places, setPlaces] = useState<PlaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<PlaceType>>({
    position: { lat: 0, lng: 0 },
  });
  const [positionInput, setPositionInput] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadPlaces() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await fetchPlaces();
        if (error) setError(error);
        setPlaces(data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadPlaces();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === "position") {
      setPositionInput(value);
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function startEdit(place: PlaceType) {
    setEditingId(place.id);
    setForm({
      ...place,
      position: {
        lat: place.position?.lat ?? 0,
        lng: place.position?.lng ?? 0,
      },
    });
    setPositionInput(`${place.position?.lat}, ${place.position?.lng}`);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ position: { lat: 0, lng: 0 } });
    setPositionInput("");
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this location?")) return;
    const { error } = await supabase.from("places").delete().eq("id", id);
    if (error) setError(error.message);
    else {
      const { data, error: fetchError } = await fetchPlaces();
      if (fetchError) setError(fetchError);
      setPlaces(data || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.address || !form.map_link || !positionInput) {
      setError("Name, address, map link, and position are required.");
      return;
    }

    // Parse position string into lat/lng
    const [lat, lng] = positionInput
      .split(",")
      .map((coord: string) => parseFloat(coord.trim()));

    if (isNaN(lat) || isNaN(lng)) {
      setError(
        "Invalid position format. Please use format: latitude, longitude"
      );
      return;
    }

    const formData = {
      ...form,
      position: { lat, lng },
    };

    if (editingId) {
      // Update
      const { error } = await supabase
        .from("places")
        .update(formData)
        .eq("id", editingId);
      if (error) setError(error.message);
      else {
        cancelEdit();
        const { data, error: fetchError } = await fetchPlaces();
        if (fetchError) setError(fetchError);
        setPlaces(data || []);
      }
    } else {
      // Insert
      const { error } = await supabase.from("places").insert([formData]);
      if (error) setError(error.message);
      else {
        setForm({ position: { lat: 0, lng: 0 } });
        const { data, error: fetchError } = await fetchPlaces();
        if (fetchError) setError(fetchError);
        setPlaces(data || []);
      }
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Zarządzaj lokalizacjami</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 items-end"
      >
        <div>
          <Label htmlFor="name">Nazwa</Label>
          <Input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="address">Adres</Label>
          <Input
            name="address"
            value={form.address || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="map_link">Link do mapy</Label>
          <Input
            name="map_link"
            value={form.map_link || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="position">Pozycja (szerokość, długość)</Label>
          <Input
            name="position"
            value={positionInput}
            onChange={handleChange}
            placeholder="np. 52.2297, 21.0122"
            required
          />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button
            type="submit"
            variant="default"
            className="bg-risu-300 hover:bg-risu-600"
          >
            {editingId ? "Zapisz zmiany" : "Dodaj lokalizację"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Anuluj
            </Button>
          )}
        </div>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <div>Ładowanie...</div>
        ) : places.length === 0 ? (
          <div>Brak lokalizacji.</div>
        ) : (
          places.map((place) => (
            <div
              key={place.id}
              className="border rounded-lg p-4 flex flex-col gap-2 relative"
            >
              <div className="font-bold text-lg">{place.name}</div>
              <div className="text-sm text-muted-foreground">
                {place.address}
              </div>
              <a
                href={place.map_link}
                target="_blank"
                className="text-blue-600 underline"
              >
                Link do mapy
              </a>
              <div className="text-xs text-gray-500 mt-1">
                Pozycja: {place.position?.lat}, {place.position?.lng}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => startEdit(place)}
                >
                  Edytuj
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDelete(place.id)}
                >
                  Usuń
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
