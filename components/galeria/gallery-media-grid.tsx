import { ImageZoom } from "@/components/ui/image-zoom";

export type GalleryMediaItem = {
  _id: string;
  type: "image" | "video";
  title?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
};

export function GalleryMediaGrid({ items }: { items: GalleryMediaItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
      {items.map((item) =>
        item.type === "image" ? (
          <ImageZoom
            key={item._id}
            src={item.imageUrl ?? ""}
            alt={item.title ?? "Zdjęcie"}
            title={item.title ?? ""}
            className="w-full min-w-0"
          >
            <button
              type="button"
              aria-label={`Powiększ: ${item.title ?? "Zdjęcie"}`}
              className="group relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-stone-100 text-left dark:bg-stone-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl ?? ""}
                alt={item.title ?? "Zdjęcie"}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {item.title ? (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-3 py-2.5 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {item.title}
                </span>
              ) : null}
            </button>
          </ImageZoom>
        ) : (
          <a
            key={item._id}
            href={item.videoUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            aria-label={`Otwórz wideo: ${item.title ?? "Wideo"}`}
            className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800"
          >
            {item.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbnailUrl}
                alt={item.title ?? "Wideo"}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="h-full w-full bg-stone-200 dark:bg-stone-800" />
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-white/95 text-primary shadow-soft">
                <span className="material-symbols-outlined text-3xl" aria-hidden>
                  play_arrow
                </span>
              </span>
            </span>
            {item.title ? (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-3 py-2.5 text-sm font-semibold text-white">
                {item.title}
              </span>
            ) : null}
          </a>
        ),
      )}
    </div>
  );
}
