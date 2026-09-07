"use client";

import { Suspense } from "react";
import { ScheduleView } from "@/components/grafik/schedule-view";

function GrafikScheduleFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-text-light dark:text-stone-400">
      Ładowanie grafiku…
    </div>
  );
}

export default function GrafikPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <section className="px-4 sm:px-6 py-12 md:py-16">
        <Suspense fallback={<GrafikScheduleFallback />}>
          <ScheduleView signInRedirectPath="/grafik" />
        </Suspense>
      </section>
    </div>
  );
}
