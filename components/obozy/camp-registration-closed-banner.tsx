"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CampRegistrationClosedBanner({ slug }: { slug: string }) {
  const camps = useQuery(api.camps.getCamps, {
    slug,
    activeOnly: false,
  });
  const camp = camps?.[0];
  const isClosed = camp?.isRegistrationOpen === false;

  if (!isClosed) return null;

  return (
    <div
      role="alert"
      className="bg-amber-100 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 py-3 px-4 sm:px-6 text-center text-sm font-medium"
    >
      Rejestracja na ten obóz została zakończona. Nie przyjmujemy już zapisów.
    </div>
  );
}
