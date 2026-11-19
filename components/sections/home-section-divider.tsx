/**
 * Mobile-only break between homepage bands. Desktop keeps the existing
 * card layout, so the rule stays hidden from the md breakpoint up.
 */
export function HomeSectionDivider() {
  return (
    <div className="-mx-4 mb-8 pt-6 sm:-mx-6 md:hidden" aria-hidden>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-linear-to-r from-transparent via-primary/35 to-primary/80" />
        <span className="size-1.5 shrink-0 rotate-45 rounded-[1px] bg-primary shadow-[0_0_0_4px_rgba(244,157,37,0.14)]" />
        <span className="h-px flex-1 bg-linear-to-l from-transparent via-primary/35 to-primary/80" />
      </div>
    </div>
  );
}
