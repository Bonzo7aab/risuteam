"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NocowankaEditor } from "../../nocowanka-form";

function formatAdminTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function decodeSlug(raw: string | string[] | undefined): string {
  if (!raw) return "";
  const s = Array.isArray(raw) ? raw[0] ?? "" : raw;
  try {
    return decodeURIComponent(String(s)).trim();
  } catch {
    return String(s).trim();
  }
}

export default function AdminEditNocowankaPage() {
  const params = useParams();
  const slug = decodeSlug(params.slug as string | string[] | undefined);
  const doc = useQuery(
    api.nocowanki.getBySlug,
    slug ? { slug } : "skip"
  );

  return (
    <div className="w-full min-w-0 max-w-4xl text-left">
      <h1 className="mb-2 text-2xl font-bold text-text-main dark:text-white">
        Edycja nocowanki
      </h1>
      {slug ? (
        <p className="mb-6 font-mono text-sm text-text-light dark:text-stone-400">
          {slug}
        </p>
      ) : null}
      {doc ? (
        <p className="mb-6 text-sm text-text-light dark:text-stone-400">
          Zaktualizowano: {formatAdminTimestamp(doc.updatedAt ?? doc._creationTime)}
        </p>
      ) : null}
      <NocowankaEditor variant="edit" doc={doc} editSlug={slug} />
    </div>
  );
}
