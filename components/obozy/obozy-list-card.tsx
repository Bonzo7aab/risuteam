import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { cn } from "@/lib/utils";

export type ObozyListCardMeta = {
  icon: string;
  label: string;
};

type ObozyListCardProps = {
  href: string;
  title: string;
  description?: string;
  eyebrow: string;
  image?: string | null;
  imageAlt?: string;
  placeholderIcon?: string;
  meta: ObozyListCardMeta[];
  priceLabel: string;
  price: string;
  ctaHref: string;
  ctaLabel: string;
  statusBadge?: { label: string; tone: "danger" | "muted" | "primary" | "info" } | null;
  notice?: string | null;
  ctaDisabled?: boolean;
};

function statusBadgeClass(tone: NonNullable<ObozyListCardProps["statusBadge"]>["tone"]) {
  switch (tone) {
    case "danger":
      return "bg-red-500 text-white";
    case "primary":
      return "bg-primary text-primary-foreground";
    case "info":
      return "bg-sky-600 text-white";
    default:
      return "bg-stone-700 text-white dark:bg-stone-600";
  }
}

export function ObozyListCard({
  href,
  title,
  description,
  eyebrow,
  image,
  imageAlt = "",
  placeholderIcon = "camping",
  meta,
  priceLabel,
  price,
  ctaHref,
  ctaLabel,
  statusBadge,
  notice,
  ctaDisabled = false,
}: ObozyListCardProps) {
  return (
    <article className="group relative grid overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:hover:translate-y-0 dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark dark:hover:shadow-card-dark-hover lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)]">
      <Link href={href} className="absolute inset-0 z-0" aria-label={`Zobacz szczegóły: ${title}`} />

      <div className="relative aspect-16/10 min-h-48 bg-stone-100 dark:bg-stone-800 lg:aspect-auto lg:min-h-64">
        {image ? (
          <Image
            src={image}
            alt={imageAlt || title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(max-width: 1024px) 100vw, 480px"
            unoptimized={image.startsWith("/")}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 via-stone-100 to-stone-200 dark:from-primary/25 dark:via-stone-800 dark:to-stone-900">
            <span className="material-symbols-outlined text-5xl text-primary" aria-hidden>
              {placeholderIcon}
            </span>
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent lg:bg-linear-to-r lg:from-transparent lg:via-transparent lg:to-black/10"
          aria-hidden
        />
        {statusBadge ? (
          <span
            className={cn(
              "absolute left-3 top-3 z-[1] inline-flex max-w-[calc(100%-1.5rem)] truncate rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide",
              statusBadgeClass(statusBadge.tone)
            )}
          >
            {statusBadge.label}
          </span>
        ) : null}
      </div>

      <div className="relative z-[1] flex flex-col justify-center gap-4 px-5 py-6 pointer-events-none sm:px-7 sm:py-8 lg:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>

        <div>
          <h2 className="text-xl font-black tracking-tight text-text-main transition-colors group-hover:text-primary dark:text-white sm:text-2xl">
            {title}
          </h2>
          {notice ? (
            <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-400">
              {notice}
            </p>
          ) : null}
          {description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        <ul className="grid gap-2 text-sm text-stone-500 dark:text-stone-400 sm:grid-cols-2">
          {meta.map((item) => (
            <li key={`${item.icon}-${item.label}`} className="flex min-w-0 items-start gap-2">
              <span
                className="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-primary/80"
                aria-hidden
              >
                {item.icon}
              </span>
              <span className="min-w-0 leading-snug">{item.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-1 flex flex-col gap-3 border-t border-stone-100 pt-4 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
              {priceLabel}
            </p>
            <p className="text-xl font-black tracking-tight text-primary">{price}</p>
          </div>

          {ctaDisabled ? (
            <span className="inline-flex h-11 items-center justify-center rounded-xl bg-stone-200 px-5 text-sm font-semibold text-stone-500 dark:bg-stone-800 dark:text-stone-400">
              {ctaLabel}
            </span>
          ) : (
            <Link
              href={ctaHref}
              className="pointer-events-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
            >
              {ctaLabel}
              <ArrowRightIcon className="text-[1em] transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
