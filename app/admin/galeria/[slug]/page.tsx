"use client";

import { useCallback, useMemo, useState, type DragEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  albumCountLabel,
  isUncategorizedFolderSlug,
} from "@/lib/galeria";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

async function uploadToConvexStorage(
  file: File,
  generateUploadUrl: () => Promise<string>,
): Promise<Id<"_storage">> {
  const uploadUrl = await generateUploadUrl();
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) throw new Error("Upload nie powiódł się.");
  const { storageId } = (await res.json()) as { storageId?: string };
  if (!storageId) throw new Error("Brak storageId w odpowiedzi.");
  return storageId as Id<"_storage">;
}

export default function AdminGaleriaFolderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = decodeURIComponent((params.slug as string) ?? "");
  const uncategorized = isUncategorizedFolderSlug(slug);

  const album = useQuery(api.gallery.getAdminAlbum, slug ? { slug } : "skip");
  const albums = useQuery(api.gallery.listAdminAlbums);
  const items = useQuery(
    api.gallery.listItemsForAdmin,
    slug
      ? uncategorized
        ? { uncategorizedOnly: true }
        : album?._id
          ? { categoryId: album._id }
          : "skip"
      : "skip",
  );

  const generateUploadUrl = useMutation(api.gallery.generateUploadUrl);
  const createImageItemFromUpload = useMutation(api.gallery.createImageItemFromUpload);
  const createVideoItem = useMutation(api.gallery.createVideoItem);
  const updateItemMeta = useMutation(api.gallery.updateItemMeta);
  const reorderItems = useMutation(api.gallery.reorderItems);
  const removeItem = useMutation(api.gallery.removeItem);
  const updateCategory = useMutation(api.gallery.updateCategory);
  const removeCategory = useMutation(api.gallery.removeCategory);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [addingVideo, setAddingVideo] = useState(false);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [savingFolder, setSavingFolder] = useState(false);

  const folderId = album?._id ?? undefined;
  const displayName = folderName ?? album?.name ?? "";
  const otherFolders = useMemo(
    () => (albums ?? []).filter((entry) => !entry.isUncategorized && entry.slug !== slug),
    [albums, slug],
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const images = files.filter((file) => file.type.startsWith("image/"));
      if (images.length === 0) return;
      setUploading(true);
      try {
        for (let index = 0; index < images.length; index += 1) {
          const file = images[index]!;
          setUploadProgress(`${index + 1} / ${images.length}`);
          const storageId = await uploadToConvexStorage(file, generateUploadUrl);
          await createImageItemFromUpload({
            storageId,
            title: file.name.replace(/\.[^/.]+$/, ""),
            ...(folderId ? { categoryId: folderId } : {}),
            isPublished: true,
          });
        }
        toast.success(
          images.length === 1 ? "Dodano zdjęcie." : `Dodano ${images.length} zdjęć.`,
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload nie powiódł się.");
      } finally {
        setUploading(false);
        setUploadProgress(null);
      }
    },
    [createImageItemFromUpload, folderId, generateUploadUrl],
  );

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    void uploadFiles(Array.from(e.dataTransfer.files));
  };

  const handleMove = async (id: Id<"galleryItems">, dir: "up" | "down") => {
    if (!items) return;
    const index = items.findIndex((item) => item._id === id);
    const swap = dir === "up" ? index - 1 : index + 1;
    if (index < 0 || swap < 0 || swap >= items.length) return;
    const orderedIds = items.map((item) => item._id);
    const tmp = orderedIds[index]!;
    orderedIds[index] = orderedIds[swap]!;
    orderedIds[swap] = tmp;
    try {
      await reorderItems({ orderedIds });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się zmienić kolejności.");
    }
  };

  if (album === undefined) {
    return <p className="text-sm text-stone-500 dark:text-stone-400">Ładowanie…</p>;
  }

  if (album === null) {
    return (
      <div className="max-w-5xl space-y-3">
        <Link href="/admin/galeria" className="text-sm font-medium text-primary">
          Galeria
        </Link>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          Nie znaleziono folderu.
        </h1>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-5xl space-y-6">
      <nav className="text-sm text-stone-500 dark:text-stone-400">
        <Link href="/admin/galeria" className="font-medium transition-colors hover:text-primary">
          Galeria
        </Link>
        <span className="mx-2 text-stone-300 dark:text-stone-600">/</span>
        <span className="font-medium text-stone-900 dark:text-white">{album.name}</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {uncategorized ? (
            <>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                {album.name}
              </h1>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Zdjęcia bez przypisanego folderu. {albumCountLabel(album.imageCount, album.videoCount)}.
              </p>
            </>
          ) : (
            <div className="flex max-w-md flex-col gap-2">
              <Label htmlFor="folder-title" className="sr-only">
                Nazwa folderu
              </Label>
              <Input
                id="folder-title"
                value={displayName}
                onChange={(e) => setFolderName(e.target.value)}
                className="h-11 text-lg font-bold"
              />
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {albumCountLabel(album.imageCount, album.videoCount)}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!uncategorized && album._id ? (
            <>
              <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-stone-200 px-3 text-sm font-semibold dark:border-stone-700">
                <Checkbox
                  checked={album.isActive}
                  onCheckedChange={async (checked) => {
                    try {
                      await updateCategory({ id: album._id!, isActive: Boolean(checked) });
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Błąd zapisu.");
                    }
                  }}
                />
                Widoczny
              </label>
              <Button
                variant="outline"
                className="h-9 rounded-lg px-3 text-sm font-semibold"
                disabled={savingFolder || displayName.trim() === album.name}
                onClick={async () => {
                  setSavingFolder(true);
                  try {
                    await updateCategory({ id: album._id!, name: displayName.trim() });
                    toast.success("Zapisano nazwę folderu.");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Błąd zapisu.");
                  } finally {
                    setSavingFolder(false);
                  }
                }}
              >
                Zapisz nazwę
              </Button>
              <Button
                variant="destructive"
                className="h-9 rounded-lg px-3 text-sm font-semibold"
                onClick={async () => {
                  const hasItems = (items?.length ?? 0) > 0;
                  const ok = window.confirm(
                    hasItems
                      ? "Usunąć folder? Zdjęcia trafią do „Pozostałe”."
                      : "Usunąć ten folder?",
                  );
                  if (!ok) return;
                  try {
                    await removeCategory({
                      id: album._id!,
                      moveItemsToUncategorized: hasItems,
                    });
                    toast.success("Usunięto folder.");
                    router.push("/admin/galeria");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Nie udało się usunąć.");
                  }
                }}
              >
                Usuń folder
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-2xl border border-dashed px-4 py-8 text-center transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-stone-300 bg-white dark:border-stone-600 dark:bg-stone-900/80",
        )}
      >
        <span className="material-symbols-outlined mb-2 block text-4xl text-stone-400">
          cloud_upload
        </span>
        <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
          {uploading ? `Wgrywanie ${uploadProgress ?? ""}` : "Upuść zdjęcia tutaj"}
        </p>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          albo wybierz pliki z dysku — trafią prosto do tego folderu.
        </p>
        <div className="mt-4">
          <input
            id="folder-images"
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            className="sr-only"
            onChange={(e) => {
              void uploadFiles(Array.from(e.target.files ?? []));
              e.currentTarget.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg px-4 text-sm font-semibold"
            disabled={uploading}
            onClick={() => document.getElementById("folder-images")?.click()}
          >
            {uploading ? "Wgrywanie…" : "Wybierz zdjęcia"}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-soft dark:border-stone-700 dark:bg-stone-900/80 sm:p-5">
        <h2 className="text-sm font-bold text-stone-900 dark:text-white">Dodaj wideo</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/…"
            aria-label="Link wideo"
          />
          <Input
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Tytuł (opcjonalnie)"
            aria-label="Tytuł wideo"
          />
          <Button
            className="h-10"
            disabled={addingVideo || !videoUrl.trim()}
            onClick={async () => {
              setAddingVideo(true);
              try {
                await createVideoItem({
                  videoUrl,
                  title: videoTitle || undefined,
                  ...(folderId ? { categoryId: folderId } : {}),
                  isPublished: true,
                });
                setVideoUrl("");
                setVideoTitle("");
                toast.success("Dodano wideo.");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Nie udało się dodać wideo.");
              } finally {
                setAddingVideo(false);
              }
            }}
          >
            {addingVideo ? "Dodawanie…" : "Dodaj"}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-stone-700 dark:bg-stone-900/80">
        <div className="border-b border-stone-200 px-4 py-3 dark:border-stone-700 sm:px-5">
          <h2 className="text-sm font-bold text-stone-900 dark:text-white">Zawartość</h2>
        </div>
        {items === undefined ? (
          <p className="px-4 py-8 text-sm text-stone-500">Ładowanie…</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-stone-500 dark:text-stone-400">
            Ten folder jest pusty.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {items.map((item, index) => {
              const preview = item.type === "image" ? item.imageUrl : item.thumbnailUrl;
              return (
                <li key={item._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="h-20 w-full overflow-hidden rounded-xl bg-stone-100 sm:h-16 sm:w-24 sm:shrink-0 dark:bg-stone-800">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone-400">
                        <span className="material-symbols-outlined">
                          {item.type === "video" ? "play_circle" : "image"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Input
                      defaultValue={item.title ?? ""}
                      placeholder="Tytuł"
                      className="h-9"
                      onBlur={(e) => {
                        const next = e.target.value.trim();
                        if (next === (item.title ?? "")) return;
                        void updateItemMeta({ id: item._id, title: next }).catch((err) =>
                          toast.error(err instanceof Error ? err.message : "Błąd zapisu."),
                        );
                      }}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300">
                        <Checkbox
                          checked={item.isPublished}
                          onCheckedChange={(checked) => {
                            void updateItemMeta({
                              id: item._id,
                              isPublished: Boolean(checked),
                            }).catch((err) =>
                              toast.error(err instanceof Error ? err.message : "Błąd zapisu."),
                            );
                          }}
                        />
                        Opublikowane
                      </label>
                      <Select
                        value={item.categoryId ?? "pozostale"}
                        onValueChange={(value) => {
                          void updateItemMeta({
                            id: item._id,
                            categoryId:
                              value === "pozostale"
                                ? null
                                : (value as Id<"galleryCategories">),
                          })
                            .then(() => toast.success("Przeniesiono."))
                            .catch((err) =>
                              toast.error(err instanceof Error ? err.message : "Błąd przenoszenia."),
                            );
                        }}
                      >
                        <SelectTrigger className="h-8 w-44 text-xs">
                          <SelectValue placeholder="Folder" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pozostale">Pozostałe</SelectItem>
                          {album._id ? (
                            <SelectItem value={album._id}>{album.name}</SelectItem>
                          ) : null}
                          {otherFolders.map((folder) =>
                            folder._id ? (
                              <SelectItem key={folder._id} value={folder._id}>
                                {folder.name}
                              </SelectItem>
                            ) : null,
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => void handleMove(item._id, "up")}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={index === items.length - 1}
                      onClick={() => void handleMove(item._id, "down")}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (!window.confirm("Usunąć ten plik z galerii?")) return;
                        void removeItem({ id: item._id })
                          .then(() => toast.success("Usunięto."))
                          .catch((err) =>
                            toast.error(err instanceof Error ? err.message : "Błąd usuwania."),
                          );
                      }}
                    >
                      Usuń
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
