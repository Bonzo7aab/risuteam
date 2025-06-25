import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <div className="text-sm text-muted-foreground">
          Already have an account?{" "}
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              minLength={6}
              required
              className="w-full"
            />
          </div>
          <SubmitButton
            formAction={signUpAction}
            pendingText="Signing up..."
            className="w-full"
          >
            Sign up
          </SubmitButton>
          <FormMessage message={searchParams} />
        </form>
      </div>
      <SmtpMessage />
    </div>
  );
}
