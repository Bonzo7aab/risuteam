import Image from "next/image";
import { cn } from "@/lib/utils";

export type Instructor = {
  name: string;
  /** Optional nickname in quotes e.g. "Kierownik" → displays as "Marcin 'Kierownik'" when name is "Marcin" */
  nickname?: string;
  role: string;
  image: string;
  imageAlt?: string;
  description?: string;
};

export type InstructorCardsProps = {
  title: string;
  subtitle?: string;
  instructors: Instructor[];
  variant?: "default" | "staff";
};

export function InstructorCards({
  title,
  subtitle,
  instructors,
  variant = "default",
}: InstructorCardsProps) {
  const isStaff = variant === "staff";

  return (
    <section id="kadra" className="py-12 md:py-16 bg-white dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-stone-600 dark:text-stone-400">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            isStaff
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "grid grid-cols-2 lg:grid-cols-4 gap-6"
          )}
        >
          {instructors.map((instructor) => {
            const displayName = instructor.nickname
              ? `${instructor.name} '${instructor.nickname}'`
              : instructor.name;
            return (
              <div
                key={instructor.name + (instructor.nickname ?? "")}
                className={cn(
                  isStaff
                    ? "rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 shadow-sm flex flex-col items-center text-center"
                    : "rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 overflow-hidden shadow-sm text-center"
                )}
              >
                <div
                  className={cn(
                    "relative shrink-0 overflow-hidden",
                    isStaff ? "w-24 h-24 rounded-full" : "aspect-square w-full"
                  )}
                >
                  <Image
                    src={instructor.image}
                    alt={instructor.imageAlt ?? instructor.name}
                    fill
                    className="object-cover"
                    sizes={isStaff ? "96px" : "(max-width: 1024px) 50vw, 25vw"}
                  />
                </div>
                <div className={isStaff ? "mt-4" : "p-4"}>
                  <h3 className="font-bold text-stone-900 dark:text-white">
                    {displayName}
                  </h3>
                  <p
                    className={cn(
                      "text-stone-600 dark:text-stone-400",
                      isStaff && "text-xs font-bold uppercase tracking-wider mt-0.5"
                    )}
                  >
                    {instructor.role}
                  </p>
                  {isStaff && instructor.description && (
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                      {instructor.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
