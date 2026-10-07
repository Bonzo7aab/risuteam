import Image from "next/image";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

export type CampCoachListItem = {
  id: Id<"coaches">;
  name: string;
  photoUrl?: string;
  imageAlt: string;
  disciplines: string[];
  bio?: string;
};

const FALLBACK =
  "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=400";

type CampCoachesListProps = {
  title: string;
  subtitle?: string;
  coaches: CampCoachListItem[];
};

export function CampCoachesList({ title, subtitle, coaches }: CampCoachesListProps) {
  if (coaches.length === 0) return null;

  return (
    <section
      id="kadra"
      className="border-t border-stone-200 bg-white py-12 dark:border-stone-700 dark:bg-stone-900/50 md:py-16"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white md:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 mb-6 text-sm text-stone-500 dark:text-stone-400">
            {subtitle}
          </p>
        ) : (
          <div className="mb-6" aria-hidden />
        )}
        <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-stone-700 dark:bg-stone-900/80">
          {coaches.map((coach) => (
            <li
              key={coach.id}
              className="border-b border-stone-200 last:border-b-0 dark:border-stone-700"
            >
              <Link
                href={`/trenerzy#${coach.id}`}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-stone-50 sm:gap-5 sm:px-5 dark:hover:bg-stone-800/50"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full ring-1 ring-stone-200 dark:ring-stone-600 sm:size-14">
                  <Image
                    src={coach.photoUrl ?? FALLBACK}
                    alt={coach.imageAlt}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug text-stone-900 dark:text-white">
                    {coach.name}
                  </p>
                  {coach.disciplines.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {coach.disciplines.map((d) => (
                        <span
                          key={d}
                          className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {coach.bio ? (
                    <p className="mt-1 line-clamp-1 text-sm text-stone-500 dark:text-stone-400">
                      {coach.bio}
                    </p>
                  ) : null}
                </div>
                <span
                  className="material-symbols-outlined shrink-0 text-xl text-stone-400 dark:text-stone-500"
                  aria-hidden
                >
                  chevron_right
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
