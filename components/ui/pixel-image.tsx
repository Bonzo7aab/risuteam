"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type GridPreset = "6x4" | "8x8" | "8x3" | "4x6" | "3x8";

export type PixelImageProps = {
  src: string;
  alt: string;
  grid?: GridPreset;
  customGrid?: { rows: number; cols: number };
  grayscaleAnimation?: boolean;
  pixelFadeInDuration?: number;
  maxAnimationDelay?: number;
  colorRevealDelay?: number;
  className?: string;
  aspectRatio?: string;
};

const GRID_MAP: Record<GridPreset, { rows: number; cols: number }> = {
  "6x4": { rows: 4, cols: 6 },
  "8x8": { rows: 8, cols: 8 },
  "8x3": { rows: 3, cols: 8 },
  "4x6": { rows: 6, cols: 4 },
  "3x8": { rows: 8, cols: 3 },
};

export function PixelImage({
  src,
  alt,
  grid = "8x8",
  customGrid,
  grayscaleAnimation = true,
  pixelFadeInDuration = 1000,
  maxAnimationDelay = 1200,
  colorRevealDelay = 1500,
  className,
  aspectRatio = "aspect-[4/3]",
}: PixelImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [colorReveal, setColorReveal] = useState(false);

  const { rows, cols } = customGrid ?? GRID_MAP[grid];
  const total = rows * cols;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { rootMargin: "80px", threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !grayscaleAnimation) return;
    const t = setTimeout(() => setColorReveal(true), colorRevealDelay);
    return () => clearTimeout(t);
  }, [inView, grayscaleAnimation, colorRevealDelay]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden rounded-2xl bg-stone-200 dark:bg-stone-800", aspectRatio, className)}
      role="img"
      aria-label={alt}
    >
      <div
        className="absolute inset-0 grid w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {Array.from({ length: total }, (_, index) => {
          const r = Math.floor(index / cols);
          const c = index % cols;
          const delay = inView ? Math.random() * maxAnimationDelay : 0;
          const showColor = !grayscaleAnimation ? inView : colorReveal;
          return (
            <div
              key={index}
              className={cn(
                "bg-cover bg-no-repeat bg-center",
                "transition-opacity duration-700 ease-out",
                grayscaleAnimation && "transition-[filter] duration-700 ease-out"
              )}
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: `${cols * 100}% ${rows * 100}%`,
                backgroundPosition: `${(c / (cols - 1 || 1)) * 100}% ${(r / (rows - 1 || 1)) * 100}%`,
                opacity: inView ? 1 : 0,
                transitionDelay: `${delay}ms`,
                transitionDuration: `${pixelFadeInDuration}ms`,
                filter: grayscaleAnimation && !showColor ? "grayscale(1)" : "none",
                ...(grayscaleAnimation && showColor ? { transitionDelay: `${delay + colorRevealDelay}ms` } : {}),
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
