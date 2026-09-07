"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FormQuestionsManager } from "@/app/admin/rejestracje/form-questions-manager";

function getSlug(params: unknown): string {
  const p = params as { slug?: string | string[] } | null;
  if (!p?.slug) return "";
  return decodeURIComponent(
    Array.isArray(p.slug) ? p.slug[0] ?? "" : p.slug
  );
}

export default function AdminObozPytaniaPage() {
  const params = useParams();
  const slug = getSlug(params);
  const camp = useQuery(
    api.camps.getCampBySlug,
    slug ? { slug } : "skip"
  );

  if (camp === undefined) {
    return <div className="text-text-light dark:text-stone-400">Ładowanie…</div>;
  }
  if (!camp || !slug) {
    return (
      <div className="text-text-main dark:text-white">Nie znaleziono obozu.</div>
    );
  }

  return (
    <FormQuestionsManager
      mode="camp"
      id={camp._id}
      title={camp.name}
      backHref={`/admin/rejestracje/oboz/${encodeURIComponent(camp.slug)}`}
      backLabel={camp.name}
    />
  );
}
