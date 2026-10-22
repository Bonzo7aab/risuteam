import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell mobileEyebrow="Reset hasła">
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
