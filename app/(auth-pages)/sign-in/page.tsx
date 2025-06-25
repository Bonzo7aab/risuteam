import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return redirect("/admin");
  }
  const searchParams = await props.searchParams;
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Logowanie</h1>
        {/* <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            className="text-primary font-medium hover:underline"
            href="/sign-up"
          >
            Sign up
          </Link>
        </p> */}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Hasło</Label>
              {/* <Link
                className="text-sm text-primary hover:underline"
                href="/forgot-password"
              >
                Forgot Password?
              </Link> */}
            </div>
            <Input
              type="password"
              name="password"
              placeholder="Hasło"
              required
              className="w-full"
            />
          </div>
          <SubmitButton
            pendingText="Logowanie..."
            formAction={signInAction}
            className="w-full"
          >
            Zaloguj się
          </SubmitButton>
          <FormMessage message={searchParams} />
        </form>
      </div>
    </div>
  );
}
