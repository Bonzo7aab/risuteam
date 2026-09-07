"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Old deep links → /trenerzy#coachId so the main list scrolls to the coach. */
export default function CoachProfileRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = typeof params?.coachId === "string" ? params.coachId : "";

  useEffect(() => {
    if (rawId) {
      router.replace(`/trenerzy#${encodeURIComponent(rawId)}`);
    } else {
      router.replace("/trenerzy");
    }
  }, [rawId, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-background-light dark:bg-background-dark">
      <p className="text-text-light dark:text-stone-400">Przekierowanie…</p>
    </div>
  );
}
