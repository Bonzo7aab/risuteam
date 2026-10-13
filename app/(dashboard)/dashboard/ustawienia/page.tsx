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
import { requestDashboardTour } from "@/components/dashboard-onboarding";

function SettingsCard({
  eyebrow,
  title,
  description,
  children,
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={
        tone === "danger"
          ? "rounded-2xl border border-red-200/90 bg-red-50/70 p-5 shadow-card dark:border-red-900/50 dark:bg-red-950/20 dark:shadow-card-dark sm:p-6"
          : "rounded-2xl border border-stone-200/80 bg-white p-5 shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark sm:p-6"
      }
    >
      <div className="mb-5">
        {eyebrow ? (
          <p
            className={
              tone === "danger"
                ? "text-[11px] font-bold uppercase tracking-[0.16em] text-red-600 dark:text-red-400"
                : "text-[11px] font-bold uppercase tracking-[0.16em] text-primary"
            }
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={
            tone === "danger"
              ? "mt-1 text-lg font-black tracking-tight text-red-700 dark:text-red-300"
              : "mt-1 text-lg font-black tracking-tight text-text-main dark:text-white"
          }
        >
          {title}
        </h2>
        {description ? (
          <p
            className={
              tone === "danger"
                ? "mt-1.5 text-sm leading-relaxed text-red-700/90 dark:text-red-200/80"
                : "mt-1.5 text-sm leading-relaxed text-stone-500 dark:text-stone-400"
            }
          >
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

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
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="mb-3 max-w-2xl sm:mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          Panel rodzica
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-text-main dark:text-white md:text-4xl">
          Ustawienia
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400 sm:text-base">
          Dane konta, bezpieczeństwo i pomoc w poruszaniu się po panelu.
        </p>
      </header>

      <SettingsCard
        eyebrow="Konto"
        title="Dane podstawowe"
        description="Zaktualizuj imię i telefon — e-mail jest powiązany z logowaniem."
      >
        {user === undefined ? (
          <div className="space-y-3" aria-busy="true">
            <div className="h-11 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
            <div className="h-11 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
            <div className="h-11 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="max-w-lg space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={user?.email ?? ""}
                disabled
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Imię i nazwisko</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="Np. Jan Kowalski"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="Np. 533 020 048"
              />
            </div>

            {message ? (
              <div
                role="status"
                className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden>
                  check_circle
                </span>
                <span>{message}</span>
              </div>
            ) : null}
            {error ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden>
                  error
                </span>
                <span>{error}</span>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={pending}
              className="h-11 rounded-xl px-5 font-bold"
            >
              {pending ? "Zapisywanie…" : "Zapisz zmiany"}
            </Button>
          </form>
        )}
      </SettingsCard>

      <SettingsCard
        eyebrow="Bezpieczeństwo"
        title="Hasło"
        description="Zmień hasło przez bezpieczny proces resetu e-mail."
      >
        <Link
          href="/forgot-password"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm font-semibold text-text-main transition-colors hover:border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-950/40 dark:text-stone-100 dark:hover:bg-stone-900"
        >
          <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden>
            lock_reset
          </span>
          Zmień hasło
        </Link>
      </SettingsCard>

      <SettingsCard
        eyebrow="Pomoc"
        title="Przewodnik po panelu"
        description="Ponownie pokaż krótką prezentację menu: dzieci, zajęcia, płatności i ustawienia."
      >
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl font-semibold"
          onClick={() => requestDashboardTour()}
        >
          <span className="material-symbols-outlined mr-2 text-[18px]" aria-hidden>
            menu_book
          </span>
          Uruchom przewodnik
        </Button>
      </SettingsCard>

      <SettingsCard
        tone="danger"
        eyebrow="Strefa niebezpieczna"
        title="Usuń konto"
        description="Ta operacja jest nieodwracalna. Usuniemy konto rodzica i powiązane dane."
      >
        <Button
          type="button"
          variant="destructive"
          className="h-10 rounded-xl font-semibold"
          onClick={() => {
            setDeleteConfirm("");
            setDeleteOpen(true);
          }}
        >
          Usuń konto
        </Button>
      </SettingsCard>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-stone-200 dark:border-stone-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-text-main dark:text-white">
              Potwierdź usunięcie konta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-stone-500 dark:text-stone-400">
              Aby potwierdzić, wpisz <span className="font-bold text-text-main dark:text-white">USUN</span>.
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder='Wpisz "USUN"'
              className="h-11 rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeleteOpen(false)}
              disabled={deletePending}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl font-semibold"
              onClick={handleDeleteAccount}
              disabled={deletePending}
            >
              {deletePending ? "Usuwanie…" : "Potwierdź usunięcie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
