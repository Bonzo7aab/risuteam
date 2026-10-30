import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Section content surface: full-width / unboxed on mobile, card from md up. */
export const sectionSurface =
  "md:overflow-hidden md:rounded-2xl md:border md:border-stone-200/80 md:bg-white md:shadow-card dark:md:border-white/12 dark:md:bg-surface-dark dark:md:shadow-card-dark";

/** Softer stone variant used on older public sections. */
export const sectionSurfaceSoft =
  "md:overflow-hidden md:rounded-2xl md:border md:border-stone-200 md:bg-white md:shadow-soft dark:md:border-white/12 dark:md:bg-surface-dark";
