import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { brandMedia } from "@/lib/brand-media";

export const metadata: Metadata = {
  title: "Aktualności | Risu Team",
  description: "Nowości z Risu Team — obozy, zajęcia i wydarzenia klubowe.",
};

const posts = [
  {
    href: "/obozy/letnie",
    image: brandMedia.zakopaneSummer1,
    title: "Letni obóz w Zakopanem",
    description: "Treningi judo i karate, wycieczki w Tatry i Willa Basieńka — zapisy trwają.",
    tags: ["Obozy", "Lato", "Zakopane"],
  },
  {
    href: "/obozy/zimowe",
    image: brandMedia.zakopaneWinter1,
    title: "Zimowy wyjazd klubowy",
    description: "Aktywny tydzień w górach z kadrą Risu Team — sport, przygoda i nowe przyjaźnie.",
    tags: ["Obozy", "Zima"],
  },
  {
    href: "/rodzaje_zajec",
    image: brandMedia.trainingMat,
    title: "Zajęcia judo, karate i gimnastyki",
    description: "Bezpieczny trening na macie, małe grupy i certyfikowana kadra w Warszawie.",
    tags: ["Zajęcia", "Judo"],
  },
  {
    href: "/galeria",
    image: brandMedia.trainingGroup,
    title: "Galeria z treningów i wyjazdów",
    description: "Zobacz, jak wyglądają nasze zajęcia, nocowanki i obozy w obiektywie.",
    tags: ["Galeria", "Klub"],
  },
] as const;

export default function Aktualnosci() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight text-text-main dark:text-white md:text-4xl">
          Aktualności
        </h1>
        <p className="mt-3 text-base text-text-light dark:text-stone-400">
          Co słychać w Risu Team — wyjazdy, zajęcia i życie klubowe.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12">
        {posts.map((post) => (
          <Link
            key={post.href}
            href={post.href}
            className="group flex flex-col focus:outline-hidden"
          >
            <div className="relative aspect-16/12 overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 group-focus:scale-105"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>

            <div className="pt-4">
              <h2 className="relative inline-block text-lg font-medium text-text-main before:absolute before:inset-s-0 before:bottom-0.5 before:-z-1 before:h-1 before:w-full before:origin-left before:scale-x-0 before:bg-primary before:transition group-hover:before:scale-x-100 dark:text-white">
                {post.title}
              </h2>
              <p className="mt-1 text-text-light dark:text-stone-400">{post.description}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600 sm:text-sm dark:border-white/12 dark:bg-surface-dark dark:text-stone-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
