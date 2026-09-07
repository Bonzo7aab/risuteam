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

  return (
    <section className="py-12 md:py-16 bg-stone-50 dark:bg-stone-900/30 border-t border-stone-200 dark:border-stone-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Co zabrać? */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">luggage</span>
              Co zabrać?
            </h2>
            <ul className="space-y-2">
              {whatToBringItems.map((item) => (
                <li key={item}>
                  <div className="flex items-center gap-2 rounded-lg bg-stone-100 dark:bg-stone-800/80 px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300">
                    <span className="material-symbols-outlined text-primary text-lg shrink-0" aria-hidden>
                      check_circle
                    </span>
                    {item}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Nasza baza */}
          {hasLocation ? (
            <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 overflow-hidden shadow-sm">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white p-6 pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">home</span>
                Nasza baza
              </h2>
              <div className="p-4 pt-0">
                <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 h-48">
                  <iframe
                    title="Mapa lokalizacji"
                    src={embedUrl}
                    width="100%"
                    height="100%"
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-3 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-lg shrink-0 mt-0.5">location_on</span>
                  <div>
                    <p className="font-medium text-stone-900 dark:text-white">{location!.name}</p>
                    {fullAddress && (
                      <p className="text-sm text-stone-600 dark:text-stone-400">{fullAddress}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 shadow-sm flex items-center justify-center min-h-[200px]">
              <p className="text-sm text-stone-500 dark:text-stone-400">Brak lokalizacji</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
