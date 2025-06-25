"use client";
import Link from "next/link";
import { cn } from "@/utils";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface SidebarNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: SidebarNavItem[];
  activeHref: string;
}

export function SidebarHorizontal({ items, activeHref }: SidebarProps) {
  const listRef = React.useRef<HTMLUListElement>(null);
  const [showArrows, setShowArrows] = React.useState(false);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // Check for overflow and scroll position
  const checkScroll = React.useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setShowArrows(el.scrollWidth > el.clientWidth);
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    checkScroll();
    const el = listRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  // Scroll by a fixed amount
  const scrollBy = (amount: number) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <nav
      className={cn(
        // Responsive: show only on mobile/small screens
        "relative block md:hidden w-full px-2 py-4",
        // Horizontal scroll
        "overflow-x-visible whitespace-nowrap"
      )}
      aria-label="Main navigation"
    >
      {showArrows && canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          className="absolute left-5 top-1/2 -translate-y-1/2 z-10 rounded-full bg-risu-400 border-risu-300 p-1"
          onClick={() => scrollBy(-100)}
          tabIndex={0}
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
      )}
      {showArrows && canScrollRight && (
        <button
          type="button"
          aria-label="Scroll right"
          className="absolute right-5 top-1/2 -translate-y-1/2 z-10 rounded-full bg-risu-400 border-risu-300 p-1"
          onClick={() => scrollBy(100)}
          tabIndex={0}
        >
          <ChevronRight className="w-6 h-6 text-black" />
        </button>
      )}
      <ul
        ref={listRef}
        className="flex flex-row gap-4 min-w-full overflow-x-scroll scrollbar-hide px-2"
        style={{ scrollBehavior: "smooth" }}
      >
        {items.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <li
              key={item.href}
              className="w-20 min-w-[5rem] max-w-[5rem] flex-shrink-0 flex-grow-0 flex flex-col items-center py-1"
            >
              <Link
                href={item.href}
                tabIndex={0}
                className={cn(
                  "group flex flex-col items-center justify-center focus:outline-none",
                  "transition-all duration-200 ease-in-out"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <motion.span
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2",
                    isActive
                      ? " border-risu-400 text-risu-400"
                      : "bg-black border-gray-400 text-white",
                    "transition-colors duration-200"
                  )}
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {item.icon}
                </motion.span>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isActive ? "text-risu-400" : "group-hover:text-neutral-700"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Usage example (same as Sidebar):
// <SidebarHorizontal
//   items={[
//     { label: "Trenerzy", href: "/admin?section=trainers", icon: <Users /> },
//     { label: "Lokalizacja", href: "/admin?section=lokalizacja", icon: <MapPin /> },
//     { label: "Grafik", href: "/admin?section=grafik", icon: <Calendar /> },
//   ]}
//   activeHref={currentSectionHref}
// />
