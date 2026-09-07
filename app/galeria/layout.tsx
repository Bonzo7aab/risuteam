import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria | Risu Team",
  description: "Zdjęcia z treningów, obozów i eventów Risu Team",
};

export default function GaleriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
