"use client";

import Image from "next/image";
import { Highlighter } from "@/components/ui/highlighter";
import { cn } from "@/lib/utils";

const heroLogoCircle =
  "flex size-28 shrink-0 items-center justify-center rounded-full bg-black/40 p-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/15 backdrop-blur-xs";

const formRowLogoCircle =
  "flex size-20 shrink-0 items-center justify-center rounded-full bg-stone-200/90 p-1.5 shadow-md ring-1 ring-stone-300/80 backdrop-blur-xs dark:bg-black/40 dark:ring-white/15 dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]";

export type RisuTeamLogoTitleMarkProps = {
  className?: string;
  /** Default matches home hero; `formRow` is smaller for auth forms. */
  variant?: "hero" | "formRow";
  /** Use a crisp CSS underline instead of the hand-drawn highlighter (auth pages). */
  underlineStyle?: "highlighter" | "solid";
  logoCircleClassName?: string;
  classNameImage?: string;
  titleClassName?: string;
  priority?: boolean;
};

export function RisuTeamLogoTitleMark({
  className,
  variant = "hero",
  underlineStyle = "highlighter",
  logoCircleClassName,
  classNameImage = "size-full object-contain",
  titleClassName,
  priority = false,
}: RisuTeamLogoTitleMarkProps) {
  const circle = variant === "formRow" ? formRowLogoCircle : heroLogoCircle;
  const titleSize =
    variant === "formRow"
      ? "text-2xl font-bold tracking-tight drop-shadow-xs"
      : "text-4xl font-bold tracking-tight drop-shadow-xs";

  const title =
    underlineStyle === "solid" ? (
      <span
        className={cn(
          "relative inline-block",
          titleSize,
          titleClassName
        )}
      >
        Risu Team
        <span
          className="absolute inset-x-0 -bottom-0.5 h-[2.5px] rounded-full bg-primary"
          aria-hidden
        />
      </span>
    ) : (
      <Highlighter
        action="underline"
        color="hsl(30, 91%, 55%)"
        strokeWidth={2}
        multiline={false}
        isView
      >
        <span className={cn(titleSize, titleClassName)}>Risu Team</span>
      </Highlighter>
    );

  return (
    <div
      className={cn("flex flex-col items-center gap-2 text-center", className)}
    >
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
      {title}
    </div>
  );
}
