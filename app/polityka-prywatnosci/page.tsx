import type { Metadata } from "next";
import { PrivacyPolicyContent } from "@/components/sections/privacy-policy-content";

export const metadata: Metadata = {
  title: "Polityka prywatnosci | Risu Team",
  description:
    "Polityka prywatnosci serwisu klubu sportowego dla dzieci - szablon do dostosowania.",
};

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <PrivacyPolicyContent />
    </div>
  );
}

