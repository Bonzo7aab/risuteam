import Link from "next/link";
import { ImageZoom } from "@/components/ui/image-zoom";

export type GalleryPreviewItem = {
  _id: string;
  imageUrl: string;
  title?: string;
  albumSlug: string;
  albumName: string;
};

export function GalleryPreview({ items }: { items: GalleryPreviewItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
          Podgląd
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-stone-900 dark:text-white">
          Ostatnie zdjęcia
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3">
        {items.map((item) => (
          <div key={item._id} className="group min-w-0">
            <ImageZoom
              src={item.imageUrl}
              alt={item.title ?? item.albumName}
              title={item.title ?? item.albumName}
              className="w-full"
            >
              <button
                type="button"
                aria-label={`Powiększ: ${item.title ?? item.albumName}`}
                className="aspect-4/3 w-full overflow-hidden rounded-xl bg-stone-100 text-left dark:bg-stone-800 md:rounded-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title ?? item.albumName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </button>
            </ImageZoom>
            <Link
              href={`/galeria/${encodeURIComponent(item.albumSlug)}`}
              className="mt-1.5 block truncate text-xs font-medium text-stone-500 transition-colors hover:text-primary dark:text-stone-400 dark:hover:text-primary"
            >
              {item.albumName}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
