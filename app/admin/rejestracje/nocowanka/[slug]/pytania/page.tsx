"use client";

import { useParams } from "next/navigation";
import { getNocowankaDisplayName } from "@/lib/nocowanki";
import { FormQuestionsManager } from "@/app/admin/rejestracje/form-questions-manager";

export default function AdminNocowankaPytaniaPage() {
  const params = useParams();
  const slug = decodeURIComponent((params.slug as string) ?? "");
  const displayName = getNocowankaDisplayName(slug);

  return (
    <FormQuestionsManager
      mode="nocowanka"
      id={slug}
      title={displayName}
      backHref={`/admin/rejestracje/nocowanka/${encodeURIComponent(slug)}`}
      backLabel={displayName}
    />
  );
}
