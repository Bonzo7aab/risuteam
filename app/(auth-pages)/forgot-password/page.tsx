import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { RisuTeamLogoTitleMark } from "@/components/brand/risu-team-logo-title";

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        aria-hidden
      >
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 size-80 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-900/20" />
      </div>
      <Link href="/" className="relative z-10 mb-8 inline-flex">
        <RisuTeamLogoTitleMark
          variant="formRow"
          titleClassName="text-text-main dark:text-white"
        />
      </Link>
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-stone-200/80 bg-white/90 p-6 shadow-card backdrop-blur-sm dark:border-stone-800 dark:bg-[#2a2015]/95 dark:shadow-card-dark sm:p-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
