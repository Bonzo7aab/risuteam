import { FormMessage, Message } from "@/components/form-message";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default async function SignUpPage(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <AuthPageShell>
        <FormMessage message={searchParams} />
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell mobileEyebrow="Nowe konto">
      <SignUpForm />
      {"error" in searchParams || "success" in searchParams ? (
        <div className="mt-4">
          <FormMessage message={searchParams} />
        </div>
      ) : null}
    </AuthPageShell>
  );
}
