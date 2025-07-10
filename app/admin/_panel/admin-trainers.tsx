"use client";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { Trash2 } from "lucide-react";

import { TrainerType } from "@/app/types/types";
import { Button, Input, Label, Textarea } from "@/components/ui";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";

import {
  createTrainer,
  deleteTrainer,
  fetchTrainers,
  updateTrainer,
} from "../../actions";

export default function AdminTrainersPanel() {
  const [trainers, setTrainers] = useState<TrainerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<TrainerType>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [bucketImages, setBucketImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removingImage, setRemovingImage] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  // Fetch images from Supabase storage 'trainers' bucket
  const fetchTrainerImages = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("trainers").list();
    if (!error && data) {
      const urls = data
        .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
        .map(
          (file) =>
            supabase.storage.from("trainers").getPublicUrl(file.name).data
              .publicUrl
        );
      setBucketImages(urls);
    }
  }, []);

  useEffect(() => {
    if (imageDialogOpen) fetchTrainerImages();
  }, [imageDialogOpen, fetchTrainerImages]);

  useEffect(() => {
    async function loadTrainers() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await fetchTrainers();
        if (error) setError(error);
        setTrainers(data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadTrainers();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(trainer: TrainerType) {
    setEditingId(trainer.id);
    setForm(trainer);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({});
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "Usunięcie trenera spowoduje również usunięcie wszystkich powiązanych zajęć w grafiku (schedule). Czy na pewno chcesz kontynuować?"
      )
    )
      return;
    const { error } = await deleteTrainer(id);
    if (error) setError(error);
    else {
      const { data, error: fetchError } = await fetchTrainers();
      if (fetchError) setError(fetchError);
      setTrainers(data || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.image_url || !form.activity) {
      setError("Name, image URL, and activity are required.");
      return;
    }
    if (editingId) {
      // Update
      const { error } = await updateTrainer(editingId, form);
      if (error) setError(error);
      else {
        cancelEdit();
        const { data, error: fetchError } = await fetchTrainers();
        if (fetchError) setError(fetchError);
        setTrainers(data || []);
      }
    } else {
      // Insert
      const { error } = await createTrainer(form);
      if (error) setError(error);
      else {
        setForm({});
        const { data, error: fetchError } = await fetchTrainers();
        if (fetchError) setError(fetchError);
        setTrainers(data || []);
      }
    }
  }

  // Upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const filePath = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("trainers")
        .upload(filePath, file, { upsert: true });
      if (error) throw error;
      await fetchTrainerImages(); // Refresh list
      // Optionally, auto-select the uploaded image:
      const { data: publicUrl } = supabase.storage
        .from("trainers")
        .getPublicUrl(filePath);
      if (publicUrl?.publicUrl) {
        setForm({ ...form, image_url: publicUrl.publicUrl });
        setImageDialogOpen(false);
      }
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove handler
  const handleRemoveImage = async (url: string) => {
    setRemovingImage(url);
    setRemoveError(null);
    try {
      // Extract file name from public URL
      const match = url.match(/\/([^\/]+)$/);
      const fileName = match ? match[1] : null;
      if (!fileName) throw new Error("Nie można ustalić nazwy pliku");
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("trainers")
        .remove([fileName]);
      if (error) throw error;
      await fetchTrainerImages();
      if (form.image_url === url) setForm({ ...form, image_url: undefined });
    } catch (err: any) {
      setRemoveError(err.message || "Błąd usuwania pliku");
    } finally {
      setRemovingImage(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Zarządzaj trenerami</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 items-end"
      >
        <div>
          <Label htmlFor="name">Imię i nazwisko</Label>
          <Input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="activity">Aktywność</Label>
          <Input
            name="activity"
            value={form.activity || ""}
            onChange={handleChange}
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
              <DialogTitle>Wybierz zdjęcie trenera</DialogTitle>
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary hover:file:bg-primary/80"
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
                        setForm({ ...form, image_url: url });
                        setImageDialogOpen(false);
                      }}
                      className={
                        "border-2 hover:border-risu-400 rounded w-full h-24 flex items-center justify-center"
                      }
                      disabled={removingImage === url}
                    >
                      <img
                        src={url}
                        alt="trainer"
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
          {form.image_url && (
            <div className="mt-2 flex items-center gap-2">
              <img
                src={form.image_url}
                alt="Wybrane zdjęcie"
                className="w-16 h-16 object-cover rounded border"
              />
              <span className="text-xs text-muted-foreground">
                Wybrane zdjęcie
              </span>
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">Opis</Label>
          <Textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button
            type="submit"
            variant="default"
            className="bg-risu-300 hover:bg-risu-600"
          >
            {editingId ? "Zapisz zmiany" : "Dodaj trenera"}
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
        ) : trainers.length === 0 ? (
          <div>Brak trenerów.</div>
        ) : (
          trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="border rounded-lg p-4 flex flex-col gap-2 relative"
            >
              <div className="flex gap-4 items-center">
                <div className="relative w-24 h-24">
                  {trainer.image_url && (
                    <Image
                      src={trainer.image_url}
                      alt={trainer.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  )}
                </div>
                <div>
                  <div className="font-bold text-lg">{trainer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {trainer.activity}
                  </div>
                </div>
              </div>
              <div className="text-sm mt-2">{trainer.description}</div>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => startEdit(trainer)}
                >
                  Edytuj
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDelete(trainer.id)}
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
