"use client";

import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CampLocationInfo = {
  name: string;
  address?: string;
  city?: string;
  mapsUrl?: string;
};

type CampLocationSectionProps = {
  title?: string;
  location: CampLocationInfo | null | undefined;
  className?: string;
};

function buildFullAddress(loc: CampLocationInfo): string {
  const parts = [loc.address, loc.city].filter(Boolean);
  return parts.join(", ") || loc.name || "";
}

function buildEmbedUrl(loc: CampLocationInfo): string {
  const q = buildFullAddress(loc) || loc.name;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
}

export function CampLocationSection({
  title = "Gdzie jedziemy",
  location,
  className,
}: CampLocationSectionProps) {
  if (!location?.name && !location?.address && !location?.city) return null;

  const fullAddress = buildFullAddress(location);
  const embedUrl = buildEmbedUrl(location);
  const hasMapLink = Boolean(location.mapsUrl?.trim());

  return (
    <section
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-700 shadow-soft bg-white dark:bg-stone-900/80",
        className
      )}
      aria-labelledby="camp-location-heading"
    >
      <div className="flex flex-col lg:flex-row min-h-[400px] lg:min-h-[420px]">
        {/* Left sidebar – same structure and styling as /lokalizacja */}
        <aside className="w-full lg:w-[380px] lg:max-w-md shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80">
          <div className="p-6 pb-4 border-b border-stone-200 dark:border-stone-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <MapPin className="size-3.5" aria-hidden />
              Lokalizacja
            </div>
            <h2
              id="camp-location-heading"
              className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-text-main dark:text-white"
            >
              {title}
            </h2>
            <p className="text-sm text-text-light dark:text-stone-400 mt-1">
              Miejsce realizacji obozu
            </p>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center">
            <h3 className="font-bold text-text-main dark:text-white leading-tight">
              {location.name}
            </h3>
            {(fullAddress || location.city) && (
              <p className="text-text-light dark:text-stone-400 mt-2 text-sm">
                {fullAddress || location.city}
              </p>
            )}
            {hasMapLink && (
              <Button
                asChild
                size="default"
                className="mt-4 w-fit rounded-xl"
                variant="default"
              >
                <a
                  href={location.mapsUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Otwórz w mapach
                  <ArrowRight className="size-4" aria-hidden />
                </a>
              </Button>
            )}
          </div>
        </aside>

        {/* Map – same layout/styling as /lokalizacja map block */}
        <div className="flex-1 min-h-[320px] lg:min-h-[420px] p-4 lg:p-6">
          <div className="h-full min-h-[300px] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800/50">
            <iframe
              title="Mapa lokalizacji obozu"
              src={embedUrl}
              width="100%"
              height="100%"
              className="min-h-[300px] w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
