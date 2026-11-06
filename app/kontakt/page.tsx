"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  contactFieldErrors,
  contactSchema,
  validateContactField,
  type ContactFieldName,
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { centerFromPlaces, locationCenter } from "@/lib/location-data";
import type { Place } from "@/components/map/location-map";

const fieldControlClass =
  "h-12 rounded-lg border-stone-200 bg-stone-50 px-3.5 text-[15px] text-text-main shadow-none placeholder:text-stone-400 hover:border-stone-300 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 dark:border-white/12 dark:bg-stone-950/45 dark:text-white dark:placeholder:text-stone-500 dark:hover:border-white/20";

const fieldErrorClass =
  "border-red-400 hover:border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/20 dark:border-red-500/60 dark:hover:border-red-500/70 dark:focus-visible:border-red-400";

type FieldErrors = Partial<Record<ContactFieldName, string>>;

function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="block text-[13px] font-semibold leading-5 text-stone-700 dark:text-stone-200"
    >
      {children}
      {optional ? (
        <span className="ml-1 font-medium text-stone-400 dark:text-stone-500">
          (opcjonalnie)
        </span>
      ) : null}
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

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-[13px] font-medium text-red-600 dark:text-red-400">
      {message}
    </p>
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

const FIELD_ORDER: ContactFieldName[] = [
  "firstname",
  "lastname",
  "email",
  "phone_number",
  "message",
];

export default function KontaktPage() {
  const publicLocations = useQuery(api.locations.listPublic);
  const mapPlaces = useMemo(
    () => (publicLocations ?? []) as Place[],
    [publicLocations],
  );
  const mapCenter = useMemo(
    () => centerFromPlaces(mapPlaces),
    [mapPlaces],
  );

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const setFieldError = (name: ContactFieldName, message?: string) => {
    setFieldErrors((prev) => {
      if (!message) {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      }
      if (prev[name] === message) return prev;
      return { ...prev, [name]: message };
    });
  };

  const handleFieldBlur = (name: ContactFieldName, value: string) => {
    // Empty fields stay quiet until submit — only flag invalid filled values on blur.
    if (!value.trim()) {
      setFieldError(name, undefined);
      return;
    }
    setFieldError(name, validateContactField(name, value));
  };

  const handleFieldChange = (name: ContactFieldName, value: string) => {
    setFieldErrors((prev) => {
      if (!value.trim()) {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      }
      // Once a field has been validated (error shown), keep feedback live while typing.
      if (!prev[name]) return prev;
      const message = validateContactField(name, value);
      if (!message) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      if (prev[name] === message) return prev;
      return { ...prev, [name]: message };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData) as Record<string, string>;
    const payload = {
      firstname: data.firstname ?? "",
      lastname: data.lastname ?? "",
      email: data.email ?? "",
      phone_number: data.phone_number ?? "",
      message: data.message ?? "",
      subject: data.subject,
    };

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors = contactFieldErrors(parsed.error);
      setFieldErrors(nextErrors);
      setError(null);
      setSent(false);
      const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name]);
      if (firstInvalid) {
        const el = form.elements.namedItem(firstInvalid);
        if (el instanceof HTMLElement) el.focus();
      }
      return;
    }

    setSending(true);
    setError(null);
    setFieldErrors({});
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
          <div className="md:rounded-2xl md:border md:border-stone-200 md:bg-white md:p-8 md:shadow-card lg:p-10 dark:md:border-white/12 dark:md:bg-surface-dark dark:md:shadow-card-dark">
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

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-5"
                >
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
                          aria-invalid={!!fieldErrors.firstname}
                          aria-describedby={
                            fieldErrors.firstname ? "firstname-error" : undefined
                          }
                          onBlur={(e) => handleFieldBlur("firstname", e.target.value)}
                          onChange={(e) =>
                            handleFieldChange("firstname", e.target.value)
                          }
                          className={cn(
                            fieldControlClass,
                            "pl-11",
                            fieldErrors.firstname && fieldErrorClass,
                          )}
                        />
                      </div>
                      <FieldError id="firstname-error" message={fieldErrors.firstname} />
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
                          aria-invalid={!!fieldErrors.lastname}
                          aria-describedby={
                            fieldErrors.lastname ? "lastname-error" : undefined
                          }
                          onBlur={(e) => handleFieldBlur("lastname", e.target.value)}
                          onChange={(e) =>
                            handleFieldChange("lastname", e.target.value)
                          }
                          className={cn(
                            fieldControlClass,
                            "pl-11",
                            fieldErrors.lastname && fieldErrorClass,
                          )}
                        />
                      </div>
                      <FieldError id="lastname-error" message={fieldErrors.lastname} />
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
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={
                          fieldErrors.email ? "email-error" : undefined
                        }
                        onBlur={(e) => handleFieldBlur("email", e.target.value)}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        className={cn(
                          fieldControlClass,
                          "pl-11",
                          fieldErrors.email && fieldErrorClass,
                        )}
                      />
                    </div>
                    <FieldError id="email-error" message={fieldErrors.email} />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel htmlFor="phone_number" optional>
                      Telefon
                    </FieldLabel>
                    <div className="relative">
                      <FieldIcon name="call" />
                      <Input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="np. 533 020 048"
                        aria-invalid={!!fieldErrors.phone_number}
                        aria-describedby={
                          fieldErrors.phone_number
                            ? "phone_number-error"
                            : undefined
                        }
                        onBlur={(e) =>
                          handleFieldBlur("phone_number", e.target.value)
                        }
                        onChange={(e) =>
                          handleFieldChange("phone_number", e.target.value)
                        }
                        className={cn(
                          fieldControlClass,
                          "pl-11",
                          fieldErrors.phone_number && fieldErrorClass,
                        )}
                      />
                    </div>
                    <FieldError
                      id="phone_number-error"
                      message={fieldErrors.phone_number}
                    />
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
                        aria-invalid={!!fieldErrors.message}
                        aria-describedby={
                          fieldErrors.message ? "message-error" : undefined
                        }
                        onBlur={(e) => handleFieldBlur("message", e.target.value)}
                        onChange={(e) =>
                          handleFieldChange("message", e.target.value)
                        }
                        className={cn(
                          fieldControlClass,
                          "min-h-36 h-auto resize-none py-3 pl-11 leading-relaxed",
                          fieldErrors.message && fieldErrorClass,
                        )}
                      />
                    </div>
                    <FieldError id="message-error" message={fieldErrors.message} />
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

              {/* Right column: brand panel + contact cards */}
              <div className="flex flex-col gap-4">
                <div className="relative hidden min-h-[280px] shrink-0 overflow-hidden rounded-2xl border border-stone-200/80 bg-linear-to-b from-stone-50 via-white to-amber-50/70 p-8 md:flex md:flex-col md:items-center md:justify-center dark:border-white/12 dark:from-stone-900 dark:via-surface-dark dark:to-amber-950/30">
                  <div
                    className="animate-orb-drift pointer-events-none absolute -left-10 top-6 size-36 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25"
                    aria-hidden
                  />
                  <div
                    className="animate-orb-drift pointer-events-none absolute -right-8 bottom-8 size-44 rounded-full bg-amber-400/18 blur-3xl dark:bg-amber-400/12"
                    style={{ animationDelay: "-3s" }}
                    aria-hidden
                  />
                  <div
                    className="animate-auth-ring pointer-events-none absolute left-1/2 top-1/2 size-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15 dark:border-primary/20"
                    aria-hidden
                  />
                  <div
                    className="animate-auth-ring pointer-events-none absolute left-1/2 top-1/2 size-[13rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-stone-300/50 dark:border-white/10"
                    style={{ animationDelay: "-4s" }}
                    aria-hidden
                  />

                  <div className="relative z-10 flex flex-col items-center gap-5 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                      Risu Team
                    </p>
                    <div className="animate-float relative">
                      <div
                        className="animate-auth-glow absolute -inset-8 rounded-full bg-primary/25 blur-3xl dark:bg-primary/30"
                        aria-hidden
                      />
                      <div
                        className="relative flex size-36 items-center justify-center rounded-full bg-linear-to-b from-white to-stone-100/90 p-3 ring-1 ring-stone-300/70 dark:from-white/15 dark:to-white/5 dark:ring-white/20"
                        style={{
                          boxShadow:
                            "0 24px 50px -16px rgba(28,22,13,0.28), 0 0 36px rgba(244,157,37,0.2), inset 0 1px 0 rgba(255,255,255,0.85)",
                        }}
                      >
                        <div
                          className="absolute inset-2.5 rounded-full bg-stone-900/5 shadow-[inset_0_8px_20px_rgba(28,22,13,0.06)] dark:bg-black/20"
                          aria-hidden
                        />
                        <Image
                          src="/logoWithBorder.png"
                          alt="Risu Team"
                          width={288}
                          height={288}
                          className="relative size-full object-contain drop-shadow-[0_8px_18px_rgba(28,22,13,0.18)]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-lg font-bold tracking-tight text-text-main dark:text-white">
                        Porozmawiajmy
                      </p>
                      <p className="max-w-[16rem] text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                        Odpowiadamy zwykle w ciągu 24 godzin w dni robocze.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group flex gap-4 rounded-xl border border-transparent py-1 transition-colors md:border-stone-200 md:bg-stone-50 md:p-4 md:shadow-soft md:hover:border-primary/25 dark:md:border-white/12 dark:md:bg-stone-900/40 dark:md:hover:border-white/20">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105 dark:bg-primary/15">
                    <span className="material-symbols-outlined text-2xl" aria-hidden>
                      call
                    </span>
                  </span>
                  <div className="min-w-0 self-center">
                    <p className="text-sm font-medium text-text-light dark:text-stone-400">
                      Telefon
                    </p>
                    <a
                      href="tel:+48777888999"
                      className="font-semibold text-text-main transition-colors hover:text-primary dark:text-white"
                    >
                      +48 777 888 999
                    </a>
                  </div>
                </div>
                <div className="group flex gap-4 rounded-xl border border-transparent py-1 transition-colors md:border-stone-200 md:bg-stone-50 md:p-4 md:shadow-soft md:hover:border-primary/25 dark:md:border-white/12 dark:md:bg-stone-900/40 dark:md:hover:border-white/20">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105 dark:bg-primary/15">
                    <span className="material-symbols-outlined text-2xl" aria-hidden>
                      mail
                    </span>
                  </span>
                  <div className="min-w-0 self-center">
                    <p className="text-sm font-medium text-text-light dark:text-stone-400">
                      Email
                    </p>
                    <a
                      href="mailto:kontakt@risuteam.pl"
                      className="break-all font-semibold text-text-main transition-colors hover:text-primary dark:text-white"
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
                center={mapCenter}
                zoom={11}
                places={mapPlaces}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
