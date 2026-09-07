"use client";

import { useCallback, useMemo, useState } from "react";
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
import { toast } from "sonner";

type TabId = "media" | "categories";

/** Radix Select forbids `value=""` on items; map to undefined for Convex. */
const GALLERY_NO_CATEGORY = "__none__";

async function uploadToConvexStorage(
  file: File,
  generateUploadUrl: () => Promise<string>
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

export default function AdminGaleriaPage() {
  const [tab, setTab] = useState<TabId>("media");

  const categories = useQuery(api.gallery.listCategoriesForAdmin);
  const items = useQuery(api.gallery.listItemsForAdmin);

  const generateUploadUrl = useMutation(api.gallery.generateUploadUrl);
  const createImageItemFromUpload = useMutation(api.gallery.createImageItemFromUpload);
  const createVideoItem = useMutation(api.gallery.createVideoItem);
  const updateItemMeta = useMutation(api.gallery.updateItemMeta);
  const reorderItems = useMutation(api.gallery.reorderItems);
  const removeItem = useMutation(api.gallery.removeItem);

  const createCategory = useMutation(api.gallery.createCategory);
  const updateCategory = useMutation(api.gallery.updateCategory);
  const removeCategory = useMutation(api.gallery.removeCategory);

  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoCategoryId, setNewVideoCategoryId] = useState<string>(GALLERY_NO_CATEGORY);
  const [creatingVideo, setCreatingVideo] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [uploadingImages, setUploadingImages] = useState(false);
  const [pendingGalleryImages, setPendingGalleryImages] = useState<File[]>([]);
  /** Remount file input after save/clear so React stays in sync (avoids uncontrolled→controlled warnings). */
  const [galleryImageInputKey, setGalleryImageInputKey] = useState(0);

  const sortedItems = useMemo(() => (items ?? []).slice().sort((a, b) => a.order - b.order), [items]);
  const sortedCategories = useMemo(
    () => (categories ?? []).slice().sort((a, b) => a.order - b.order),
    [categories]
  );

  const categoryLabelById = useMemo(() => {
    return new Map(sortedCategories.map((c) => [c._id, c.name]));
  }, [sortedCategories]);

  const handleGalleryImagesPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    setPendingGalleryImages(files);
  }, []);

  const handleSaveGalleryImages = useCallback(async () => {
    if (pendingGalleryImages.length === 0) return;
    setUploadingImages(true);
    try {
      for (const file of pendingGalleryImages) {
        const storageId = await uploadToConvexStorage(file, generateUploadUrl);
        await createImageItemFromUpload({
          storageId,
          title: file.name.replace(/\.[^/.]+$/, ""),
          categoryId: undefined,
          isPublished: true,
        });
      }
      setPendingGalleryImages([]);
      setGalleryImageInputKey((k) => k + 1);
      toast.success("Zapisano zdjęcia w galerii.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setUploadingImages(false);
    }
  }, [createImageItemFromUpload, generateUploadUrl, pendingGalleryImages]);

  const handleCreateVideo = useCallback(async () => {
    setCreatingVideo(true);
    try {
      await createVideoItem({
        videoUrl: newVideoUrl,
        title: newVideoTitle || undefined,
        categoryId:
          newVideoCategoryId === GALLERY_NO_CATEGORY
            ? undefined
            : (newVideoCategoryId as Id<"galleryCategories">),
        isPublished: true,
      });
      setNewVideoUrl("");
      setNewVideoTitle("");
      setNewVideoCategoryId(GALLERY_NO_CATEGORY);
      toast.success("Dodano wideo do galerii.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setCreatingVideo(false);
    }
  }, [createVideoItem, newVideoCategoryId, newVideoTitle, newVideoUrl]);

  const handleMoveItem = useCallback(
    async (id: Id<"galleryItems">, dir: "up" | "down") => {
      const idx = sortedItems.findIndex((i) => i._id === id);
      if (idx < 0) return;
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sortedItems.length) return;
      const next = sortedItems.map((x) => x._id);
      const tmp = next[idx];
      next[idx] = next[swapIdx];
      next[swapIdx] = tmp;
      try {
        await reorderItems({ orderedIds: next });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Wystąpił błąd.");
      }
    },
    [reorderItems, sortedItems]
  );

  const handleDeleteItem = useCallback(
    async (id: Id<"galleryItems">) => {
      try {
        await removeItem({ id });
        toast.success("Usunięto element.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Wystąpił błąd.");
      }
    },
    [removeItem]
  );

  const handleUpdateItem = useCallback(
    async (
      id: Id<"galleryItems">,
      patch: Omit<Parameters<typeof updateItemMeta>[0], "id">
    ) => {
      try {
        await updateItemMeta({ id, ...patch });
        toast.success("Zapisano zmiany.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Wystąpił błąd.");
      }
    },
    [updateItemMeta]
  );

  const handleCreateCategory = useCallback(async () => {
    setCreatingCategory(true);
    try {
      await createCategory({
        name: newCategoryName,
        isActive: true,
      });
      setNewCategoryName("");
      toast.success("Dodano kategorię.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setCreatingCategory(false);
    }
  }, [createCategory, newCategoryName]);

  const handleDeleteCategory = useCallback(
    async (id: Id<"galleryCategories">) => {
      try {
        await removeCategory({ id });
        toast.success("Usunięto kategorię.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Wystąpił błąd.");
      }
    },
    [removeCategory]
  );

  if (categories === undefined || items === undefined) {
    return <div className="text-muted-foreground">Ładowanie...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Galeria</h1>
          <p className="text-sm text-muted-foreground">
            Zarządzaj zdjęciami, wideo i kategoriami wyświetlanymi na stronie publicznej.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={tab === "media" ? "default" : "outline"}
            onClick={() => setTab("media")}
          >
            Media
          </Button>
          <Button
            variant={tab === "categories" ? "default" : "outline"}
            onClick={() => setTab("categories")}
          >
            Kategorie
          </Button>
        </div>
      </div>

      {tab === "media" ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div>
              <h2 className="font-semibold">Dodaj zdjęcia</h2>
              <p className="text-sm text-muted-foreground">
                Wybierz zdjęcia, potem zapisz je w galerii przyciskiem poniżej (domyślnie jako opublikowane).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="galleryImages">Zdjęcia</Label>
              <Input
                key={galleryImageInputKey}
                id="galleryImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryImagesPick}
                disabled={uploadingImages}
              />
              <p className="text-xs text-muted-foreground">
                Wybierz pliki, potem zapisz w bazie. Tytuł startowy ustawiamy z nazwy pliku — możesz go
                potem edytować na liście poniżej.
              </p>
              {pendingGalleryImages.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Liczba plików do zapisu: {pendingGalleryImages.length}
                </p>
              )}
            </div>
            <Button
              type="button"
              onClick={handleSaveGalleryImages}
              disabled={uploadingImages || pendingGalleryImages.length === 0}
            >
              {uploadingImages ? "Zapisywanie..." : "Zapisz zdjęcia w galerii"}
            </Button>
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-4 xl:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">Dodaj wideo</h2>
                <p className="text-sm text-muted-foreground">
                  Link do YouTube
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Link wideo</Label>
                <Input
                  id="videoUrl"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoTitle">Tytuł (opcjonalnie)</Label>
                <Input
                  id="videoTitle"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="np. Turniej 2026"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Kategoria (opcjonalnie)</Label>
                <Select value={newVideoCategoryId} onValueChange={setNewVideoCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bez kategorii" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GALLERY_NO_CATEGORY}>Bez kategorii</SelectItem>
                    {sortedCategories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCreateVideo} disabled={creatingVideo}>
                {creatingVideo ? "Dodawanie..." : "Dodaj wideo"}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-4 xl:col-span-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold">Elementy galerii</h2>
                <p className="text-sm text-muted-foreground">
                  Kolejność ma znaczenie (strzałki). Zmiany zapisują się przyciskiem „Zapisz”.
                </p>
              </div>
            </div>

            {sortedItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak elementów.</p>
            ) : (
              <div className="space-y-3">
                {sortedItems.map((it, idx) => (
                  <GalleryItemRow
                    key={it._id}
                    item={it}
                    index={idx}
                    total={sortedItems.length}
                    categoryLabelById={categoryLabelById}
                    categories={sortedCategories}
                    onMove={handleMoveItem}
                    onDelete={handleDeleteItem}
                    onSave={handleUpdateItem}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div>
              <h2 className="font-semibold">Dodaj kategorię</h2>
              <p className="text-sm text-muted-foreground">
                Kategorie są używane do filtrowania w galerii publicznej. Slug utworzy się automatycznie z
                nazwy.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="catName">Nazwa</Label>
              <Input
                id="catName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="np. Judo"
              />
            </div>
            <Button onClick={handleCreateCategory} disabled={creatingCategory}>
              {creatingCategory ? "Dodawanie..." : "Dodaj kategorię"}
            </Button>
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div>
              <h2 className="font-semibold">Kategorie</h2>
              <p className="text-sm text-muted-foreground">
                Zmieniaj nazwę, kolejność i aktywność; usuń tylko gdy kategoria nie jest używana.
              </p>
            </div>

            {sortedCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak kategorii.</p>
            ) : (
              <div className="space-y-3">
                {sortedCategories.map((c) => (
                  <CategoryRow
                    key={c._id}
                    category={c}
                    onSave={async (patch) => {
                      try {
                        await updateCategory({ id: c._id, ...patch });
                        toast.success("Zapisano zmiany.");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Wystąpił błąd.");
                      }
                    }}
                    onDelete={() => handleDeleteCategory(c._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryItemRow(props: {
  item: {
    _id: Id<"galleryItems">;
    type: "image" | "video";
    title?: string;
    isPublished: boolean;
    order: number;
    imageUrl?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    categoryId?: Id<"galleryCategories">;
  };
  index: number;
  total: number;
  categories: Array<{ _id: Id<"galleryCategories">; name: string }>;
  categoryLabelById: Map<Id<"galleryCategories">, string>;
  onMove: (id: Id<"galleryItems">, dir: "up" | "down") => Promise<void>;
  onDelete: (id: Id<"galleryItems">) => Promise<void>;
  onSave: (
    id: Id<"galleryItems">,
    patch: {
      title?: string;
      categoryId?: Id<"galleryCategories">;
      isPublished?: boolean;
      videoUrl?: string;
    }
  ) => Promise<void>;
}) {
  const { item, index, total } = props;
  const [title, setTitle] = useState(item.title ?? "");
  const [categoryId, setCategoryId] = useState<string>(
    item.categoryId ?? GALLERY_NO_CATEGORY
  );
  const [published, setPublished] = useState<boolean>(item.isPublished);
  const [videoUrl, setVideoUrl] = useState(item.videoUrl ?? "");
  const [metaEditorOpen, setMetaEditorOpen] = useState(false);

  const previewUrl = item.type === "image" ? item.imageUrl : item.thumbnailUrl;
  const selectedCategoryLabel =
    categoryId === GALLERY_NO_CATEGORY
      ? "Bez kategorii"
      : (props.categoryLabelById.get(categoryId as Id<"galleryCategories">) ?? "—");

  return (
    <div className="rounded-xl border p-4 flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start min-w-0 flex-1">
        <div className="relative h-40 w-full max-w-[13.5rem] shrink-0 rounded-xl bg-muted overflow-hidden flex items-center justify-center border border-border/60">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground px-2 text-center">Brak miniatury</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {item.type === "image" ? "Zdjęcie" : "Wideo"}
          </div>
          {!metaEditorOpen && (
            <>
              <div className="font-semibold text-base text-foreground leading-snug break-words">
                {title.trim() ? title : "Bez tytułu"}
              </div>
              <div className="text-sm text-muted-foreground">{selectedCategoryLabel}</div>
            </>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto touch-manipulation"
            onClick={() => setMetaEditorOpen((o) => !o)}
          >
            {metaEditorOpen ? "Ukryj edycję" : "Zmień tytuł i kategorię"}
          </Button>
          {metaEditorOpen && (
            <div className="space-y-3 pt-1 border-t border-border/60 mt-2">
              <div className="space-y-1">
                <Label className="text-xs" htmlFor={`gallery-title-${item._id}`}>
                  Tytuł
                </Label>
                <Input
                  id={`gallery-title-${item._id}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Kategoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bez kategorii" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GALLERY_NO_CATEGORY}>Bez kategorii</SelectItem>
                    {props.categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-1 gap-3 lg:max-w-md">
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={published} onCheckedChange={(v) => setPublished(Boolean(v))} />
            Opublikowane
          </label>
        </div>

        {item.type === "video" && (
          <div className="space-y-1">
            <Label className="text-xs" htmlFor={`gallery-video-${item._id}`}>
              Link wideo
            </Label>
            <Input
              id={`gallery-video-${item._id}`}
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 lg:flex-col lg:items-end shrink-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={index === 0}
            onClick={() => props.onMove(item._id, "up")}
          >
            ↑
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={index === total - 1}
            onClick={() => props.onMove(item._id, "down")}
          >
            ↓
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() =>
              props.onSave(item._id, {
                title,
                categoryId:
                  categoryId === GALLERY_NO_CATEGORY
                    ? undefined
                    : (categoryId as Id<"galleryCategories">),
                isPublished: published,
                videoUrl: item.type === "video" ? videoUrl : undefined,
              })
            }
          >
            Zapisz
          </Button>
          <Button variant="destructive" size="sm" onClick={() => props.onDelete(item._id)}>
            Usuń
          </Button>
        </div>
      </div>
    </div>
  );
}

function CategoryRow(props: {
  category: { _id: Id<"galleryCategories">; name: string; slug: string; order: number; isActive: boolean };
  onSave: (patch: { name?: string; order?: number; isActive?: boolean }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const { category } = props;
  const [name, setName] = useState(() => category.name ?? "");
  const [order, setOrder] = useState(String(category.order));
  const [isActive, setIsActive] = useState(category.isActive);

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Nazwa</Label>
          <Input value={name ?? ""} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Kolejność</Label>
          <Input value={order} onChange={(e) => setOrder(e.target.value)} inputMode="numeric" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(Boolean(v))} />
          Aktywna
        </label>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() =>
              props.onSave({
                name,
                order: Number.isFinite(Number(order)) ? Number(order) : category.order,
                isActive,
              })
            }
          >
            Zapisz
          </Button>
          <Button variant="destructive" size="sm" onClick={props.onDelete}>
            Usuń
          </Button>
        </div>
      </div>
    </div>
  );
}

