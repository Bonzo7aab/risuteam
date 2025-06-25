"use client";

import * as React from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/utils";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BlurGalleryProps extends MotionProps {
  images: { src: string; alt?: string }[];
  className?: string;
}

export function BlurGallery({ className, images, ...props }: BlurGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((prev) =>
        prev === 0 ? images.length - 1 : (prev || 0) - 1
      );
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((prev) =>
        prev === images.length - 1 ? 0 : (prev || 0) + 1
      );
    }
  };

  return (
    <Dialog
      open={selectedIndex !== null}
      onOpenChange={(open) => !open && setSelectedIndex(null)}
    >
      <motion.ul
        className={cn(
          "mx-auto flex-wrap flex w-full gap-4 p-4 justify-center",
          className
        )}
        {...props}
      >
        {images.map((image, index) => (
          <DialogTrigger key={index} asChild>
            <motion.li
              className="relative h-48 w-48 cursor-pointer overflow-hidden rounded-lg"
              animate={{
                filter:
                  hoveredIndex !== null && hoveredIndex !== index
                    ? "blur(5px)"
                    : "blur(0px)",
                opacity:
                  hoveredIndex !== null && hoveredIndex !== index ? 0.8 : 1,
                scale: hoveredIndex === index ? 1.08 : 1,
                boxShadow:
                  hoveredIndex === index
                    ? "0 5px 15px rgba(0,0,0,0.4)"
                    : "0 2px 5px rgba(0,0,0,0.2)",
                zIndex: hoveredIndex === index ? 1 : 0,
              }}
              transition={{
                duration: 0.4,
                ease: [0.43, 0.13, 0.23, 0.96],
                scale: { duration: 0.3 },
                opacity: { duration: 0.25 },
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setSelectedIndex(index)}
            >
              <Image
                src={image.src}
                alt={image.alt || `Gallery image ${index + 1}`}
                fill
                quality={75}
                priority={false}
                className="h-full w-full object-cover"
              />
            </motion.li>
          </DialogTrigger>
        ))}
      </motion.ul>

      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none [&>button]:hidden">
        {selectedIndex !== null && (
          <>
            <div className="relative flex justify-center">
              <div className="relative">
                <div className="absolute top-4 left-4 z-10 text-white bg-black/50 px-3 py-1 rounded-md">
                  {images[selectedIndex].alt ||
                    `Gallery image ${selectedIndex + 1}`}
                </div>
                <Image
                  src={images[selectedIndex].src}
                  alt={
                    images[selectedIndex].alt ||
                    `Gallery image ${selectedIndex + 1}`
                  }
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-auto max-h-[85vh] object-contain"
                />
                <Button
                  variant="default"
                  size="icon"
                  className="absolute top-4 right-4 bg-black/50 hover:bg-gray-400 transition-colors duration-200 hover:text-black text-white rounded-full"
                  onClick={() => setSelectedIndex(null)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export type { BlurGalleryProps };
