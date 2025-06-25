"use client";
import {
  createGalleryImage,
  deleteGalleryImage,
  fetchGalleryImages,
  updateGalleryImage,
} from "@/app/actions";
import { GalleryImageType } from "@/app/types/types";
import { Label } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Item } from "@/components/ui/sortable-list";
import SortableList, { SortableListItem } from "@/components/ui/sortable-list";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function AdminGalleryPanel() {
  const [images, setImages] = useState<GalleryImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<GalleryImageType>>({
    order_number: 1,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [bucketImages, setBucketImages] = useState<Item[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [removingImage, setRemovingImage] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    name: string;
    id: string | number;
  } | null>(null);

  const [sortableItems, setSortableItems] = useState<Item[]>([]);

  useEffect(() => {
    async function loadGalleryFromDB() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await fetchGalleryImages();
        if (error) setError(error);
        if (data) {
          setSortableItems(
            data.map((img) => ({
              id: String(img.id),
              text: img.alt,
              checked: false,
              description: img.image_url,
            }))
          );
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadGalleryFromDB();
  }, []);

  function cancelEdit() {
    setEditingId(null);
    setForm({ order_number: 1 });
    setUploadedImages([]);
    setSelectedFiles([]);
  }

  // Helper to extract storage path from public URL
  function getStoragePathFromUrl(url: string): string | null {
    // Example: https://<project>.supabase.co/storage/v1/object/public/gallery/12345-filename.jpg
    const match = url.match(/\/gallery\/(.+)$/);
    return match ? match[1] : null;
  }

  async function uploadFileToSupabase(file: File): Promise<string | null> {
    try {
      const supabase = (await import("@/utils/supabase/client")).createClient();
      const filePath = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("gallery")
        .upload(filePath, file, { upsert: true });
      if (error) throw error;
      const { data: publicUrl } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);
      if (!publicUrl?.publicUrl) throw new Error("Could not get public URL");
      return publicUrl.publicUrl;
    } catch (err: any) {
      setError(err.message || "Upload failed");
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUploading(true);
    // Add spinner placeholder to list
    setSortableItems((prev) => [
      {
        id: "uploading",
        text: "Dodawanie...",
        checked: false,
        description: "",
        isPlaceholder: true,
      },
      ...prev,
    ]);
    let imageUrl = uploadedImages[0] || null;
    let oldImageUrl: string | null = null;
    // If a new file is selected, upload it
    if (selectedFiles.length > 0) {
      const url = await uploadFileToSupabase(selectedFiles[0]);
      if (!url) {
        setUploading(false);
        setSortableItems((prev) =>
          prev.filter((item) => item.id !== "uploading")
        );
        return;
      }
      imageUrl = url;
      if (editingId && uploadedImages[0]) {
        oldImageUrl = uploadedImages[0];
      }
    }
    // Set alt to file name if not editing
    let alt = form.alt;
    if (!editingId && selectedFiles.length > 0) {
      alt = selectedFiles[0].name.replace(/\.[^/.]+$/, "");
    }
    // Set order_number automatically if creating
    let order_number = form.order_number;
    if (!editingId) {
      order_number = images.length + 1;
    }
    if (!alt || !order_number || !imageUrl) {
      setError("Image, order, and alt are required.");
      setUploading(false);
      setSortableItems((prev) =>
        prev.filter((item) => item.id !== "uploading")
      );
      return;
    }
    const payload = {
      image_url: imageUrl,
      alt,
      order_number: Number(order_number),
    };
    if (editingId) {
      const { error } = await updateGalleryImage(editingId, payload);
      if (error) setError(error);
      else {
        // If a new file was uploaded, remove the old image from storage
        if (oldImageUrl) {
          const storagePath = getStoragePathFromUrl(oldImageUrl);
          if (storagePath) {
            const supabase = (
              await import("@/utils/supabase/client")
            ).createClient();
            await supabase.storage.from("gallery").remove([storagePath]);
          }
        }
        cancelEdit();
        const { data, error: fetchError } = await fetchGalleryImages();
        if (fetchError) setError(fetchError);
        setImages(data || []);
        setSortableItems(
          (data || []).map((img) => ({
            id: String(img.id),
            text: img.alt,
            checked: false,
            description: img.image_url,
          }))
        );
      }
    } else {
      const { error } = await createGalleryImage(payload);
      if (error) setError(error);
      else {
        setForm({ order_number: 1 });
        setUploadedImages([]);
        setSelectedFiles([]);
        const { data, error: fetchError } = await fetchGalleryImages();
        if (fetchError) setError(fetchError);
        setImages(data || []);
        setSortableItems(
          (data || []).map((img) => ({
            id: String(img.id),
            text: img.alt,
            checked: false,
            description: img.image_url,
          }))
        );
      }
    }
    setUploading(false);
    // Remove spinner placeholder (if still present)
    setSortableItems((prev) => prev.filter((item) => item.id !== "uploading"));
  }

  // Fetch all images from the gallery bucket
  const fetchGalleryBucketImages = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("gallery").list();
    if (!error && data) {
      const images: Item[] = data
        .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
        .map((file) => ({
          id: file.name,
          text: file.name,
          checked: false,
          description: supabase.storage.from("gallery").getPublicUrl(file.name)
            .data.publicUrl,
        }));
      setBucketImages(images);
    }
  }, []);

  // Upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    // Add spinner placeholder to list
    setSortableItems((prev) => [
      {
        id: "uploading",
        text: "Dodawanie...",
        checked: false,
        description: "",
        isPlaceholder: true,
      },
      ...prev,
    ]);
    try {
      const supabase = createClient();
      const filePath = `${Date.now()}-${file.name}`;
      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);
      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error("Could not get public URL");
      // 3. Fetch max order_number from gallery table
      const { data: galleryRows, error: fetchError } = await supabase
        .from("gallery")
        .select("order_number")
        .order("order_number", { ascending: false })
        .limit(1);
      if (fetchError) throw fetchError;
      const maxOrder =
        galleryRows && galleryRows.length > 0 ? galleryRows[0].order_number : 0;
      // 4. Insert new row into gallery table
      const alt = file.name.replace(/\.[^/.]+$/, "");
      const { error: insertError } = await createGalleryImage({
        image_url: publicUrl,
        alt,
        order_number: maxOrder + 1,
      });
      if (insertError) throw new Error(insertError);
      // 5. Refresh gallery list (fetchGalleryImages)
      const { data, error: fetchError2 } = await fetchGalleryImages();
      if (fetchError2) setUploadError(fetchError2);
      setSortableItems(
        (data || []).map((img) => ({
          id: String(img.id),
          text: img.alt,
          checked: false,
          description: img.image_url,
        }))
      );
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setSortableItems((prev) =>
        prev.filter((item) => item.id !== "uploading")
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove handler: removes from storage and DB
  const handleRemoveGalleryStorageImage = async (
    name: string,
    id?: string | number
  ) => {
    setRemovingImage(name);
    setRemoveError(null);
    try {
      // Remove from storage
      const supabase = createClient();
      const { error: storageError } = await supabase.storage
        .from("gallery")
        .remove([name]);
      if (storageError) throw storageError;
      // Remove from DB (id is the gallery table id)
      if (id) {
        const { error: dbError } = await deleteGalleryImage(Number(id));
        if (dbError) throw new Error(dbError);
      }
      // Refresh gallery list
      const { data, error: fetchError } = await fetchGalleryImages();
      if (fetchError) setRemoveError(fetchError);
      setSortableItems(
        data?.map((img) => ({
          id: String(img.id),
          text: img.alt,
          checked: false,
          description: img.image_url,
        })) || []
      );
    } catch (err: any) {
      setRemoveError(err.message || "Błąd usuwania pliku");
    } finally {
      setRemovingImage(null);
    }
  };

  // Handler for drag-and-drop reorder (DB sync)
  const handleReorder = async (newItems: Item[]) => {
    setUploading(true);
    setSortableItems(newItems);
    // Update order_number in DB for each image (using DB id)
    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      // item.id is the DB id (string)
      await updateGalleryImage(Number(item.id), { order_number: i + 1 });
    }
    // Refresh from DB
    const { data, error } = await fetchGalleryImages();
    if (!error && data) {
      setSortableItems(
        data.map((img) => ({
          id: String(img.id),
          text: img.alt,
          checked: false,
          description: img.image_url,
        }))
      );
    }
    setUploading(false);
  };

  useEffect(() => {
    fetchGalleryBucketImages();
  }, [fetchGalleryBucketImages]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Zarządzaj galerią</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <Label htmlFor="image">Dodaj obraz</Label>
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
      </form>
      <div className="mt-8">
        <h1 className="text-lg font-bold mb-4">Galeria</h1>
        <p className="text-sm text-gray-500 mb-4">
          {uploading
            ? "Zmieniam kolejność w galerii"
            : "Uporządkuj obrazy w galerii."}
        </p>
        {loading && (
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}
        <div
          className={
            uploading || removingImage || confirmDelete
              ? "pointer-events-none opacity-60 grayscale"
              : ""
          }
        >
          <SortableList
            items={sortableItems}
            setItems={setSortableItems}
            onReorder={setSortableItems}
            onReorderComplete={handleReorder}
            onCompleteItem={() => {}}
            renderItem={(
              item,
              order,
              onCompleteItem,
              onRemoveItem,
              handleDragStart,
              handleDragEnd
            ) =>
              item.isPlaceholder ? (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-white rounded shadow p-2 mb-2 opacity-70"
                >
                  <span className="flex items-center justify-center w-16 h-16">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </span>
                  <span className="flex-1 text-gray-400 font-medium">
                    {item.text}
                  </span>
                </div>
              ) : (
                <SortableListItem
                  key={item.id}
                  item={item}
                  order={order}
                  onCompleteItem={onCompleteItem}
                  onRemoveItem={() =>
                    setConfirmDelete({
                      name:
                        getStoragePathFromUrl(item.description) || item.text,
                      id: item.id,
                    })
                  }
                  handleDrag={() => {}}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                  disabled={uploading}
                  renderExtra={(item: Item) => (
                    <img
                      src={item.description}
                      alt={item.text}
                      className="w-16 h-16 object-cover rounded border border-gray-200 ml-2"
                    />
                  )}
                />
              )
            }
          />
        </div>
        {removeError && (
          <div className="text-xs text-red-600 mt-2">{removeError}</div>
        )}
        {/* Confirmation Dialog for Delete */}
        <Dialog
          open={!!confirmDelete}
          onOpenChange={(open) => {
            if (!open) setConfirmDelete(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Potwierdź usunięcie</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              Czy na pewno chcesz usunąć ten obraz? Tej operacji nie można
              cofnąć.
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                disabled={!!removingImage}
              >
                Anuluj
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (confirmDelete) {
                    await handleRemoveGalleryStorageImage(
                      confirmDelete.name,
                      confirmDelete.id
                    );
                    setConfirmDelete(null);
                  }
                }}
                disabled={!!removingImage}
              >
                Usuń
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
