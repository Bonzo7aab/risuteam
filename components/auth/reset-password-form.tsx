"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("flow", "reset-verification");
    const email = (formData.get("email") as string) || emailFromUrl;
    if (!email) {
      setError("Brak adresu e-mail. Użyj strony „Zapomniałem hasła”.");
      setPending(false);
      return;
    }
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

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4"
    >
      <h1 className="text-2xl font-medium">Resetowanie hasła</h1>
      <p className="text-sm text-foreground/60">
        Wprowadź kod z e-maila oraz nowe hasło poniżej.
      </p>
      <Label htmlFor="email">E-mail</Label>
      <Input
        name="email"
        type="email"
        placeholder="np. jan@example.com"
        defaultValue={emailFromUrl}
        required
      />
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
      {error && <FormMessage message={{ error }} />}
    </form>
  );
}
