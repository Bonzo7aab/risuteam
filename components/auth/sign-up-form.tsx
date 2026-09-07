"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { RisuTeamLogoTitleMark } from "@/components/brand/risu-team-logo-title";

const inputWithIcon =
  "pl-10 rounded-xl border border-stone-200 dark:border-stone-700 h-11";

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
      <div className="flex flex-col gap-5 justify-center items-center py-12 text-stone-600 dark:text-stone-400">
        <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        <p>{isAuthenticated === true ? "Przekierowanie..." : "Ładowanie..."}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="mb-4 flex flex-col items-center gap-3">
        <Link href="/" className="inline-flex justify-center">
          <RisuTeamLogoTitleMark
            variant="formRow"
            className="items-center text-center"
            titleClassName="text-text-main dark:text-white"
          />
        </Link>
        <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <span className="font-medium">KROK 1 Z 2</span>
          <div className="flex gap-0.5">
            <span className="size-2 rounded-full bg-primary" />
            <span className="size-2 rounded-full bg-stone-200 dark:bg-stone-600" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
        Dane rodzica
      </h1>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Załóż konto, aby zarządzać profilem rodziny.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-stone-700 dark:text-stone-300">
            Imię i nazwisko
          </Label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
              person
            </span>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="np. Anna Kowalska"
              className={inputWithIcon}
            />
          </div>
        </div>

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
              placeholder="np. name@example.com"
              required
              className={inputWithIcon}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-stone-700 dark:text-stone-300">
            Hasło
          </Label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
              lock
            </span>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputWithIcon}
            />
          </div>
          {strength && (
            <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
              Siła hasła:{" "}
              <span
                className={cn(
                  "font-medium",
                  strength === "weak" && "text-red-600 dark:text-red-400",
                  strength === "medium" && "text-primary",
                  strength === "strong" && "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {strength === "weak" && "Słabe"}
                {strength === "medium" && "Średnie"}
                {strength === "strong" && "Silne"}
              </span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-stone-700 dark:text-stone-300">
            Potwierdź hasło
          </Label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
              lock
            </span>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••"
              required
              minLength={8}
              className={inputWithIcon}
            />
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 rounded border-stone-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-stone-600 dark:text-stone-400">
            Akceptuję{" "}
            <Link href="/regulamin" className="font-medium text-primary risu-underline">
              Regulamin
            </Link>{" "}
            i{" "}
            <Link href="/polityka-prywatnosci" className="font-medium text-primary risu-underline">
              Politykę prywatności
            </Link>
            .
          </span>
        </label>

        <Button
          type="submit"
          disabled={pending}
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
        >
          {pending ? "Tworzenie konta..." : "Utwórz konto"}
        </Button>

        {error && <FormMessage message={{ error }} />}
      </div>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200 dark:border-stone-700" />
        </div>
        <div className="relative flex justify-center text-xs text-stone-500 dark:text-stone-400">
          <span className="bg-white dark:bg-stone-950 px-2">
            Lub zarejestruj się przez
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
        Masz już konto?{" "}
        <Link href="/sign-in" className="font-semibold text-primary risu-underline">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
