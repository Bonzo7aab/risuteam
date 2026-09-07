"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";

import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

const MIN_INITIAL_MS = 480;
const HOLD_BEFORE_FADE_MS = 100;
const FADE_DURATION_S = 0.2;

export function RouteSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const [fullyHidden, setFullyHidden] = useState(false);

  useEffect(() => {
    if (visible) setFullyHidden(false);
  }, [visible]);

  // Initial visit only: fonts + window load, min visible time, fade out
  useEffect(() => {
    const ac = new AbortController();
    const { signal } = ac;
    const t0 = Date.now();

    const waitFonts: Promise<void> =
      typeof document !== "undefined" && document.fonts?.ready
        ? document.fonts.ready.then(() => undefined)
        : Promise.resolve();

    const waitLoad: Promise<void> =
      typeof document !== "undefined" && document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((resolve) => {
            window.addEventListener("load", () => resolve(), { once: true });
          });

    Promise.all([waitFonts, waitLoad]).then(async () => {
      if (signal.aborted) return;
      const waitMore = Math.max(0, MIN_INITIAL_MS - (Date.now() - t0));
      await new Promise<void>((r) => setTimeout(r, waitMore));
      if (signal.aborted) return;
      await new Promise<void>((r) => setTimeout(r, HOLD_BEFORE_FADE_MS));
      if (signal.aborted) return;
      setVisible(false);
    });

    return () => {
      ac.abort();
    };
  }, []);

  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 px-6 font-display",
        "bg-[#FDFBF7] text-[#111827] dark:bg-background-dark dark:text-slate-50",
        fullyHidden && "invisible",
      )}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: FADE_DURATION_S, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (!visible) setFullyHidden(true);
      }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      aria-hidden={!visible}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(245,130,32,0.14),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_32%,rgba(245,130,32,0.22),transparent_52%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23F58220' stroke-width='1.2'%3E%3Cpath d='M12 50c4-8 8-8 12 0s8 8 12 0'/%3E%3Cpath d='M44 22l4 8 8 2-8 4-2 8-4-8-8-2 8-4z'/%3E%3Cpath d='M58 48v10M53 53h10'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex max-w-md flex-col items-center gap-8 text-center">
        <Image
          src="/logoWithBorder.png"
          alt=""
          width={288}
          height={96}
          className="h-24 w-auto drop-shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:invert dark:drop-shadow-[0_12px_32px_rgba(255,255,255,0.08)]"
          priority
        />

        <div className="space-y-2">
          <p className="text-lg font-bold tracking-tight text-[#111827] sm:text-xl dark:text-slate-50">
            Risu Team szykuje się do skoku…
          </p>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">
            Przygotowujemy Twoją przygodę!
          </p>
        </div>

        <Loader variant="dots-rotate" size="md" />
      </div>
    </motion.div>
  );
}
