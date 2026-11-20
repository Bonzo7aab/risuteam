import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function adminInitials(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function AdminInitials({ text }: { text: string }) {
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[13px] font-bold tracking-tight text-primary"
      aria-hidden
    >
      {adminInitials(text)}
    </span>
  );
}

export function AdminFact({
  icon,
  children,
}: {
  icon: string;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] text-stone-600 dark:text-stone-300">
      <span className="material-symbols-outlined text-[15px] text-stone-400" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </span>
  );
}

export function AdminMobileCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "rounded-2xl border border-stone-200/80 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(28,22,13,0.04)] dark:border-white/10 dark:bg-[#241c14] dark:shadow-none",
        className
      )}
    >
      {children}
    </li>
  );
}

export const adminGhostIconClass =
  "size-8 text-stone-500 hover:bg-stone-100 hover:text-text-main dark:text-stone-400 dark:hover:bg-white/8 dark:hover:text-white";
