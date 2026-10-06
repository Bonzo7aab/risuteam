import Link from "next/link";
import { cn } from "@/lib/utils";

function CoverImage({ src, className }: { src: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={cn("h-full w-full object-cover", className)}
    />
  );
}

function AlbumCover({ mosaic }: { mosaic: string[] }) {
  if (mosaic.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="risu-icon-well size-14">
          <span className="material-symbols-outlined text-[28px]" aria-hidden>
            folder
          </span>
        </span>
      </div>
    );
  }

  if (mosaic.length === 1) {
    return (
      <CoverImage
        src={mosaic[0]!}
        className="transition-transform duration-500 group-hover:scale-[1.03]"
      />
    );
  }

  if (mosaic.length === 2) {
    return (
      <div className="grid h-full grid-cols-2 gap-0.5">
        {mosaic.map((src) => (
          <CoverImage key={src} src={src} />
        ))}
      </div>
    );
  }

  if (mosaic.length === 3) {
    return (
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-0.5">
        <CoverImage src={mosaic[0]!} className="row-span-2" />
        <CoverImage src={mosaic[1]!} />
        <CoverImage src={mosaic[2]!} />
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-2 grid-rows-2 gap-0.5">
      {mosaic.slice(0, 4).map((src) => (
        <CoverImage key={src} src={src} />
      ))}
    </div>
  );
}

export function GalleryAlbumCard({
  href,
  name,
  countLabel,
  coverUrls,
  badge,
}: {
  href: string;
  name: string;
  countLabel: string;
  coverUrls: string[];
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft transition-colors hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900/80 dark:hover:border-stone-600"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100 dark:bg-stone-800">
        <AlbumCover mosaic={coverUrls} />
      </div>
      <div className="flex items-start justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-stone-900 dark:text-white">
            {name}
          </h2>
          <p className="mt-0.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            {countLabel}
          </p>
        </div>
        {badge ? (
          <span
            className={cn(
              "inline-flex shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
              "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400",
            )}
          >
            {badge}
          </span>
        ) : (
          <span className="material-symbols-outlined text-stone-400 transition-transform group-hover:translate-x-0.5" aria-hidden>
            chevron_right
          </span>
        )}
      </div>
    </Link>
  );
}
