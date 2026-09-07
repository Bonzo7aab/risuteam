"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { PixelImage } from "@/components/ui/pixel-image";

export type CampGalleryProps = {
  title: string;
  mainImage: { src: string; alt: string };
  gridImages: { src: string; alt: string }[];
};

export function CampGallery({
  title,
  mainImage,
  gridImages,
}: CampGalleryProps) {
  return (
    <section className="py-16 md:py-24 bg-stone-50 dark:bg-stone-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-12 text-center">
          {title}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <BlurFade delay={0.1} inView inViewMargin="-40px" blur="8px" duration={0.5} className="lg:col-span-2">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-md">
              <PixelImage
                src={mainImage.src}
                alt={mainImage.alt}
                customGrid={{ rows: 6, cols: 8 }}
                grayscaleAnimation
                className="absolute inset-0 w-full h-full rounded-2xl"
                aspectRatio=""
              />
            </div>
          </BlurFade>
          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            {gridImages.slice(0, 4).map((img, i) => (
              <BlurFade
                key={i}
                delay={0.15 + i * 0.06}
                inView
                inViewMargin="-40px"
                blur="6px"
                duration={0.45}
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-md">
                  <PixelImage
                    src={img.src}
                    alt={img.alt}
                    customGrid={{ rows: 6, cols: 6 }}
                    grayscaleAnimation
                    className="absolute inset-0 w-full h-full rounded-2xl"
                    aspectRatio=""
                  />
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
