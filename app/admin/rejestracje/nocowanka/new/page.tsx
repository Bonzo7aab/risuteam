"use client";

import { NocowankaEditor } from "../nocowanka-form";

export default function AdminNewNocowankaPage() {
  return (
    <div className="w-full min-w-0 max-w-4xl text-left">
      <h1 className="mb-2 text-2xl font-bold text-text-main dark:text-white">
        Nowa nocowanka
      </h1>
      <p className="mb-6 text-sm text-text-light dark:text-stone-400">
        Uzupełnij pola tak jak na stronie publicznej nocowanki (np. Klubowa).
      </p>
      <NocowankaEditor variant="create" />
    </div>
  );
}
