"use client";

import { useState, FormEvent } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { contactSchema } from "@/lib/schemas";
import { firstZodMessage } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { locationCenter, locationPlaces } from "@/lib/location-data";
import type { Place } from "@/components/map/location-map";

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
            <div className="grid md:grid-cols-[1fr,minmax(280px,340px)] gap-8 lg:gap-12">
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstname" className="text-text-main dark:text-stone-300 text-sm font-medium">
                        Imię
                      </Label>
                      <Input
                        id="firstname"
                        name="firstname"
                        placeholder="Wpisz imię..."
                        required
                        className="rounded-xl border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-text-main dark:text-white placeholder:text-text-light dark:placeholder:text-stone-500 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastname" className="text-text-main dark:text-stone-300 text-sm font-medium">
                        Nazwisko
                      </Label>
                      <Input
                        id="lastname"
                        name="lastname"
                        placeholder="Wpisz nazwisko..."
                        required
                        className="rounded-xl border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-text-main dark:text-white placeholder:text-text-light dark:placeholder:text-stone-500 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-text-main dark:text-stone-300 text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Wpisz adres e-mail..."
                      required
                      className="rounded-xl border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-text-main dark:text-white placeholder:text-text-light dark:placeholder:text-stone-500 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number" className="text-text-main dark:text-stone-300 text-sm font-medium">
                      Telefon
                    </Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      placeholder="Numer telefonu (opcjonalnie)"
                      className="rounded-xl border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-text-main dark:text-white placeholder:text-text-light dark:placeholder:text-stone-500 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-text-main dark:text-stone-300 text-sm font-medium">
                      Wiadomość
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="Wpisz wiadomość..."
                      required
                      className="rounded-xl border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-text-main dark:text-white placeholder:text-text-light dark:placeholder:text-stone-500 focus-visible:ring-primary resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-bold hover:bg-primary-hover disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
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
                  </button>
                </form>
              </div>

              {/* Right column: logo + contact cards */}
              <div className="space-y-4 flex flex-col">
                <div className="hidden md:flex rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 aspect-[4/5] min-h-[200px] flex-shrink-0 overflow-hidden items-center justify-center p-6">
                  <Image
                    src="/logoWithBorder.png"
                    alt="Risu Team"
                    width={288}
                    height={96}
                    className="w-full h-auto max-w-[240px] md:max-w-[280px] object-contain dark:invert"
                  />
                </div>
                <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 p-4 flex gap-4 shadow-soft">
                  <span className="material-symbols-outlined text-2xl text-primary flex-shrink-0" aria-hidden>
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
                  <span className="material-symbols-outlined text-2xl text-primary flex-shrink-0" aria-hidden>
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
