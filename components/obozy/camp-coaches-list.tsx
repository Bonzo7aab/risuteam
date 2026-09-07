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
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-stone-900 dark:text-white md:text-3xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-stone-600 dark:text-stone-400">{subtitle}</p>
          ) : null}
        </div>
        <ul className="flex flex-col gap-3">
          {coaches.map((coach) => (
            <li key={coach.id}>
              <Link
                href={`/trenerzy#${coach.id}`}
                className="flex gap-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-4 transition-colors hover:border-primary/40 hover:bg-stone-100/90 dark:border-stone-700 dark:bg-stone-900/60 dark:hover:border-primary/50 dark:hover:bg-stone-800/80"
              >
                <div className="relative size-[4.25rem] shrink-0 overflow-hidden rounded-full ring-2 ring-stone-200 dark:ring-stone-600 sm:size-[4.75rem]">
                  <Image
                    src={coach.photoUrl ?? FALLBACK}
                    alt={coach.imageAlt}
                    fill
                    className="object-cover"
                    sizes="76px"
                  />
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="text-base font-bold leading-tight text-stone-900 dark:text-white sm:text-lg">
                    {coach.name}
                  </p>
                  {coach.disciplines.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {coach.disciplines.map((d) => (
                        <span
                          key={d}
                          className="inline-flex rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary dark:bg-primary/25 dark:text-amber-100"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {coach.bio ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                      {coach.bio}
                    </p>
                  ) : null}
                </div>
                <span
                  className="material-symbols-outlined shrink-0 self-center text-stone-400 text-xl dark:text-stone-500"
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
