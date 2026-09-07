"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BlurFade } from "@/components/ui/blur-fade";
import { ImageZoom } from "@/components/ui/image-zoom";
import { PixelImage } from "@/components/ui/pixel-image";
import { cn } from "@/lib/utils";

/** Show a full grid first; load more for large galleries from Convex. */
const INITIAL_VISIBLE = 48;
const LOAD_MORE_STEP = 24;

export default function GaleriaPage() {
  const categories = useQuery(api.gallery.listCategoriesPublic);
  const allItems = useQuery(api.gallery.listGalleryPublic, { limit: 500 });

  const [active, setActive] = useState<string>("Wszystkie");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const categoriesWithSynthetic = [
    { id: "Wszystkie", label: "Wszystkie", icon: "grid_view" },
    ...(categories ?? []).map((c) => ({
      id: c.slug,
      label: c.name,
      icon: "photo_library",
    })),
    { id: "Wideo", label: "Wideo", icon: "play_circle" },
  ];

  const categoryById = new Map((categories ?? []).map((c) => [c._id, c]));

  const filtered =
    active === "Wszystkie"
      ? (allItems ?? [])
      : active === "Wideo"
        ? (allItems ?? []).filter((i) => i.type === "video")
        : (allItems ?? []).filter((i) => {
            const cat = i.categoryId ? categoryById.get(i.categoryId) : undefined;
            return cat?.slug === active;
          });

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = () => {
    setVisibleCount((n) => Math.min(n + LOAD_MORE_STEP, filtered.length));
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12 relative">

          <h1 className="text-3xl md:text-4xl font-black leading-[1.1] tracking-tight text-text-main dark:text-white mb-4">
            Uchwyciliśmy każdy <span className="text-primary">uśmiech</span>
          </h1>
          <p className="text-lg text-text-light dark:text-stone-400 max-w-2xl mx-auto">
            Najlepsze momenty z zajęć, obozów i turniejów. Energia, zaangażowanie i radość!
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categoriesWithSynthetic.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActive(cat.id);
                setVisibleCount(INITIAL_VISIBLE);
              }}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors",
                active === cat.id
                  ? "bg-stone-800 dark:bg-stone-700 text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-text-main dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
              )}
            >
              <span className="material-symbols-outlined text-lg">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {visibleItems.map((item, idx) => (
                <BlurFade
                  key={item._id}
                  delay={0.1 + idx * 0.05}
                  inView
                  inViewMargin="-30px"
                  blur="8px"
                  duration={0.5}
                >
                  {item.type === "image" ? (
                    <ImageZoom
                      src={item.imageUrl ?? ""}
                      alt={item.title ?? "Zdjęcie"}
                      title={item.title ?? ""}
                    >
                      <button
                        type="button"
                        aria-label={`Powiększ: ${item.title ?? "Zdjęcie"}`}
                        className="relative group overflow-hidden rounded-2xl aspect-[4/3] bg-stone-100 dark:bg-stone-800 w-full text-left"
                      >
                        <PixelImage
                          src={item.imageUrl ?? ""}
                          alt={item.title ?? "Zdjęcie"}
                          grid="6x4"
                          grayscaleAnimation
                          className="absolute inset-0 w-full h-full rounded-2xl group-hover:scale-105 transition-transform duration-500"
                          aspectRatio=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 z-10">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            {item.categoryId ? categoryById.get(item.categoryId)?.name ?? "" : ""}
                          </span>
                          <span className="text-white font-bold">{item.title ?? ""}</span>
                        </div>
                      </button>
                    </ImageZoom>
                  ) : (
                    <a
                      href={item.videoUrl ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Otwórz wideo: ${item.title ?? "Wideo"}`}
                      className="relative group overflow-hidden rounded-2xl aspect-[4/3] bg-stone-100 dark:bg-stone-800 w-full text-left block"
                    >
                      {item.thumbnailUrl ? (
                        <PixelImage
                          src={item.thumbnailUrl}
                          alt={item.title ?? "Wideo"}
                          grid="6x4"
                          grayscaleAnimation
                          className="absolute inset-0 w-full h-full rounded-2xl group-hover:scale-105 transition-transform duration-500"
                          aspectRatio=""
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-100 dark:from-stone-900 dark:to-stone-800" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                        <div className="flex size-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg">
                          <span className="material-symbols-outlined text-3xl">play_arrow</span>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 z-10">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          {item.categoryId ? categoryById.get(item.categoryId)?.name ?? "" : ""}
                        </span>
                        <span className="text-white font-bold">{item.title ?? ""}</span>
                      </div>
                    </a>
                  )}
                </BlurFade>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  onClick={loadMore}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-white font-bold shadow-lg hover:bg-primary-hover transition-all"
                >
                  Załaduj więcej
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-600 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-stone-400 mb-4 block">
              photo_library
            </span>
            <p className="text-text-light dark:text-stone-400">
              Brak zdjęć w tej kategorii. Sprawdź pozostałe filtry.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
