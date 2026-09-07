"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ImageZoom } from "@/components/ui/image-zoom";

export type NocowankaHeroProps = {
  badge: string;
  titlePart1: string;
  titlePart2: string;
  description: string;
  meta: { icon: string; text: string }[];
  ctaPrimary: { label: string; href: string };
  image?: string;
  images?: string[];
  imageAlt?: string;
};

export function NocowankaHero({
  badge,
  titlePart1,
  titlePart2,
  description,
  meta,
  ctaPrimary,
  image,
  images,
  imageAlt,
}: NocowankaHeroProps) {
  const heroImages = (images?.filter(Boolean) ?? (image ? [image] : [])).slice(0, 2);
  const hasCarousel = heroImages.length >= 2;
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  );

  return (
    <section className="relative min-h-[70vh] flex items-center bg-stone-900 dark:bg-stone-950">
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(120 113 108 / 0.4) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-block px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider mb-6">
              {badge}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-white">{titlePart1}</span>{" "}
              <span className="text-primary">{titlePart2}</span>
            </h1>
            <p className="text-white/90 text-base md:text-lg mb-8 max-w-xl">
              {description}
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              {meta.map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 rounded-xl bg-stone-800/80 dark:bg-stone-800/60 border border-stone-700 px-4 py-3 text-white/90 text-sm"
                >
                  <span className="material-symbols-outlined text-primary text-lg shrink-0" aria-hidden>
                    {item.icon}
                  </span>
                  {item.text}
                </div>
              ))}
            </div>
            <Link
              href={ctaPrimary.href}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {ctaPrimary.label}
            </Link>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-full max-w-md aspect-square rounded-2xl bg-white dark:bg-stone-100 shadow-xl overflow-hidden flex items-center justify-center">
              {heroImages.length > 0 ? (
                hasCarousel ? (
                  <Carousel
                    opts={{ align: "start", loop: true }}
                    plugins={[autoplayPlugin.current as unknown as never]}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-0">
                      {heroImages.map((src, idx) => {
                        const alt = imageAlt
                          ? `${imageAlt} - zdjęcie ${idx + 1}`
                          : `Zdjęcie ${idx + 1}`;
                        return (
                          <CarouselItem key={`${src}-${idx}`} className="pl-0">
                            <ImageZoom src={src} alt={alt} title={imageAlt}>
                              <div className="relative w-full aspect-square">
                                <Image
                                  src={src}
                                  alt={alt}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 1024px) 100vw, 400px"
                                  priority={idx === 0}
                                />
                              </div>
                            </ImageZoom>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2 border-white/30 bg-black/30 text-white hover:bg-black/40 hover:text-white disabled:opacity-40" />
                    <CarouselNext className="right-3 top-1/2 -translate-y-1/2 border-white/30 bg-black/30 text-white hover:bg-black/40 hover:text-white disabled:opacity-40" />
                  </Carousel>
                ) : (
                  <ImageZoom
                    src={heroImages[0]!}
                    alt={imageAlt ?? ""}
                    title={imageAlt}
                    className="w-full h-full"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={heroImages[0]!}
                        alt={imageAlt ?? ""}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 400px"
                        priority
                      />
                    </div>
                  </ImageZoom>
                )
              ) : (
                <span className="material-symbols-outlined text-8xl text-stone-300 dark:text-stone-400">
                  nightlight
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
