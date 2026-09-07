"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CampRegistrationForm } from "@/components/camp-registration-form";
import { ArrowLeftIcon } from "@/components/icons/arrow-left";

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

export default function CampRegistrationDashboardPage() {
  const params = useParams();
  const slug = getSlug(params);

  return (
    <div className="max-w-[700px]">
      <Link
        href="/dashboard/zapisy"
        className="text-primary font-bold risu-underline flex items-center gap-1 mb-6"
      >
        <ArrowLeftIcon className="text-[1.1em]" />
        Powrót do zapisów
      </Link>
      <h1 className="text-2xl font-bold text-text-main dark:text-white mb-2">
        Rejestracja na obóz
      </h1>
      <p className="text-text-light dark:text-stone-400 mb-8">
        Wypełnij formularz — wszystkie pola na jednej stronie.
      </p>
      <CampRegistrationForm
        slug={slug}
        backHref="/dashboard/zapisy"
        backLabel="Powrót do zapisów"
        successHref="/dashboard/zapisy"
        successLabel="Powrót do zapisów"
      />
    </div>
  );
}
