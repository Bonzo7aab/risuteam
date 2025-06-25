import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
        <div className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            className="text-primary font-medium hover:underline"
            href="/sign-in"
          >
            Sign in
          </Link>
        </div>
      </div>
      <div className="grid gap-6">
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              placeholder="you@example.com"
              required
              className="w-full"
            />
          </div>
          <SubmitButton formAction={forgotPasswordAction} className="w-full">
            Reset Password
          </SubmitButton>
          <FormMessage message={searchParams} />
        </form>
      </div>
      <SmtpMessage />
    </div>
  );
}
