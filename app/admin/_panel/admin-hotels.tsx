"use client";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { Trash2 } from "lucide-react";

import {
  createHotelWithAmenities,
  deleteHotelWithAmenities,
  fetchHotelsWithAmenities,
  updateHotelWithAmenities,
} from "@/app/actions";
import { AMENITY_ICONS } from "@/utils/constants";
import { Hotel, HotelAmenity } from "@/app/types/types";
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";

const emptyAmenity: HotelAmenity = { hotel_id: 0, type: "rooms", text: "" };

export default function AdminHotelsPanel() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Hotel>>({ amenities: [] });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [bucketImages, setBucketImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removingImage, setRemovingImage] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  function generateAltFromUrl(url: string): string {
    try {
      const fileNameWithExt = url.split("/").pop() || "";
      const fileName = fileNameWithExt.split(".").slice(0, -1).join(".");
      return fileName.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
    } catch (e) {
      return "hotel image";
    }
  }

  const fetchHotelImages = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("hotels").list();
    if (!error && data) {
      const urls = data
        .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
        .map(
          (file) =>
            supabase.storage.from("hotels").getPublicUrl(file.name).data
              .publicUrl
        );
      setBucketImages(urls);
    }
  }, []);

  useEffect(() => {
    if (imageDialogOpen) fetchHotelImages();
  }, [imageDialogOpen, fetchHotelImages]);

  async function loadHotels() {
    setLoading(true);
    setError(null);
    const { data, error } = await fetchHotelsWithAmenities();
    if (error) setError(error);
    setHotels(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadHotels();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAmenityChange(
    index: number,
    field: keyof HotelAmenity,
    value: string
  ) {
    const amenities = [...(form.amenities || [])];
    amenities[index] = { ...amenities[index], [field]: value };
    setForm({ ...form, amenities });
  }

  function addAmenity() {
    setForm({
      ...form,
      amenities: [...(form.amenities || []), { ...emptyAmenity }],
    });
  }

  function removeAmenity(index: number) {
    const amenities = [...(form.amenities || [])];
    amenities.splice(index, 1);
    setForm({ ...form, amenities });
  }

  function startEdit(hotel: Hotel) {
    setEditingId(hotel.id!);
    setForm({
      ...hotel,
      amenities: hotel.amenities ? [...hotel.amenities] : [],
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ amenities: [] });
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this hotel?")) return;
    const { error } = await deleteHotelWithAmenities(id);
    if (error) setError(error);
    await loadHotels();
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const filePath = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("hotels")
        .upload(filePath, file, { upsert: true });
      if (error) throw error;
      await fetchHotelImages();
      const { data: publicUrlData } = supabase.storage
        .from("hotels")
        .getPublicUrl(filePath);
      if (publicUrlData?.publicUrl) {
        const altText = generateAltFromUrl(publicUrlData.publicUrl);
        setForm({
          ...form,
          image_src: publicUrlData.publicUrl,
          image_alt: altText,
        });
        setImageDialogOpen(false);
      }
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async (url: string) => {
    setRemovingImage(url);
    setRemoveError(null);
    try {
      const match = url.match(/\/([^\/]+)$/);
      const fileName = match ? match[1] : null;
      if (!fileName) throw new Error("Nie można ustalić nazwy pliku");
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("hotels")
        .remove([fileName]);
      if (error) throw error;
      await fetchHotelImages();
      if (form.image_src === url)
        setForm({ ...form, image_src: undefined, image_alt: undefined });
    } catch (err: any) {
      setRemoveError(err.message || "Błąd usuwania pliku");
    } finally {
      setRemovingImage(null);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (
      !form.title ||
      !form.subtitle ||
      !form.description ||
      !form.image_src ||
      !form.image_alt
    ) {
      setError("All fields are required.");
      return;
    }
    if (editingId) {
      const { error } = await updateHotelWithAmenities(editingId, form);
      if (error) setError(error);
    } else {
      const { error } = await createHotelWithAmenities(form);
      if (error) setError(error);
    }
    cancelEdit();
    await loadHotels();
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Zarządzaj hotelami</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 items-end"
      >
        <div>
          <Label htmlFor="title">Tytuł</Label>
          <Input
            name="title"
            value={form.title || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="subtitle">Podtytuł</Label>
          <Input
            name="subtitle"
            value={form.subtitle || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">Opis</Label>
          <Textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Wybierz zdjęcie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Wybierz zdjęcie hotelu</DialogTitle>
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  disabled={uploading}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary hover:file:bg-primary/80"
                />
                {uploading && (
                  <div className="text-xs text-blue-600 mt-1">Wgrywanie...</div>
                )}
                {uploadError && (
                  <div className="text-xs text-red-600 mt-1">{uploadError}</div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 max-h-80 overflow-y-auto">
                {bucketImages.map((url) => (
                  <div key={url} className="relative group">
                    <button
                      type="button"
                      onClick={() => {
                        const altText = generateAltFromUrl(url);
                        setForm({
                          ...form,
                          image_src: url,
                          image_alt: altText,
                        });
                        setImageDialogOpen(false);
                      }}
                      className="border-2 hover:border-risu-400 rounded w-full h-24 flex items-center justify-center"
                      disabled={removingImage === url}
                    >
                      <img
                        src={url}
                        alt="hotel"
                        className="w-full h-24 object-cover rounded"
                      />
                    </button>
                    <button
                      type="button"
                      title="Usuń zdjęcie"
                      onClick={() => handleRemoveImage(url)}
                      className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity border border-red-200 hover:bg-red-100"
                      disabled={removingImage === url}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {removingImage === url && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-red-600">
                        Usuwanie...
                      </div>
                    )}
                  </div>
                ))}
                {bucketImages.length === 0 && (
                  <div className="col-span-3 text-center text-muted-foreground">
                    Brak zdjęć w zasobniku
                  </div>
                )}
              </div>
              {removeError && (
                <div className="text-xs text-red-600 mt-2">{removeError}</div>
              )}
            </DialogContent>
          </Dialog>
          {form.image_src && (
            <div className="mt-2 flex items-center gap-2">
              <img
                src={form.image_src}
                alt={form.image_alt || "Wybrane zdjęcie"}
                className="w-16 h-16 object-cover rounded border"
              />
              <span className="text-xs text-muted-foreground">
                Wybrane zdjęcie
              </span>
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <Label>Udogodnienia</Label>
          <div className="flex flex-col gap-2">
            {(form.amenities || []).map((amenity, idx) => {
              const Icon = AMENITY_ICONS[amenity.type];
              return (
                <div key={idx} className="flex gap-2 items-center">
                  <Select
                    value={amenity.type}
                    onValueChange={(value) =>
                      handleAmenityChange(idx, "type", value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon size={16} />}
                        <span>{amenity.type}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AMENITY_ICONS).map(([type, ItemIcon]) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <ItemIcon size={16} />
                            <span>{type}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    className="flex-1"
                    value={amenity.text}
                    onChange={(e) =>
                      handleAmenityChange(idx, "text", e.target.value)
                    }
                    placeholder="Opis udogodnienia"
                    required
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeAmenity(idx)}
                  >
                    Usuń
                  </Button>
                </div>
              );
            })}
            <Button type="button" variant="outline" onClick={addAmenity}>
              Dodaj udogodnienie
            </Button>
          </div>
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button
            type="submit"
            variant="default"
            className="bg-risu-300 hover:bg-risu-600"
          >
            {editingId ? "Zapisz zmiany" : "Dodaj hotel"}
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
        ) : hotels.length === 0 ? (
          <div>Brak hoteli.</div>
        ) : (
          hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="border rounded-lg p-4 flex flex-col gap-2 relative"
            >
              <div className="flex gap-4 items-center">
                <div className="relative w-24 h-24">
                  {hotel.image_src && (
                    <img
                      src={hotel.image_src}
                      alt={hotel.image_alt}
                      className="object-cover rounded-lg w-24 h-24"
                    />
                  )}
                </div>
                <div>
                  <div className="font-bold text-lg">{hotel.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {hotel.subtitle}
                  </div>
                </div>
              </div>
              <div className="text-sm mt-2">{hotel.description}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {hotel.amenities &&
                  hotel.amenities.map((a, i) => {
                    const Icon = AMENITY_ICONS[a.type];
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 border rounded px-2 py-1 text-xs"
                      >
                        {Icon && (
                          <span className="inline-block align-middle">
                            <Icon size={16} />
                          </span>
                        )}
                        {a.text}
                      </span>
                    );
                  })}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => startEdit(hotel)}
                >
                  Edytuj
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDelete(hotel.id!)}
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
