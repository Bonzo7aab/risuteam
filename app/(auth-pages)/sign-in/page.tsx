import { FormMessage, Message } from "@/components/form-message";
import { SignInForm } from "@/components/auth/sign-in-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default async function SignInPage(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <AuthPageShell mobileEyebrow="Konto rodzica">
      <SignInForm />
      {"error" in searchParams || "success" in searchParams ? (
        <div className="mt-4">
          <FormMessage message={searchParams} />
        </div>
      ) : null}
    </AuthPageShell>
  );
}
