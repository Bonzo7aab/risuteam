"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type ImageZoomProps = {
  src: string;
  alt: string;
  /** Optional title shown in the zoom view. */
  title?: string;
  /** Render a custom trigger (thumbnail/card). */
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * Image zoom (modal) inspired by Kibo UI.
 * Docs: https://www.kibo-ui.com/components/image-zoom
 */
export function ImageZoom({
  src,
  alt,
  title,
  children,
  className,
  contentClassName,
}: ImageZoomProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className={cn("cursor-zoom-in", className)}>{children}</div>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-w-[96vw] w-[96vw] sm:w-[92vw] md:w-[88vw] lg:w-[78vw] xl:w-[70vw]",
          "p-0 border-0 bg-transparent shadow-none",
          "max-h-[90vh] overflow-hidden",
          contentClassName
        )}
      >
        <DialogTitle className="sr-only">{title ?? alt}</DialogTitle>
        <div className="relative w-full h-[90vh] sm:h-[86vh] rounded-2xl overflow-hidden bg-black/40 backdrop-blur-md">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 96vw, (max-width: 1024px) 88vw, 70vw"
            className="object-contain"
            priority={false}
          />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-4">
            <div className="min-w-0">
              {title ? (
                <div className="text-white/95 font-bold truncate">{title}</div>
              ) : null}
              <div className="text-white/70 text-xs font-medium truncate">{alt}</div>
            </div>

            <DialogClose asChild>
              <button
                type="button"
                aria-label="Zamknij podgląd"
                className="shrink-0 inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 backdrop-blur px-3 py-2 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

