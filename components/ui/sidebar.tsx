"use client";
import { motion } from "framer-motion";
import Link from "next/link";

import { cn } from "@/utils";

import { SidebarHorizontal } from "./sidebar-horizontal";

interface SidebarNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: SidebarNavItem[];
  activeHref: string;
}

export function Sidebar({ items, activeHref }: SidebarProps) {
  return (
    <aside className="md:w-56 border-r border-border/40 shadow-xl backdrop-blur-lg flex flex-col md:py-8 gap-2">
      <nav className="flex-col gap-2 hidden md:flex">
        {items.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <motion.div
              key={item.href}
              initial={false}
              animate={isActive ? { scale: 1.04 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Link
                href={item.href}
                tabIndex={0}
                className={cn(
                  // Base styles
                  "group flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium outline-none border border-transparent",
                  "transition-all duration-200 ease-in-out",
                  // Glassmorphism + shadow
                  "bg-white/0 hover:bg-white/10 focus:bg-white/10 backdrop-blur-md",
                  // Animation for hover/focus
                  "hover:scale-[1.03] focus:scale-[1.03] hover:shadow-md focus:shadow-md",
                  // Active state
                  isActive &&
                    "bg-accent text-accent-foreground shadow-lg border-accent/60 scale-[1.04]",
                  // Focus ring for accessibility
                  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-muted"
                )}
              >
                {/* Animate icon color on active */}
                <motion.span
                  className="flex items-center"
                  animate={{ color: isActive ? "#2563eb" : "inherit" }}
                  transition={{ duration: 0.2 }}
                >
                  {item.icon}
                </motion.span>
                <span className="truncate">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
      <div className="block md:hidden">
        <SidebarHorizontal items={items} activeHref={activeHref} />
      </div>
    </aside>
  );
}
