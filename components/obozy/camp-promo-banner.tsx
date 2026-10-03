"use client";

import Image from "next/image";
import { ImageZoom } from "@/components/ui/image-zoom";

export type CampPromoBannerProps = {
  imageUrl: string;
  alt: string;
  /** Optional short caption shown below the image */
  caption?: string;
  /** Optional title in the zoom modal */
  title?: string;
};

/**
 * Compact mid-page promo photo with click-to-enlarge.
 * Caller should only render when imageUrl is present.
 */
export function CampPromoBanner({
  imageUrl,
  alt,
  caption,
  title,
}: CampPromoBannerProps) {
  const src = imageUrl.trim();
  if (!src) return null;

  return (
    <section className="py-10 md:py-14" aria-label={alt}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <ImageZoom src={src} alt={alt} title={title}>
          <button
            type="button"
            aria-label={`Powiększ: ${alt}`}
            className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-200 text-left outline-none ring-offset-2 transition-shadow focus-visible:ring-2 focus-visible:ring-primary dark:bg-stone-800"
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 672px) 100vw, 672px"
              unoptimized={src.startsWith("data:")}
            />
            <span
              className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/50 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            >
              <span className="material-symbols-outlined text-2xl text-white drop-shadow-md">
                zoom_in
              </span>
            </span>
          </button>
        </ImageZoom>
        {caption?.trim() ? (
          <p className="mt-3 text-center text-sm text-stone-500 dark:text-stone-400">
            {caption.trim()}
          </p>
        ) : null}
      </div>
    </section>
  );
}
