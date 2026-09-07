"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { RisuTeamLogoTitleMark } from "@/components/brand/risu-team-logo-title";

const inputWithIcon =
  "pl-10 rounded-xl border border-stone-200 dark:border-stone-700 h-11";

function getRedirectTarget(): string {
  if (typeof window === "undefined") return "/dashboard";
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return "/dashboard";
  }
  return redirect;
}

export function SignInForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const isAuthenticated = useQuery(api.auth.isAuthenticated);
  const currentUser = useQuery(api.authHelpers.getCurrentUser);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated === true && currentUser !== undefined) {
      router.replace(currentUser?.role === "admin" ? "/admin" : getRedirectTarget());
    }
  }, [isAuthenticated, currentUser, router]);

  const handleGoogleSignIn = () => {
    setGooglePending(true);
    void signIn("google", { redirectTo: getRedirectTarget() });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("flow", "signIn");
    try {
      const result = await signIn("password", formData);
      if (result?.signingIn) {
        return;
      }
      setError("Nieprawidłowy e-mail lub hasło.");
    } catch (err) {
      // Sign-in failure (wrong password → InvalidSecret, or other auth error)
      setError("Nieprawidłowy e-mail lub hasło.");
    } finally {
      setPending(false);
    }
  };

  if (isAuthenticated === true || isAuthenticated === undefined) {
    return (
      <div className="flex flex-col gap-5 justify-center items-center py-12 text-stone-600 dark:text-stone-400">
        <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        <p>{isAuthenticated === true ? "Przekierowanie..." : "Ładowanie..."}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Link href="/" className="mb-4 flex w-full justify-center">
        <RisuTeamLogoTitleMark
          variant="formRow"
          className="items-center text-center"
          titleClassName="text-text-main dark:text-white"
        />
      </Link>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
        Logowanie
      </h1>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Wprowadź dane, aby wejść do portalu.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-stone-700 dark:text-stone-300">
            Adres e-mail
          </Label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
              mail
            </span>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="np. rodzic@example.com"
              required
              className={inputWithIcon}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-stone-700 dark:text-stone-300">
              Hasło
            </Label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary risu-underline"
            >
              Zapomniałeś hasła?
            </Link>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
              lock
            </span>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              required
              className={cn(inputWithIcon, "pr-10")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
            >
              <span className="material-symbols-outlined text-lg">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
        >
          {pending ? "Logowanie..." : "Zaloguj się"}
        </Button>

        {error && <FormMessage message={{ error }} />}
      </div>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200 dark:border-stone-700" />
        </div>
        <div className="relative flex justify-center text-xs text-stone-500 dark:text-stone-400">
          <span className="bg-white dark:bg-stone-950 px-2">
            Lub kontynuuj przez
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl border-stone-200 dark:border-stone-700"
          disabled={googlePending}
          onClick={handleGoogleSignIn}
        >
          <span className="material-symbols-outlined text-lg mr-2">mail</span>
          {googlePending ? "Przekierowanie..." : "Google"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl border-stone-200 dark:border-stone-700"
          disabled
        >
          Facebook
        </Button>
      </div>

      <p className="text-sm text-center text-stone-600 dark:text-stone-400 mt-4">
        Nie masz konta?{" "}
        <Link href="/sign-up" className="font-semibold text-primary risu-underline">
          Zarejestruj się za darmo
        </Link>
      </p>
    </form>
  );
}
