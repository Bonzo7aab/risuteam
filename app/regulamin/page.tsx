import type { Metadata } from "next";
import { RegulaminContent } from "@/components/sections/regulamin-content";

type TabId = "zajecia" | "obozy";

export const metadata: Metadata = {
  title: "Regulamin | Risu Team",
  description:
    "Regulamin zajec dla dzieci oraz regulamin obozow i nocowanek - szablon do dostosowania.",
};

function normalizeTab(tab: unknown): TabId {
  if (tab === "zajecia") return "zajecia";
  if (tab === "obozy") return "obozy";
  return "obozy";
}

export default function RegulaminPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const initialTab = normalizeTab(searchParams?.tab);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <RegulaminContent initialTab={initialTab} />
    </div>
  );
}

