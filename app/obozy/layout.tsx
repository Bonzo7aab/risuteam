import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Obozy i eventy | Risu Team",
  description: "Obozy letnie, zimowe, półkolonie i nocowanki",
};

export default function ObozyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
