"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AuthDivider,
  AuthError,
  AuthFieldIcon,
  GoogleIcon,
  authButtonFocusClass,
  authInputClass,
} from "@/components/auth/auth-field";

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
    } catch {
      setError("Nieprawidłowy e-mail lub hasło.");
    } finally {
      setPending(false);
    }
  };

  if (isAuthenticated === true || isAuthenticated === undefined) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-stone-500 dark:text-stone-400">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">
          progress_activity
        </span>
        <p className="text-sm">
          {isAuthenticated === true ? "Przekierowanie…" : "Ładowanie…"}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header className="space-y-1.5">
        <p className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-primary lg:block">
          Konto rodzica
        </p>
        <h1 className="text-2xl font-black tracking-tight text-text-main dark:text-white sm:text-[1.75rem]">
          Zaloguj się
        </h1>
        <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          Wpisz dane, aby wejść do panelu rodzica.
        </p>
      </header>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-stone-700 dark:text-stone-300">
            Adres e-mail
          </Label>
          <div className="relative">
            <AuthFieldIcon name="mail" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="rodzic@example.com"
              required
              className={authInputClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className="text-stone-700 dark:text-stone-300">
              Hasło
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:text-primary-hover"
            >
              Zapomniałeś hasła?
            </Link>
          </div>
          <div className="relative">
            <AuthFieldIcon name="lock" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              required
              className={cn(authInputClass, "pr-10")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-300"
              aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        {error ? <AuthError message={error} /> : null}

        <Button
          type="submit"
          disabled={pending}
          className={cn(
            "h-11 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary-hover",
            authButtonFocusClass
          )}
        >
          {pending ? "Logowanie…" : "Zaloguj się"}
        </Button>
      </div>

      <AuthDivider label="lub" />

      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-11 w-full rounded-xl border-stone-200 bg-white font-semibold focus-visible:border-primary dark:border-stone-700 dark:bg-stone-950/40",
          authButtonFocusClass
        )}
        disabled={googlePending}
        onClick={handleGoogleSignIn}
      >
        <GoogleIcon className="mr-2 size-5" />
        {googlePending ? "Przekierowanie…" : "Kontynuuj z Google"}
      </Button>

      <p className="text-center text-sm text-stone-500 dark:text-stone-400">
        Nie masz konta?{" "}
        <Link
          href="/rejestracja"
          className="font-semibold text-primary hover:text-primary-hover"
        >
          Zarejestruj się
        </Link>
      </p>
    </form>
  );
}
