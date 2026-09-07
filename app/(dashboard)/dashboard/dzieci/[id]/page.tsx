import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons/arrow-left";

export default async function ChildProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-4xl">
      <Link
        href="/dashboard/dzieci"
        className="text-primary font-bold risu-underline flex items-center gap-1 mb-6"
      >
        <ArrowLeftIcon className="text-[1.1em]" />
        Moje dzieci
      </Link>
      <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6 mb-8">
        <h1 className="text-2xl font-bold text-text-main dark:text-white mb-2">
          Profil dziecka
        </h1>
        <p className="text-text-light dark:text-stone-400 text-sm">
          ID: {id}
        </p>
      </div>
      <div className="flex gap-2 mb-8">
        {["Ogólne", "Dyscypliny", "Zdrowie", "Osiągnięcia"].map((tab) => (
          <button
            key={tab}
            className="px-4 py-2 rounded-xl font-bold text-sm bg-stone-100 dark:bg-stone-800 text-text-main dark:text-stone-300"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6">
        <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
          Dane medyczne
        </h2>
        <p className="text-text-light dark:text-stone-400 text-sm">
          Brak danych. Uzupełnij kontakt awaryjny, alergie i leki w ustawieniach profilu.
        </p>
      </div>
    </div>
  );
}
