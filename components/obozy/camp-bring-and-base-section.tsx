import { sectionSurfaceSoft } from "@/lib/utils";
import type { CampLocationInfo } from "./camp-location-section";

function buildFullAddress(loc: CampLocationInfo): string {
  const parts = [loc.address, loc.city].filter(Boolean);
  return parts.join(", ") || loc.name || "";
}

function buildEmbedUrl(loc: CampLocationInfo): string {
  const q = buildFullAddress(loc) || loc.name;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
}

export type CampBringAndBaseSectionProps = {
  whatToBringItems: string[];
  location: CampLocationInfo | null | undefined;
};

export function CampBringAndBaseSection({
  whatToBringItems,
  location,
}: CampBringAndBaseSectionProps) {
  const hasLocation = location?.name || location?.address || location?.city;
  const fullAddress = location ? buildFullAddress(location) : "";
  const embedUrl = location ? buildEmbedUrl(location) : "";
  const mapsUrl = location?.mapsUrl?.trim();

  return (
    <section className="border-t border-stone-200 bg-stone-50 py-10 dark:border-stone-700 dark:bg-stone-900/30 md:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-10 md:grid-cols-2 md:gap-8">
          <div className={`flex h-full flex-col md:p-7 ${sectionSurfaceSoft}`}>
            <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-white">
              <span className="material-symbols-outlined text-xl text-primary">
                luggage
              </span>
              Co zabrać?
            </h2>
            <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
              Lista rzeczy na wyjazd
            </p>
            <ol className="divide-y divide-stone-200/80 dark:divide-stone-700/80">
              {whatToBringItems.map((item, i) => (
                <li
                  key={item}
                  className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold tabular-nums text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium leading-snug text-stone-800 dark:text-stone-200">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {hasLocation ? (
            <div
              className={`flex h-full min-h-0 flex-col md:overflow-hidden ${sectionSurfaceSoft}`}
            >
              <h2 className="flex items-center gap-2 pb-3 text-lg font-bold text-stone-900 dark:text-white md:px-6 md:pt-5">
                <span className="material-symbols-outlined text-xl text-primary">
                  home
                </span>
                Nasza baza
              </h2>
              <div className="-mx-4 min-h-48 w-[calc(100%+2rem)] flex-1 sm:-mx-6 sm:w-[calc(100%+3rem)] md:mx-0 md:min-h-56 md:w-full md:border-y md:border-stone-200 dark:md:border-stone-700">
                <iframe
                  title="Mapa lokalizacji"
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  className="h-full min-h-48 w-full border-0 md:min-h-56"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="pt-4 md:px-6 md:py-4">
                <p className="font-semibold text-stone-900 dark:text-white">
                  {location!.name}
                </p>
                {fullAddress ? (
                  <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">
                    {fullAddress}
                  </p>
                ) : null}
                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary risu-underline"
                  >
                    Otwórz w mapach
                    <span
                      className="material-symbols-outlined text-base"
                      aria-hidden
                    >
                      open_in_new
                    </span>
                  </a>
                ) : (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      fullAddress || location!.name,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary risu-underline"
                  >
                    Otwórz w mapach
                    <span
                      className="material-symbols-outlined text-base"
                      aria-hidden
                    >
                      open_in_new
                    </span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`flex min-h-[200px] items-center justify-center md:p-6 ${sectionSurfaceSoft}`}
            >
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Brak lokalizacji
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
