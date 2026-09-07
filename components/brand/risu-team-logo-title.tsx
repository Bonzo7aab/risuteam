"use client";

import Image from "next/image";
import { Highlighter } from "@/components/ui/highlighter";
import { cn } from "@/lib/utils";

const heroLogoCircle =
  "flex size-[7rem] shrink-0 items-center justify-center rounded-full bg-black/40 p-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/15 backdrop-blur-sm";

const formRowLogoCircle =
  "flex size-[5rem] shrink-0 items-center justify-center rounded-full bg-stone-200/90 p-1.5 shadow-md ring-1 ring-stone-300/80 backdrop-blur-sm dark:bg-black/40 dark:ring-white/15 dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]";

export type RisuTeamLogoTitleMarkProps = {
  className?: string;
  /** Default matches home hero; `formRow` is smaller for auth forms beside step indicators. */
  variant?: "hero" | "formRow";
  logoCircleClassName?: string;
  classNameImage?: string;
  titleClassName?: string;
  priority?: boolean;
};

export function RisuTeamLogoTitleMark({
  className,
  variant = "hero",
  logoCircleClassName,
  classNameImage = "size-full object-contain",
  titleClassName,
  priority = false,
}: RisuTeamLogoTitleMarkProps) {
  const circle = variant === "formRow" ? formRowLogoCircle : heroLogoCircle;
  const titleSize =
    variant === "formRow"
      ? "text-2xl font-bold tracking-tight drop-shadow-sm"
      : "text-4xl font-bold tracking-tight drop-shadow-sm";

  return (
    <div className={cn("flex flex-col items-center gap-2 text-center", className)}>
      <div className={cn(circle, logoCircleClassName)}>
        <Image
          src="/logoWithBorder.png"
          alt="Risu Team"
          width={288}
          height={288}
          className={classNameImage}
          priority={priority}
        />
      </div>
      <Highlighter
        action="underline"
        color="hsl(30, 91%, 55%)"
        strokeWidth={2}
        multiline={false}
        isView
      >
        <span className={cn(titleSize, titleClassName)}>Risu Team</span>
      </Highlighter>
    </div>
  );
}
