import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { RisuTeamLogoTitleMark } from "@/components/brand/risu-team-logo-title";

export default function ForgotPasswordPage() {
  return (
    <div className="col-span-2 flex w-full flex-col items-center px-4 pb-8 pt-[max(env(safe-area-inset-top),1.5rem)]">
      <Link href="/" className="mb-6 inline-flex justify-center">
        <RisuTeamLogoTitleMark
          variant="formRow"
          titleClassName="text-text-main dark:text-white"
        />
      </Link>
      <ForgotPasswordForm />
    </div>
  );
}
