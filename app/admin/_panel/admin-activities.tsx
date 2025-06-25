"use client";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";

import { ActivityType } from "@/app/types/types";
import { Button, Input, Label, Textarea } from "@/components/ui";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { Trash2 } from "lucide-react";

import {
  fetchActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "@/app/actions";

export default function AdminActivitiesPanel() {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<ActivityType>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [bucketImages, setBucketImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [removingImage, setRemovingImage] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadActivities() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await fetchActivities();
        if (error) setError(error);
        setActivities(data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(activity: ActivityType) {
    setEditingId(activity.id);
    setForm(activity);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({});
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    const { error } = await deleteActivity(id);
    if (error) setError(error);
    else {
      const { data, error: fetchError } = await fetchActivities();
      if (fetchError) setError(fetchError);
      setActivities(data || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.image_url || !form.description) {
      setError("Name, image URL, and description are required.");
      return;
    }
    if (editingId) {
      // Update
      const { error } = await updateActivity(editingId, form);
      if (error) setError(error);
      else {
        cancelEdit();
        const { data, error: fetchError } = await fetchActivities();
        if (fetchError) setError(fetchError);
        setActivities(data || []);
      }
    } else {
      // Insert
      const { error } = await createActivity(form);
      if (error) setError(error);
      else {
        setForm({});
        const { data, error: fetchError } = await fetchActivities();
        if (fetchError) setError(fetchError);
        setActivities(data || []);
      }
    }
  }

  // Fetch images from Supabase storage 'activities' bucket
  const fetchActivityImages = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("activities").list();
    if (!error && data) {
      const urls = data
        .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
        .map(
          (file) =>
            supabase.storage.from("activities").getPublicUrl(file.name).data
              .publicUrl
        );
      setBucketImages(urls);
    }
  }, []);

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
        .from("activities")
        .upload(filePath, file, { upsert: true });
      if (error) throw error;
      await fetchActivityImages(); // Refresh list
      // Optionally, auto-select the uploaded image:
      const { data: publicUrl } = supabase.storage
        .from("activities")
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
        .from("activities")
        .remove([fileName]);
      if (error) throw error;
      await fetchActivityImages();
      if (form.image_url === url) setForm({ ...form, image_url: undefined });
    } catch (err: any) {
      setRemoveError(err.message || "Błąd usuwania pliku");
    } finally {
      setRemovingImage(null);
    }
  };

  useEffect(() => {
    if (imageDialogOpen) fetchActivityImages();
  }, [imageDialogOpen, fetchActivityImages]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Zarządzaj rodzajami zajęć</h2>
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
        <div className="md:col-span-2">
          <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Wybierz zdjęcie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Wybierz zdjęcie aktywności</DialogTitle>
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
                        alt="activity"
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
            required
          />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button
            type="submit"
            variant="default"
            className="bg-risu-300 hover:bg-risu-600"
          >
            {editingId ? "Zapisz zmiany" : "Dodaj rodzaj zajęć"}
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
        ) : activities.length === 0 ? (
          <div>Brak rodzajów zajęć.</div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="border rounded-lg p-4 flex flex-col gap-2 relative"
            >
              <div className="flex gap-4 items-center">
                <div className="relative w-24 h-24">
                  {activity.image_url && (
                    <Image
                      src={activity.image_url}
                      alt={activity.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  )}
                </div>
                <div>
                  <div className="font-bold text-lg">{activity.name}</div>
                </div>
              </div>
              <div className="text-sm mt-2">{activity.description}</div>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => startEdit(activity)}
                >
                  Edytuj
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDelete(activity.id)}
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
