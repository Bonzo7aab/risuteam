import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NOCOWANKI_STATIC } from "../nocowanki-static";
import { NocowankaPublicView } from "./nocowanka-public-view";

/** Allow nocowanki slugs that exist only in Convex (not only prebuilt static keys). */
export const dynamicParams = true;

export async function generateStaticParams() {
  return Object.keys(NOCOWANKI_STATIC).map((slug) => ({ slug }));
}

function normalizeSlugParam(raw: string | undefined): string {
  if (!raw) return "";
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = normalizeSlugParam(raw);
  const data =
    NOCOWANKI_STATIC[slug] ?? NOCOWANKI_STATIC[slug.toLowerCase()];
  if (data) {
    return {
      title: `${data.title} | Risu Team`,
      description: data.description,
    };
  }
  return {
    title: "Nocowanka | Risu Team",
    description: "Nocowanka Risu Team — rezerwacja i informacje.",
  };
}

export default async function NocowankaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlugParam(rawSlug);
  if (!slug) {
    notFound();
  }
  return <NocowankaPublicView slug={slug} />;
}
