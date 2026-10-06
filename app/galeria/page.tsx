"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GalleryAlbumCard } from "@/components/galeria/gallery-album-card";
import { albumCountLabel } from "@/lib/galeria";

export default function GaleriaPage() {
  const albums = useQuery(api.gallery.listPublicAlbums);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-10 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
            Risu Team
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 dark:text-white md:text-4xl">
            Galeria
          </h1>
          <p className="mt-3 text-base leading-relaxed text-stone-500 dark:text-stone-400">
            Zdjęcia i nagrania z zajęć, obozów i wydarzeń — uporządkowane w folderach.
          </p>
        </div>

        {albums === undefined ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900/80"
              >
                <div className="aspect-4/3 animate-pulse bg-stone-100 dark:bg-stone-800" />
                <div className="space-y-2 px-4 py-3.5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
                </div>
              </div>
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-16 text-center dark:border-stone-600">
            <span className="material-symbols-outlined mb-3 block text-5xl text-stone-400">
              photo_library
            </span>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Galeria jest pusta. Wkrótce pojawią się tu zdjęcia z zajęć i obozów.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <GalleryAlbumCard
                key={album.slug}
                href={`/galeria/${encodeURIComponent(album.slug)}`}
                name={album.name}
                countLabel={albumCountLabel(album.imageCount, album.videoCount)}
                coverUrls={album.coverUrls}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
