"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { contactSchema } from "@/lib/schemas";
import { firstZodMessage } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { locationCenter, locationPlaces } from "@/lib/location-data";
import type { Place } from "@/components/map/location-map";

const fieldControlClass =
  "h-12 rounded-lg border-stone-200 bg-stone-50 px-3.5 text-[15px] text-text-main shadow-none placeholder:text-stone-400 hover:border-stone-300 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 dark:border-white/12 dark:bg-stone-950/45 dark:text-white dark:placeholder:text-stone-500 dark:hover:border-white/20";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="block text-[13px] font-semibold leading-5 text-stone-700 dark:text-stone-200"
    >
      {children}
    </Label>
  );
}

function FieldIcon({ name }: { name: string }) {
  return (
    <span
      className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-stone-400 dark:text-stone-500"
      aria-hidden
    >
      {name}
    </span>
  );
}

const DynamicLocationMap = dynamic(
  () =>
    import("@/components/map/location-map").then((mod) => ({
      default: mod.LocationMap,
    })),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="w-full aspect-video rounded-2xl" />
    ),
  }
);

export default function KontaktPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData) as Record<string, string>;
    const payload = {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      phone_number: data.phone_number,
      message: data.message,
      subject: data.subject,
    };

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      setError(firstZodMessage(parsed.error));
      return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Błąd wysyłania");
      setSent(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wysłać wiadomości");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <section className="px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl bg-white dark:bg-stone-900/80 shadow-soft border border-stone-200 dark:border-stone-700 p-6 md:p-8 lg:p-10">
            <div className="grid md:grid-cols-[1fr_minmax(280px,340px)] gap-8 lg:gap-12">
              {/* Left column: form */}
              <div className="space-y-6">
                <span className="inline-block rounded-full bg-primary/10 dark:bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                  Kontakt
                </span>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-main dark:text-white">
                  Połącz się z nami
                </h1>
                <p className="text-text-light dark:text-stone-400 text-sm md:text-base">
                  Masz pytania, sugestie lub potrzebujesz pomocy? Jesteśmy do Twojej dyspozycji.
                </p>

                {sent && (
                  <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm border border-green-200 dark:border-green-800/50">
                    Wiadomość została wysłana. Odpowiemy wkrótce.
                  </div>
                )}
                {error && (
                  <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm border border-red-200 dark:border-red-800/50">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <FieldLabel htmlFor="firstname">Imię</FieldLabel>
                      <div className="relative">
                        <FieldIcon name="person" />
                        <Input
                          id="firstname"
                          name="firstname"
                          autoComplete="given-name"
                          placeholder="np. Anna"
                          required
                          className={cn(fieldControlClass, "pl-11")}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel htmlFor="lastname">Nazwisko</FieldLabel>
                      <div className="relative">
                        <FieldIcon name="id_card" />
                        <Input
                          id="lastname"
                          name="lastname"
                          autoComplete="family-name"
                          placeholder="np. Kowalska"
                          required
                          className={cn(fieldControlClass, "pl-11")}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel htmlFor="email">Adres e-mail</FieldLabel>
                    <div className="relative">
                      <FieldIcon name="mail" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="np. rodzic@example.com"
                        required
                        className={cn(fieldControlClass, "pl-11")}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel htmlFor="phone_number">Telefon</FieldLabel>
                    <div className="relative">
                      <FieldIcon name="call" />
                      <Input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="np. 533 020 048"
                        className={cn(fieldControlClass, "pl-11")}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel htmlFor="message">Wiadomość</FieldLabel>
                    <div className="relative">
                      <span
                        className="material-symbols-outlined pointer-events-none absolute left-3.5 top-3.5 text-[20px] text-stone-400 dark:text-stone-500"
                        aria-hidden
                      >
                        chat
                      </span>
                      <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder="Napisz, w czym możemy pomóc…"
                        required
                        className={cn(
                          fieldControlClass,
                          "min-h-36 h-auto resize-none py-3 pl-11 leading-relaxed",
                        )}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="h-12 w-full gap-2 rounded-lg bg-primary text-[15px] font-bold text-primary-foreground hover:bg-primary-hover"
                  >
                    {sending ? (
                      "Wysyłanie…"
                    ) : (
                      <>
                        Wyślij wiadomość
                        <span className="material-symbols-outlined text-xl" aria-hidden>
                          send
                        </span>
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Right column: logo + contact cards */}
              <div className="space-y-4 flex flex-col">
                <div className="hidden md:flex rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 aspect-4/5 min-h-[200px] shrink-0 overflow-hidden items-center justify-center p-6">
                  <Image
                    src="/logoWithBorder.png"
                    alt="Risu Team"
                    width={288}
                    height={96}
                    className="w-full h-auto max-w-[240px] md:max-w-[280px] object-contain dark:invert"
                  />
                </div>
                <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 p-4 flex gap-4 shadow-soft">
                  <span className="material-symbols-outlined text-2xl text-primary shrink-0" aria-hidden>
                    call
                  </span>
                  <div className="min-w-0">
                    <p className="text-text-light dark:text-stone-400 text-sm font-medium">Telefon</p>
                    <a
                      href="tel:+48777888999"
                      className="text-text-main dark:text-white font-semibold hover:text-primary transition-colors"
                    >
                      +48 777 888 999
                    </a>
                  </div>
                </div>
                <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 p-4 flex gap-4 shadow-soft">
                  <span className="material-symbols-outlined text-2xl text-primary shrink-0" aria-hidden>
                    mail
                  </span>
                  <div className="min-w-0">
                    <p className="text-text-light dark:text-stone-400 text-sm font-medium">Email</p>
                    <a
                      href="mailto:kontakt@risuteam.pl"
                      className="text-text-main dark:text-white font-semibold hover:text-primary transition-colors break-all"
                    >
                      kontakt@risuteam.pl
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map below card */}
          <div className="mt-10 md:mt-12">
            <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Lokalizacja</h2>
            <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 h-[400px]">
              <DynamicLocationMap
                center={locationCenter}
                zoom={11}
                places={locationPlaces as Place[]}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
