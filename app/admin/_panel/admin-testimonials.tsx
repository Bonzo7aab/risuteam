"use client";
import { useEffect, useState } from "react";
import {
  fetchTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  fetchPlaces,
  fetchHotelsWithAmenities, // <-- add this
} from "@/app/actions";
import { TestimonialType, PlaceType, Hotel } from "@/app/types/types";
import {
  Button,
  Input,
  Label,
  Table,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";
import { DialogImages } from "@/components/ui/dialog-images";

const tabOptions = [
  { value: "polkolonie", label: "Półkolonie" },
  { value: "letnie", label: "Letnie" },
  { value: "zimowe", label: "Zimowe" },
  { value: "nocowanka", label: "Nocowanka" },
];

export default function AdminTestimonialsPanel() {
  const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<TestimonialType>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [places, setPlaces] = useState<PlaceType[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const MAX_TESTIMONIALS = 5;
  const isAtMaxTestimonials =
    testimonials.length >= MAX_TESTIMONIALS && !editingId;

  useEffect(() => {
    async function loadTestimonials() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await fetchTestimonials();
        if (error) setError(error);
        setTestimonials(data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadTestimonials();
  }, []);

  useEffect(() => {
    setPlacesLoading(true);
    setHotelsLoading(true);
    Promise.all([fetchPlaces(), fetchHotelsWithAmenities()]).then(
      ([placesRes, hotelsRes]) => {
        setPlaces(placesRes.data || []);
        setPlacesLoading(false);
        setHotels(hotelsRes.data || []);
        setHotelsLoading(false);
      }
    );
  }, []);

  // For editing: preselect place or hotel
  useEffect(() => {
    if (form.location_id && (places.length > 0 || hotels.length > 0)) {
      // Try to find in places first
      let found = places.find((p) => String(p.id) === String(form.location_id));
      if (found) {
        setSelectedPlaceId(found.id);
      } else {
        // Try hotels
        let foundHotel = hotels.find(
          (h) => String(h.id) === String(form.location_id)
        );
        if (foundHotel) {
          setSelectedPlaceId(foundHotel.id);
        } else {
          setSelectedPlaceId(null);
        }
      }
    }
  }, [form.location_id, places, hotels]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleTabChange(value: string) {
    setForm({ ...form, tab: value as TestimonialType["tab"] });
  }

  function startEdit(item: TestimonialType) {
    setEditingId(item.id);
    setForm(item);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({});
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    const { error } = await deleteTestimonial(id);
    if (error) setError(error);
    else {
      const { data, error: fetchError } = await fetchTestimonials();
      if (fetchError) setError(fetchError);
      setTestimonials(data || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (isAtMaxTestimonials) {
      setError(
        `Maksymalna liczba testimoniali to ${MAX_TESTIMONIALS}. Usuń istniejący, aby dodać nowy.`
      );
      return;
    }
    if (!form.name || !form.date || !form.location_id || !form.src) {
      setError("All fields except tab are required.");
      return;
    }
    // Pass location_type to backend if needed, or use for display
    if (editingId) {
      // Update
      const { error } = await updateTestimonial(editingId, form);
      if (error) setError(error);
      else {
        cancelEdit();
        const { data, error: fetchError } = await fetchTestimonials();
        if (fetchError) setError(fetchError);
        setTestimonials(data || []);
      }
    } else {
      // Insert
      const { error } = await createTestimonial(form);
      if (error) setError(error);
      else {
        setForm({});
        const { data, error: fetchError } = await fetchTestimonials();
        if (fetchError) setError(fetchError);
        setTestimonials(data || []);
      }
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Zarządzaj Karuzelą</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {isAtMaxTestimonials && (
        <div className="text-yellow-600 bg-yellow-100 border border-yellow-300 rounded p-2 mb-4">
          Maksymalna liczba elementów w karuzeli to {MAX_TESTIMONIALS}. Usuń
          istniejący, aby dodać nowy.
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 "
      >
        <div>
          <Label htmlFor="name">Tytuł</Label>
          <Input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            required
            disabled={isAtMaxTestimonials}
          />
        </div>
        <div className="flex flex-col gap-2 md:col-start-2 row-span-4 self-start">
          <Label htmlFor="src">Obraz</Label>
          <Button
            type="button"
            variant="outline"
            onClick={() => setImageDialogOpen(true)}
            className="w-fit"
            disabled={isAtMaxTestimonials}
          >
            {form.src ? "Zmień obraz" : "Wybierz obraz"}
          </Button>
          <DialogImages
            open={imageDialogOpen}
            onOpenChange={setImageDialogOpen}
            selectedImages={form.src ? [form.src] : []}
            onChange={(images) => {
              setForm({ ...form, src: images[0] || "" });
              setImageDialogOpen(false);
            }}
            bucket="testimonials"
            disabled={loading || isAtMaxTestimonials}
          />
          {form.src && (
            <div className="mt-2 flex items-center gap-2">
              <img
                src={form.src}
                alt="Wybrany obraz"
                className="w-24 h-24 object-cover rounded border"
              />
              <span className="text-xs text-muted-foreground">
                Wybrany obraz
              </span>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="date">Data</Label>
          <Input
            name="date"
            value={form.date || ""}
            placeholder="np. 2025-01-01 - 2025-01-08"
            onChange={handleChange}
            required
            disabled={isAtMaxTestimonials}
          />
        </div>
        <div>
          <Label htmlFor="location_id">Lokalizacja</Label>
          <Select
            value={selectedPlaceId ? String(selectedPlaceId) : ""}
            onValueChange={(v) => {
              // Determine if it's a place or hotel
              const place = places.find((p) => String(p.id) === v);
              if (place) {
                setSelectedPlaceId(place.id);
                setForm({ ...form, location_id: place.id });
                return;
              }
              const hotel = hotels.find((h) => String(h.id) === v);
              if (hotel) {
                setSelectedPlaceId(hotel.id);
                setForm({ ...form, location_id: hotel.id });
                return;
              }
              setSelectedPlaceId(null);
              setForm({ ...form, location_id: undefined });
            }}
            disabled={placesLoading || hotelsLoading || isAtMaxTestimonials}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  placesLoading || hotelsLoading
                    ? "Ładowanie..."
                    : "Wybierz lokalizację lub hotel"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">
                Lokalizacje
              </div>
              {places.map((p) => (
                <SelectItem key={`place-${p.id}`} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">
                Hotele
              </div>
              {hotels.map((h) => (
                <SelectItem key={`hotel-${h.id}`} value={String(h.id)}>
                  {h.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="tab">Typ</Label>
          <Select
            value={form.tab || ""}
            onValueChange={handleTabChange}
            disabled={isAtMaxTestimonials}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Wybierz typ (opcjonalne)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="polkolonie">Półkolonie</SelectItem>
              <SelectItem value="letnie">Letnie</SelectItem>
              <SelectItem value="zimowe">Zimowe</SelectItem>
              <SelectItem value="nocowanka">Nocowanka</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button
            type="submit"
            variant="default"
            className="bg-risu-300 hover:bg-risu-600"
            disabled={isAtMaxTestimonials && !editingId}
          >
            {editingId ? "Zapisz zmiany" : "Dodaj do karuzeli"}
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
            { key: "name", header: "Tytuł" },
            { key: "date", header: "Data" },
            { key: "location_name", header: "Lokalizacja" },
            { key: "tab", header: "Typ" },
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
          data={[...testimonials]}
          loading={loading}
          emptyText="Brak testimoniali."
        />
      </div>
    </div>
  );
}
