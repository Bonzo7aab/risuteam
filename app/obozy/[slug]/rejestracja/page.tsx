"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

function getSlug(params: unknown): string {
  const p = params as { slug?: string | string[] } | null;
  if (!p?.slug) return "";
  const raw = Array.isArray(p.slug) ? p.slug[0] ?? "" : p.slug;
  try {
    return decodeURIComponent(String(raw)).trim();
  } catch {
    return String(raw).trim();
  }
}

export default function RejestracjaRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = getSlug(params);

  useEffect(() => {
    if (slug) {
      router.replace(`/dashboard/zapisy/obozy/${encodeURIComponent(slug)}`);
    } else {
      router.replace("/dashboard/zapisy");
    }
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
      <p className="text-text-light dark:text-stone-400">Przekierowanie…</p>
    </div>
  );
}
