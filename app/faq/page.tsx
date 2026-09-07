import { Metadata } from "next";
import { FaqContent } from "@/components/sections/faq-content";

export const metadata: Metadata = {
  title: "FAQ | Risu Team",
  description:
    "Pytania i odpowiedzi — zapisy, płatności, sprzęt i bezpieczeństwo",
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <FaqContent />
    </div>
  );
}
