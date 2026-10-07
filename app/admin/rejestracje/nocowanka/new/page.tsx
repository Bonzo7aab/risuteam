"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NocowankaEditor } from "../nocowanka-form";

export default function AdminNewNocowankaPage() {
  return (
    <div className="w-full min-w-0 max-w-5xl space-y-6 text-left">
      <nav className="text-sm text-stone-500 dark:text-stone-400">
        <Link
          href="/admin/wydarzenia"
          className="font-medium transition-colors hover:text-primary"
        >
          Wydarzenia
        </Link>
        <span className="mx-2 text-stone-300 dark:text-stone-600">/</span>
        <span className="font-medium text-stone-900 dark:text-white">Nowa nocowanka</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white md:text-3xl">
            Nowa nocowanka
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-500 dark:text-stone-400">
            Uzupełnij pola tak jak na stronie publicznej nocowanki.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9 min-h-9 rounded-lg px-3 text-sm font-semibold" asChild>
            <Link href="/admin/wydarzenia">Anuluj</Link>
          </Button>
          <Button
            type="submit"
            form="nocowanka-form"
            size="sm"
            className="h-9 min-h-9 rounded-lg px-3 text-sm font-semibold"
          >
            Utwórz
          </Button>
        </div>
      </div>

      <NocowankaEditor variant="create" />
    </div>
  );
}
