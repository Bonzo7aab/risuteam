"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GalleryAlbumCard } from "@/components/galeria/gallery-album-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { albumCountLabel } from "@/lib/galeria";
import { toast } from "sonner";

export default function AdminGaleriaPage() {
  const router = useRouter();
  const albums = useQuery(api.gallery.listAdminAlbums);
  const createCategory = useMutation(api.gallery.createCategory);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await createCategory({ name: newName, isActive: true });
      setNewName("");
      setCreateOpen(false);
      toast.success("Utworzono folder.");
      router.push(`/admin/galeria/${encodeURIComponent(created.slug)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się utworzyć folderu.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white md:text-3xl">
            Galeria
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Foldery ze zdjęciami i wideo widoczne na stronie publicznej.
          </p>
        </div>
        <Button
          className="h-9 rounded-lg px-3 text-sm font-semibold"
          onClick={() => setCreateOpen(true)}
        >
          <span className="material-symbols-outlined mr-1.5 text-[18px]" aria-hidden>
            create_new_folder
          </span>
          Nowy folder
        </Button>
      </div>

      {albums === undefined ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">Ładowanie…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <GalleryAlbumCard
              key={album.slug}
              href={`/admin/galeria/${encodeURIComponent(album.slug)}`}
              name={album.name}
              countLabel={albumCountLabel(album.imageCount, album.videoCount)}
              coverUrls={album.coverUrls}
              badge={album.isActive ? undefined : "Ukryty"}
            />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Nowy folder</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="folder-name">Nazwa</Label>
              <Input
                id="folder-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="np. Obóz letni 2026"
                className="mt-1.5"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={creating}
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={creating || !newName.trim()}>
                {creating ? "Tworzenie…" : "Utwórz"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
