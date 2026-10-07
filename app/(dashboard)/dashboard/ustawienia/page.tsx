"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function UstawieniaPage() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const user = useQuery(api.authHelpers.getCurrentUser);
  const updateSelf = useMutation(api.users.updateSelf);
  const removeSelf = useMutation(api.users.removeSelf);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setPhone(user.phone ?? "");
  }, [user]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      await updateSelf({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setMessage("Dane konta zostały zaktualizowane.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się zapisać zmian.");
    } finally {
      setPending(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm.trim().toUpperCase() !== "USUN") {
      setError('Aby usunąć konto wpisz "USUN".');
      return;
    }
    setDeletePending(true);
    setError(null);
    try {
      await removeSelf({});
      await signOut();
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się usunąć konta."
      );
      setDeletePending(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-text-main dark:text-white">
        Ustawienia konta rodzica
      </h1>

      <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6">
        <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
          Dane podstawowe
        </h2>

        {user === undefined ? (
          <p className="text-sm text-text-light dark:text-stone-400">Ładowanie…</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={user?.email ?? ""} disabled className="mt-1" />
            </div>
            <div>
              <Label htmlFor="name">Imię i nazwisko</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="Np. Jan Kowalski"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
                placeholder="Np. 533 020 048"
              />
            </div>

            {message && (
              <p className="text-sm text-emerald-700 dark:text-emerald-400">{message}</p>
            )}
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <Button type="submit" disabled={pending}>
              {pending ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 p-6">
        <h2 className="text-lg font-bold text-text-main dark:text-white mb-2">
          Bezpieczeństwo
        </h2>
        <p className="text-sm text-text-light dark:text-stone-400 mb-4">
          Zmień hasło przez bezpieczny proces resetu.
        </p>
        <Link href="/forgot-password" className="text-primary font-bold risu-underline">
          Zmień hasło
        </Link>
      </div>

      <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-900/10 p-6">
        <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">
          Usuń konto
        </h2>
        <p className="text-sm text-red-700/90 dark:text-red-300 mb-4">
          Ta operacja jest nieodwracalna. Usuniemy Twoje konto rodzica i przypisane dane.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            setDeleteConfirm("");
            setDeleteOpen(true);
          }}
        >
          Usuń konto
        </Button>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md border-stone-200 dark:border-stone-700">
          <DialogHeader>
            <DialogTitle className="text-text-main dark:text-white">
              Potwierdź usunięcie konta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-text-light dark:text-stone-400">
              Aby potwierdzić, wpisz <span className="font-bold">USUN</span>.
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder='Wpisz "USUN"'
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deletePending}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deletePending}
            >
              {deletePending ? "Usuwanie..." : "Potwierdź usunięcie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
