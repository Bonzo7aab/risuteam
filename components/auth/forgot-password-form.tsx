"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "request" | "verify";

export function ForgotPasswordForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("flow", "reset");
    const emailValue = formData.get("email") as string;
    try {
      await signIn("password", formData);
      setEmail(emailValue);
      setStep("verify");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Nie udało się wysłać kodu.";
      setError(message);
    } finally {
      setPending(false);
    }
  };

  const handleVerifyReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("flow", "reset-verification");
    formData.set("email", email);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    if (newPassword !== confirmPassword) {
      setError("Hasła nie są identyczne.");
      setPending(false);
      return;
    }
    try {
      const result = await signIn("password", formData);
      if (result?.signingIn) {
        router.push("/dashboard");
        return;
      }
      setError("Nieprawidłowy kod lub hasło. Spróbuj ponownie.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Reset hasła nie powiódł się.";
      setError(message);
    } finally {
      setPending(false);
    }
  };

  if (step === "verify") {
    return (
      <form
        onSubmit={handleVerifyReset}
        className="flex-1 flex flex-col w-full gap-2 text-foreground [&>input]:mb-6 min-w-64 max-w-64 mx-auto"
      >
        <h1 className="text-2xl font-medium">Wprowadź kod i nowe hasło</h1>
        <p className="text-sm text-secondary-foreground">
          Wysłaliśmy kod na adres {email}. Wprowadź go oraz nowe hasło.
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="code">Kod</Label>
          <Input name="code" placeholder="Kod z e-maila" required />
          <Label htmlFor="newPassword">Nowe hasło</Label>
          <Input
            name="newPassword"
            type="password"
            placeholder="Nowe hasło"
            minLength={8}
            required
          />
          <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Potwierdź hasło"
            minLength={8}
            required
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Zapisywanie..." : "Zapisz hasło"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("request")}
            disabled={pending}
          >
            Anuluj
          </Button>
          {error && <FormMessage message={{ error }} />}
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleRequestReset}
      className="flex-1 flex flex-col w-full gap-2 text-foreground [&>input]:mb-6 min-w-64 max-w-64 mx-auto"
    >
      <div>
        <h1 className="text-2xl font-medium">Resetowanie hasła</h1>
        <p className="text-sm text-secondary-foreground">
          Masz już konto?{" "}
          <Link className="text-primary underline" href="/sign-in">
            Zaloguj się
          </Link>
        </p>
      </div>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">E-mail</Label>
        <Input
          name="email"
          type="email"
          placeholder="np. jan@example.com"
          required
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Wysyłanie..." : "Wyślij link do resetu"}
        </Button>
        {error && <FormMessage message={{ error }} />}
      </div>
    </form>
  );
}
