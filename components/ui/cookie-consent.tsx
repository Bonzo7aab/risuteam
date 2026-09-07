"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ConsentValue = "accepted" | "declined";

type CookieConsentVariant = "small";

export type CookieConsentProps = {
  variant?: CookieConsentVariant;
  onAcceptCallback?: () => void;
  onDeclineCallback?: () => void;
  storageKey?: string;
};

function safeReadStorage(key: string): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === "accepted" || raw === "declined") return raw;
    return null;
  } catch {
    return null;
  }
}

function safeWriteStorage(key: string, value: ConsentValue) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function CookieConsent({
  variant = "small",
  onAcceptCallback,
  onDeclineCallback,
  storageKey = "cookieConsent",
}: CookieConsentProps) {
  const [open, setOpen] = useState(false);

  const content = useMemo(() => {
    if (variant !== "small") return null;
    return {
      title: "Używamy cookies",
      description:
        "Używamy cookies, żeby poprawić działanie serwisu. Szczegóły znajdziesz w polityce prywatności.",
      learnMoreLabel: "Dowiedz się więcej",
      acceptLabel: "Akceptuję",
      declineLabel: "Odrzuć",
      learnMoreHref: "/polityka-prywatnosci",
    };
  }, [variant]);

  useEffect(() => {
    const existing = safeReadStorage(storageKey);
    setOpen(existing == null);
  }, [storageKey]);

  if (!open || !content) return null;

  const handleAccept = () => {
    safeWriteStorage(storageKey, "accepted");
    setOpen(false);
    onAcceptCallback?.();
  };

  const handleDecline = () => {
    safeWriteStorage(storageKey, "declined");
    setOpen(false);
    onDeclineCallback?.();
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-[60] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2",
        "rounded-2xl border border-stone-100 dark:border-stone-800 bg-white/95 dark:bg-[#15100a]/90 backdrop-blur shadow-soft px-4 py-3"
      )}
      role="dialog"
      aria-live="polite"
      aria-label="Zgoda na cookies"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-text-main dark:text-white">
            {content.title}
          </div>
          <div className="text-xs text-text-light dark:text-stone-400 mt-0.5 leading-relaxed">
            {content.description}{" "}
              <Link href={content.learnMoreHref} className="block text-primary font-bold risu-underline">
                {content.learnMoreLabel}
              </Link>
              .
            </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={handleDecline}
          >
            {content.declineLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-xl"
            onClick={handleAccept}
          >
            {content.acceptLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

