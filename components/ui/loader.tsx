import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Drop-in for shadcnloaders.com API. The published `shadcn-loaders` CLI package
 * is not available on npm; this implements the `dots-rotate` variant in the same style.
 * Dots use `bg-primary` so they follow light/dark theme (`:root` / `.dark` in globals.css).
 */
const loaderVariants = cva("inline-block shrink-0", {
  variants: {
    variant: {
      "dots-rotate": "",
    },
    size: {
      sm: "h-6 w-6",
      md: "h-8 w-8",
      lg: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "dots-rotate",
    size: "md",
  },
});

export interface LoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loaderVariants> {}

const dotCount = 8;

export function Loader({
  className,
  variant = "dots-rotate",
  size = "md",
  ...props
}: LoaderProps) {
  if (variant !== "dots-rotate") {
    return null;
  }

  const px =
    size === "sm" ? 24 : size === "lg" ? 40 : 32;
  const radius = px * 0.32;
  const dot = Math.max(3, px * 0.14);

  return (
    <div
      role="status"
      aria-label="Ładowanie"
      className={cn(loaderVariants({ variant, size }), className)}
      style={{ width: px, height: px }}
      {...props}
    >
      <div
        className="relative h-full w-full animate-spin"
        style={{ animationDuration: "1.05s" }}
      >
        {Array.from({ length: dotCount }, (_, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full bg-primary"
            style={{
              width: dot,
              height: dot,
              marginLeft: -dot / 2,
              marginTop: -dot / 2,
              transform: `rotate(${i * (360 / dotCount)}deg) translateY(-${radius}px)`,
              opacity: 0.35 + (i / dotCount) * 0.65,
            }}
          />
        ))}
      </div>
    </div>
  );
}
