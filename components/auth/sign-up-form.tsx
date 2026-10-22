"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
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

function passwordStrength(pwd: string): "weak" | "medium" | "strong" | null {
  if (!pwd.length) return null;
  if (pwd.length < 8) return "weak";
  if (pwd.length < 12) return "medium";
  return "strong";
}

export function SignUpForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const isAuthenticated = useQuery(api.auth.isAuthenticated);
  const currentUser = useQuery(api.authHelpers.getCurrentUser);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleGoogleSignIn = () => {
    setGooglePending(true);
    void signIn("google", { redirectTo: "/dashboard" });
  };

  const strength = useMemo(() => passwordStrength(password), [password]);

  useEffect(() => {
    if (isAuthenticated === true && currentUser !== undefined) {
      router.replace(currentUser?.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [isAuthenticated, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError("Zaakceptuj regulamin i politykę prywatności.");
      return;
    }
    const form = e.currentTarget;
    const confirm = form.querySelector<HTMLInputElement>('[name="confirmPassword"]');
    if (confirm && confirm.value !== password) {
      setError("Hasła nie są identyczne.");
      return;
    }
    setPending(true);
    const formData = new FormData(form);
    formData.set("flow", "signUp");
    try {
      const result = await signIn("password", formData);
      if (result?.signingIn) {
        return;
      }
      setError("Rejestracja nie powiodła się. Sprawdź dane lub spróbuj się zalogować.");
    } catch (err) {
      const raw =
        err instanceof Error ? err.message : "Rejestracja nie powiodła się.";
      const isAlreadyExists =
        typeof raw === "string" && raw.toLowerCase().includes("already exists");
      setError(
        isAlreadyExists
          ? "Konto z tym adresem e-mail już istnieje. Zaloguj się lub użyj resetu hasła."
          : raw
      );
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

  const strengthBars = strength === "weak" ? 1 : strength === "medium" ? 2 : strength === "strong" ? 3 : 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header className="space-y-1.5">
        <p className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-primary lg:block">
          Nowe konto
        </p>
        <h1 className="text-2xl font-black tracking-tight text-text-main dark:text-white sm:text-[1.75rem]">
          Załóż konto
        </h1>
        <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          Utwórz profil rodzica, aby zarządzać zajęciami i zapisami.
        </p>
      </header>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-stone-700 dark:text-stone-300">
            Imię i nazwisko
          </Label>
          <div className="relative">
            <AuthFieldIcon name="person" />
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Anna Kowalska"
              className={authInputClass}
            />
          </div>
        </div>

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
          <Label htmlFor="password" className="text-stone-700 dark:text-stone-300">
            Hasło
          </Label>
          <div className="relative">
            <AuthFieldIcon name="lock" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 znaków"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {strength ? (
            <div className="space-y-1.5 pt-0.5">
              <div className="flex gap-1">
                {[1, 2, 3].map((level) => (
                  <span
                    key={level}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      level <= strengthBars
                        ? strength === "weak"
                          ? "bg-red-500"
                          : strength === "medium"
                            ? "bg-primary"
                            : "bg-emerald-500"
                        : "bg-stone-200 dark:bg-stone-700"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Siła hasła:{" "}
                <span
                  className={cn(
                    "font-semibold",
                    strength === "weak" && "text-red-600 dark:text-red-400",
                    strength === "medium" && "text-primary",
                    strength === "strong" && "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {strength === "weak" && "słabe"}
                  {strength === "medium" && "średnie"}
                  {strength === "strong" && "silne"}
                </span>
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-stone-700 dark:text-stone-300">
            Potwierdź hasło
          </Label>
          <div className="relative">
            <AuthFieldIcon name="lock" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Powtórz hasło"
              required
              minLength={8}
              className={authInputClass}
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200/80 bg-stone-50/80 px-3.5 py-3 dark:border-stone-800 dark:bg-stone-900/40">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 size-4 rounded border-stone-300 text-primary focus:outline-hidden focus:ring-0"
          />
          <span className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            Akceptuję{" "}
            <Link href="/regulamin" className="font-semibold text-primary hover:text-primary-hover">
              Regulamin
            </Link>{" "}
            i{" "}
            <Link
              href="/polityka-prywatnosci"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Politykę prywatności
            </Link>
            .
          </span>
        </label>

        {error ? <AuthError message={error} /> : null}

        <Button
          type="submit"
          disabled={pending}
          className={cn(
            "h-11 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary-hover",
            authButtonFocusClass
          )}
        >
          {pending ? "Tworzenie konta…" : "Utwórz konto"}
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
        Masz już konto?{" "}
        <Link
          href="/logowanie"
          className="font-semibold text-primary hover:text-primary-hover"
        >
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
