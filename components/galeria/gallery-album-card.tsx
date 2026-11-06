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
  onDelete,
  deleting,
}: {
  href: string;
  name: string;
  countLabel: string;
  coverUrls: string[];
  badge?: string;
  /** When set, shows a trash control on hover (admin). */
  onDelete?: () => void;
  deleting?: boolean;
}) {
  return (
    <div className="group relative">
      <Link
        href={href}
        className="block overflow-hidden border-b border-stone-200 pb-4 transition-[border-color,box-shadow,transform] last:border-b-0 dark:border-stone-700 md:rounded-2xl md:border md:border-stone-200/80 md:bg-white md:pb-0 md:shadow-card md:last:border hover:md:-translate-y-0.5 hover:md:border-primary/30 hover:md:shadow-card-hover motion-reduce:hover:md:translate-y-0 dark:md:border-white/12 dark:md:bg-surface-dark dark:md:shadow-card-dark dark:hover:md:border-white/20"
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
            <span
              className="material-symbols-outlined text-stone-400 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              chevron_right
            </span>
          )}
        </div>
      </Link>

      {onDelete ? (
        <button
          type="button"
          disabled={deleting}
          aria-label={`Usuń folder ${name}`}
          title="Usuń folder"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className={cn(
            "absolute right-2.5 top-2.5 z-10 inline-flex size-9 items-center justify-center rounded-full",
            "border border-white/30 bg-stone-950/70 text-white shadow-md backdrop-blur-sm",
            "opacity-100 transition-[opacity,background-color,transform] hover:bg-rose-600 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100",
            "focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden>
            delete
          </span>
        </button>
      ) : null}
    </div>
  );
}
