import { useRef, useState, useCallback, useEffect } from "react";
import { Trash2, X, ZoomIn } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./dialog";
import { createClient } from "@/utils/supabase/client";
import { shrinkImageToMaxSize } from "@/utils";

interface DialogImagesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImages: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
  bucket?: string;
}

export function DialogImages({
  open,
  onOpenChange,
  selectedImages,
  onChange,
  disabled = false,
  bucket = "camps",
}: DialogImagesProps) {
  const supabase = createClient();
  const [bucketImages, setBucketImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removingImage, setRemovingImage] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [localSelected, setLocalSelected] = useState<string[]>(selectedImages);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  // Fetch images from Supabase storage bucket
  const fetchBucketImages = useCallback(async () => {
    const { data, error } = await supabase.storage.from(bucket).list();
    if (!error && data) {
      const urls = data
        .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
        .map(
          (file) =>
            supabase.storage.from(bucket).getPublicUrl(file.name).data.publicUrl
        );
      setBucketImages(urls);
    }
  }, [supabase, bucket]);

  // Sync localSelected with selectedImages prop
  // and fetch images when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSelected(selectedImages);
      fetchBucketImages();
    }
  }, [open, selectedImages, fetchBucketImages]);

  // Upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      for (const file of files) {
        let fileToUpload = file;
        if (file.size > 3 * 1024 * 1024) {
          try {
            fileToUpload = await shrinkImageToMaxSize(file, 3);
          } catch (err) {
            setUploadError(
              `Nie można zmniejszyć pliku ${file.name} poniżej 3MB. Wybierz inny plik.`
            );
            continue;
          }
        }
        if (fileToUpload.size > 3 * 1024 * 1024) {
          setUploadError(
            `Plik ${fileToUpload.name} jest nadal większy niż 3MB po kompresji. Wybierz inny plik.`
          );
          continue;
        }
        const filePath = `${Date.now()}-${fileToUpload.name}`;
        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, fileToUpload, { upsert: false });
        if (error) throw error;
      }
      await fetchBucketImages();
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
      const match = url.match(/\/([^\/]+)$/);
      const fileName = match ? match[1] : null;
      if (!fileName) throw new Error("Nie można ustalić nazwy pliku");
      const { error } = await supabase.storage.from(bucket).remove([fileName]);
      if (error) throw error;
      await fetchBucketImages();
      setLocalSelected((imgs) => imgs.filter((img) => img !== url));
    } catch (err: any) {
      setRemoveError(err.message || "Błąd usuwania pliku");
    } finally {
      setRemovingImage(null);
    }
  };

  // Toggle image selection
  const toggleSelectImage = (url: string) => {
    setLocalSelected((prev) => {
      if (prev.includes(url)) {
        return prev.filter((img) => img !== url);
      } else {
        return [...prev, url];
      }
    });
  };

  // Confirm selection
  const confirmSelection = () => {
    onChange(localSelected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Dodaj zdjęcia obozu (max 3MB)</DialogTitle>
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleUpload}
            disabled={uploading || disabled}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary hover:file:bg-primary/80"
          />
          {uploading && <div className="text-blue-600 mt-1">Wgrywanie...</div>}
          {uploadError && (
            <div className="text-red-600 mt-1">{uploadError}</div>
          )}
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Wybierz zdjęcia z listy poniżej lub dodaj nowe.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 max-h-80 overflow-y-auto">
          {bucketImages.map((url) => (
            <div key={url} className="relative group">
              {/* Selection area: click image to select/deselect */}
              <button
                type="button"
                onClick={() => toggleSelectImage(url)}
                className={`border-2 rounded w-full h-24 flex items-center justify-center ${localSelected.includes(url) ? "border-blue-500" : "hover:border-risu-400"}`}
                disabled={removingImage === url || disabled}
                style={{ position: "relative" }}
              >
                <img
                  src={url}
                  alt="camp"
                  className="w-full h-24 object-cover rounded cursor-pointer"
                />
                {localSelected.includes(url) && (
                  <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs rounded px-1">
                    Wybrane
                  </span>
                )}
              </button>
              {/* Zoom icon in top-right corner, only visible on hover */}
              <button
                type="button"
                title="Powiększ zdjęcie"
                onClick={() => setEnlargedImage(url)}
                className="absolute bottom-1 right-1 bg-white/80 rounded-full p-1 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 hover:bg-gray-100 z-10"
                style={{ pointerEvents: "auto" }}
                tabIndex={-1}
                disabled={removingImage === url || disabled}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              {/* Remove icon in top-right corner */}
              <button
                type="button"
                title="Usuń zdjęcie"
                onClick={() => handleRemoveImage(url)}
                className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity border border-red-200 hover:bg-red-100 z-10"
                disabled={removingImage === url || disabled}
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
        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="default"
            onClick={confirmSelection}
            disabled={disabled}
          >
            Zatwierdź wybór
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={disabled}
          >
            Anuluj
          </Button>
        </div>
        {/* Enlarged image modal */}
        {enlargedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative">
              <img
                src={enlargedImage}
                alt="Enlarged"
                className="max-w-[90vw] max-h-[80vh] rounded shadow-lg border-2 border-white"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                className="absolute top-2 right-2 bg-white/80 rounded-full p-2 text-gray-800 hover:bg-white"
                onClick={() => setEnlargedImage(null)}
                aria-label="Zamknij powiększenie"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Click outside to close */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setEnlargedImage(null)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
