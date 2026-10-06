"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GalleryMediaGrid } from "@/components/galeria/gallery-media-grid";
import {
  albumCountLabel,
  isUncategorizedFolderSlug,
} from "@/lib/galeria";

export default function GaleriaFolderPage() {
  const params = useParams();
  const slug = decodeURIComponent((params.slug as string) ?? "");
  const album = useQuery(api.gallery.getPublicAlbum, slug ? { slug } : "skip");
  const items = useQuery(
    api.gallery.listGalleryPublic,
    slug
      ? isUncategorizedFolderSlug(slug)
        ? { uncategorizedOnly: true, limit: 500 }
        : { categorySlug: slug, limit: 500 }
      : "skip",
  );

  if (album === undefined || items === undefined) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-4 w-40 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div className="mt-4 h-8 w-64 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-4/3 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800"
              />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (album === null) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/galeria"
            className="text-sm font-medium text-stone-500 transition-colors hover:text-primary dark:text-stone-400"
          >
            Galeria
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-white">
            Nie znaleziono folderu.
          </h1>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <nav className="text-sm text-stone-500 dark:text-stone-400">
          <Link href="/galeria" className="font-medium transition-colors hover:text-primary">
            Galeria
          </Link>
          <span className="mx-2 text-stone-300 dark:text-stone-600">/</span>
          <span className="font-medium text-stone-900 dark:text-white">{album.name}</span>
        </nav>
        <div className="mt-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
            {album.name}
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {albumCountLabel(album.imageCount, album.videoCount)}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-16 text-center dark:border-stone-600">
            <span className="material-symbols-outlined mb-3 block text-5xl text-stone-400">
              photo_library
            </span>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              W tym folderze nie ma jeszcze zdjęć.
            </p>
          </div>
        ) : (
          <GalleryMediaGrid items={items} />
        )}
      </section>
    </div>
  );
}
