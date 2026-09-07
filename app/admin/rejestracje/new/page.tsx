"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const AGE_GROUPS = [
  "6–12 lat",
  "7–12 lat",
  "10–14 lat",
  "Rodziny z dziećmi",
];

const INCLUDED_ITEMS_FIXED = [
  "Ubezpieczenie",
  "Pełne wyżywienie",
  "Sprzęt",
  "Transport",
  "Opiekunowie",
  "Sesja zdjęciowa",
  "Koszulka",
];

const GENERAL_ATTRACTION_EXAMPLES = [
  "Basen",
  "Ognisko",
  "Turniej drużynowy",
  "Wieczór talentów",
  "Podchody",
];

/** URL slug for each category (used in /obozy/[slug]) */
const CATEGORY_TO_SLUG: Record<"letni" | "zimowy" | "polkolonie", string> = {
  letni: "letnie",
  zimowy: "zimowe",
  polkolonie: "polkolonie",
};

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type ScheduleSlot = { time: string; activity: string };
type ScheduleDay = { dayLabel: string; slots: ScheduleSlot[] };

type CampFormState = {
  slug: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  locationId: string;
  maxParticipants: string;
  price: string;
  isActive: boolean;
  isRegistrationOpen: boolean;
  category: "letni" | "zimowy" | "polkolonie";
  ageGroup: string;
  heroImageUrl: string;
  scheduleByDay: ScheduleDay[];
  includedItems: string[];
  customIncludedItems: string[];
  generalAttractions: string[];
};

const emptyForm: CampFormState = {
  slug: "",
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  locationId: "",
  maxParticipants: "",
  price: "",
  isActive: true,
  isRegistrationOpen: true,
  category: "letni",
  ageGroup: "",
  heroImageUrl: "",
  scheduleByDay: [],
  includedItems: [],
  customIncludedItems: [],
  generalAttractions: [],
};

type LocationFormState = {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  mapsUrl: string;
};

const emptyLocationForm: LocationFormState = {
  name: "",
  address: "",
  city: "",
  postalCode: "",
  mapsUrl: "",
};

export default function AdminNewCampPage() {
  const router = useRouter();
  const locations = useQuery(api.locations.listForAdmin);
  const createCamp = useMutation(api.camps.create);
  const createLocation = useMutation(api.locations.create);
  const heroImageFileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CampFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [customItemInput, setCustomItemInput] = useState("");
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [locationForm, setLocationForm] = useState<LocationFormState>(emptyLocationForm);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [attractionInput, setAttractionInput] = useState("");

  const toggleIncluded = useCallback((item: string) => {
    setForm((f) => ({
      ...f,
      includedItems: f.includedItems.includes(item)
        ? f.includedItems.filter((x) => x !== item)
        : [...f.includedItems, item],
    }));
  }, []);

  const addScheduleDay = useCallback(() => {
    setForm((f) => ({
      ...f,
      scheduleByDay: [...f.scheduleByDay, { dayLabel: `Dzień ${f.scheduleByDay.length + 1}`, slots: [] }],
    }));
  }, []);

  const addScheduleSlot = useCallback((dayIndex: number) => {
    setForm((f) => {
      const next = [...f.scheduleByDay];
      const day = next[dayIndex];
      if (!day) return f;
      next[dayIndex] = { ...day, slots: [...day.slots, { time: "", activity: "" }] };
      return { ...f, scheduleByDay: next };
    });
  }, []);

  const updateScheduleSlot = useCallback(
    (dayIndex: number, slotIndex: number, field: "time" | "activity", value: string) => {
      setForm((f) => {
        const next = [...f.scheduleByDay];
        const day = next[dayIndex];
        if (!day) return f;
        const slots = [...day.slots];
        slots[slotIndex] = { ...slots[slotIndex]!, [field]: value };
        next[dayIndex] = { ...day, slots };
        return { ...f, scheduleByDay: next };
      });
    },
    []
  );

  const removeScheduleSlot = useCallback((dayIndex: number, slotIndex: number) => {
    setForm((f) => {
      const next = [...f.scheduleByDay];
      const day = next[dayIndex];
      if (!day) return f;
      next[dayIndex] = { ...day, slots: day.slots.filter((_, i) => i !== slotIndex) };
      return { ...f, scheduleByDay: next };
    });
  }, []);

  const removeScheduleDay = useCallback((dayIndex: number) => {
    setForm((f) => ({
      ...f,
      scheduleByDay: f.scheduleByDay.filter((_, i) => i !== dayIndex),
    }));
  }, []);

  const addGeneralAttraction = useCallback(() => {
    const trimmed = attractionInput.trim();
    if (!trimmed) return;
    setForm((f) => ({ ...f, generalAttractions: [...f.generalAttractions, trimmed] }));
    setAttractionInput("");
  }, [attractionInput]);

  const removeGeneralAttraction = useCallback((index: number) => {
    setForm((f) => ({
      ...f,
      generalAttractions: f.generalAttractions.filter((_, i) => i !== index),
    }));
  }, []);

  const handleLocationSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLocationError(null);
      if (!locationForm.name.trim() || !locationForm.address.trim() || !locationForm.city.trim()) {
        setLocationError("Nazwa, adres i miasto są wymagane.");
        return;
      }
      try {
        const id = await createLocation({
          name: locationForm.name.trim(),
          address: locationForm.address.trim(),
          city: locationForm.city.trim(),
          postalCode: locationForm.postalCode.trim() || undefined,
          mapsUrl: locationForm.mapsUrl.trim() || undefined,
        });
        setForm((f) => ({ ...f, locationId: id }));
        setLocationForm(emptyLocationForm);
        setLocationDialogOpen(false);
      } catch (err) {
        setLocationError(err instanceof Error ? err.message : "Wystąpił błąd.");
      }
    },
    [createLocation, locationForm]
  );

  const handleHeroImageFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        if (typeof dataUrl === "string") setForm((f) => ({ ...f, heroImageUrl: dataUrl }));
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    []
  );

  const addCustomIncluded = useCallback(() => {
    const trimmed = customItemInput.trim();
    if (!trimmed) return;
    setForm((f) => ({
      ...f,
      customIncludedItems: [...f.customIncludedItems, trimmed],
      includedItems: [...f.includedItems, trimmed],
    }));
    setCustomItemInput("");
  }, [customItemInput]);

  const submitCamp = useCallback(
    async (asDraft: boolean) => {
      setError(null);
      const startMs = form.startDate ? new Date(form.startDate).getTime() : 0;
      const endMs = form.endDate ? new Date(form.endDate).getTime() : 0;
      if (!form.name.trim()) {
        setError("Nazwa obozu jest wymagana.");
        return;
      }
      const slugValue = form.slug.trim();
      if (!slugValue) {
        setError("Identyfikator URL jest wymagany.");
        return;
      }
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slugValue)) {
        setError("Identyfikator URL może zawierać tylko małe litery, cyfry i myślniki.");
        return;
      }
      if (!form.startDate || !form.endDate) {
        setError("Podaj datę rozpoczęcia i zakończenia.");
        return;
      }
      if (isNaN(startMs) || isNaN(endMs) || startMs >= endMs) {
        setError("Nieprawidłowe daty (rozpoczęcie musi być przed zakończeniem).");
        return;
      }
      const scheduleByDay = form.scheduleByDay
        .map((day) => ({
          dayLabel: day.dayLabel.trim() || "Dzień",
          slots: day.slots
            .filter((s) => s.time.trim() || s.activity.trim())
            .map((s) => ({ time: s.time.trim() || "00:00", activity: s.activity.trim() || "" })),
        }))
        .filter((day) => day.slots.length > 0);
      try {
        await createCamp({
          slug: slugValue,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          startDate: startMs,
          endDate: endMs,
          locationId: form.locationId ? (form.locationId as Id<"locations">) : undefined,
          maxParticipants: form.maxParticipants.trim() ? parseInt(form.maxParticipants, 10) : undefined,
          price: form.price.trim() ? parseFloat(form.price) : undefined,
          isActive: asDraft ? false : form.isActive,
          isRegistrationOpen: asDraft ? false : form.isRegistrationOpen,
          category: form.category,
          ageGroup: form.ageGroup.trim() || undefined,
          heroImageUrl: form.heroImageUrl.trim() || undefined,
          scheduleByDay: scheduleByDay.length > 0 ? scheduleByDay : undefined,
          includedItems:
            form.includedItems.length > 0 ? form.includedItems : undefined,
          generalAttractions:
            form.generalAttractions.length > 0 ? form.generalAttractions : undefined,
        });
        router.push(`/admin/rejestracje/oboz/${encodeURIComponent(slugValue)}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd.");
      }
    },
    [form, createCamp, router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitCamp(false);
  };

  const handleSaveDraft = (e: React.MouseEvent) => {
    e.preventDefault();
    void submitCamp(true);
  };

  return (
    <div className="max-w-3xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-light dark:text-stone-400 mb-6">
        <Link href="/admin/wydarzenia" className="hover:text-primary transition-colors">
          Wydarzenia
        </Link>
        <span aria-hidden>›</span>
        <span className="text-text-main dark:text-stone-200">Nowy obóz</span>
      </nav>

      <p className="mb-6 max-w-2xl text-sm text-text-light dark:text-stone-400">
        Po opublikowaniu obozu ustawisz dodatkowe pytania rejestracji na stronie{" "}
        <strong className="font-medium text-text-main dark:text-stone-200">edycji obozu</strong>{" "}
        (przycisk „Pytania formularza”) lub na liście{" "}
        <strong className="font-medium text-text-main dark:text-stone-200">Wydarzenia</strong>.
      </p>

      {/* Header + top actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white mb-2">
            Utwórz nowy obóz
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button type="button" variant="ghost" asChild>
            <Link href="/admin/wydarzenia">Odrzuć szkic</Link>
          </Button>
          <Button type="button" variant="outline" onClick={handleSaveDraft}>
            Zapisz jako szkic
          </Button>
          <Button type="submit" form="camp-form">
            Opublikuj obóz
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 shadow-sm">
          <div className="flex gap-3">
            <span className="material-symbols-outlined mt-0.5 text-lg" aria-hidden>
              error
            </span>
            <div className="text-sm md:text-base font-medium leading-relaxed">
              {error}
            </div>
          </div>
        </div>
      )}

      <form id="camp-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1 – Basic Info */}
        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-text-main dark:text-white">
              Podstawowe dane
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="camp-name" className="text-text-main dark:text-stone-200">
                Nazwa obozu *
              </Label>
              <Input
                id="camp-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                onBlur={() =>
                  setForm((f) => {
                    const nextSlug = slugify(f.name.trim());
                    return { ...f, slug: nextSlug || f.slug };
                  })
                }
                className="mt-1"
                placeholder="np. Letni obóz judo 2025"
                required
              />
              <span className="mt-1.5 font-mono text-xs text-stone-500 dark:text-stone-400">
                Identyfikator URL:{" "}
                  {form.slug.trim() || slugify(form.name.trim()) || "—"}
              </span>
            </div>
            <div>
              <Label className="text-text-main dark:text-stone-200 mb-2 block">Kategoria</Label>
              <div className="flex rounded-lg border border-input bg-muted/30 p-1 w-fit">
                {(["letni", "zimowy", "polkolonie"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: cat }))}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      form.category === cat
                        ? "bg-primary text-primary-foreground"
                        : "text-text-main dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                    )}
                  >
                    {cat === "letni" ? "Letni" : cat === "zimowy" ? "Zimowy" : "Półkolonie"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="camp-ageGroup" className="text-text-main dark:text-stone-200">
                Grupa wiekowa
              </Label>
              <select
                id="camp-ageGroup"
                value={form.ageGroup}
                onChange={(e) => setForm((f) => ({ ...f, ageGroup: e.target.value }))}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— wybierz —</option>
                {AGE_GROUPS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="camp-locationId" className="text-text-main dark:text-stone-200">
                  Lokalizacja
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-primary h-auto py-1"
                  onClick={() => setLocationDialogOpen(true)}
                >
                  Dodaj własną lokalizację
                </Button>
              </div>
              <select
                id="camp-locationId"
                value={form.locationId}
                onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— wybierz lokalizację —</option>
                {locations?.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="camp-startDate" className="text-text-main dark:text-stone-200">
                  Data rozpoczęcia *
                </Label>
                <Input
                  id="camp-startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="camp-endDate" className="text-text-main dark:text-stone-200">
                  Data zakończenia *
                </Label>
                <Input
                  id="camp-endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 – Media & Description */}
        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-text-main dark:text-white">
              Media i opis
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-text-main dark:text-stone-200 mb-2 block">Obraz</Label>
              <div className="border-2 border-dashed border-stone-200 dark:border-stone-600 rounded-xl p-6 flex flex-col items-center justify-center gap-2 min-h-[140px] bg-stone-50 dark:bg-stone-900/30">
                <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
                <p className="text-sm text-text-light dark:text-stone-400 text-center">
                  Kliknij lub przeciągnij plik (SVG, PNG, JPG, GIF, max 10MB)
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <input
                    ref={heroImageFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleHeroImageFile}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => heroImageFileInputRef.current?.click()}
                    >
                      Prześlij plik
                    </Button>
                    <Input
                      type="url"
                      value={form.heroImageUrl}
                      onChange={(e) => setForm((f) => ({ ...f, heroImageUrl: e.target.value }))}
                      placeholder="Lub wklej URL obrazu"
                      className="max-w-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="camp-description" className="text-text-main dark:text-stone-200">
                Opowiedz o przygodzie…
              </Label>
              <Textarea
                id="camp-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 min-h-[120px]"
                placeholder="Opis obozu dla uczestników"
              />
            </div>
          </div>
        </section>

        {/* Section 3 – Pricing & Capacity */}
        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-text-main dark:text-white">
              Cena i liczba miejsc
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="camp-price" className="text-text-main dark:text-stone-200">
                Cena za osobę (PLN)
              </Label>
              <div className="mt-1 flex rounded-md border border-input bg-background">
                <Input
                  id="camp-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="border-0 rounded-r-none"
                />
                <span className="inline-flex items-center px-3 text-sm text-text-light dark:text-stone-400 border-l border-input">
                  zł
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="camp-maxParticipants" className="text-text-main dark:text-stone-200">
                Łączna liczba miejsc
              </Label>
              <div className="mt-1 flex rounded-md border border-input bg-background">
                <Input
                  id="camp-maxParticipants"
                  type="number"
                  min={1}
                  value={form.maxParticipants}
                  onChange={(e) => setForm((f) => ({ ...f, maxParticipants: e.target.value }))}
                  className="border-0 rounded-r-none"
                />
                <span className="inline-flex items-center px-3 text-text-light dark:text-stone-400 border-l border-input">
                  <span className="material-symbols-outlined text-lg">group</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="camp-isActive"
                checked={form.isActive}
                onCheckedChange={(c) => setForm((f) => ({ ...f, isActive: c === true }))}
              />
              <Label htmlFor="camp-isActive" className="text-sm font-medium cursor-pointer">
                Aktywny
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="camp-isRegistrationOpen"
                checked={form.isRegistrationOpen}
                onCheckedChange={(c) => setForm((f) => ({ ...f, isRegistrationOpen: c === true }))}
              />
              <Label htmlFor="camp-isRegistrationOpen" className="text-sm font-medium cursor-pointer">
                Rejestracja otwarta
              </Label>
            </div>
          </div>
        </section>

        {/* Section 4 – Daily Schedule (by day) */}
        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text-main dark:text-white">
                Program dnia
              </h2>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addScheduleDay}>
              Dodaj dzień
            </Button>
          </div>
          <div className="space-y-6">
            {form.scheduleByDay.length === 0 ? (
              <p className="text-sm text-text-light dark:text-stone-400">
                Brak dni. Kliknij „Dodaj dzień”, aby dodać program dla konkretnego dnia.
              </p>
            ) : (
              form.scheduleByDay.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="rounded-lg border border-stone-200 dark:border-stone-600 p-4 space-y-3"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      value={day.dayLabel}
                      onChange={(e) =>
                        setForm((f) => {
                          const next = [...f.scheduleByDay];
                          next[dayIndex] = { ...next[dayIndex]!, dayLabel: e.target.value };
                          return { ...f, scheduleByDay: next };
                        })
                      }
                      placeholder="np. Dzień 1"
                      className="w-40 font-medium"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive ml-auto"
                      onClick={() => removeScheduleDay(dayIndex)}
                      aria-label="Usuń dzień"
                    >
                      Usuń dzień
                    </Button>
                  </div>
                  <div className="space-y-2 pl-2">
                    {day.slots.length === 0 ? (
                      <p className="text-sm text-text-light dark:text-stone-400">
                        Brak slotów w tym dniu.
                      </p>
                    ) : (
                      day.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex gap-2 items-start">
                          <div className="flex-1 grid grid-cols-[80px_1fr] gap-2">
                            <Input
                              type="time"
                              value={slot.time}
                              onChange={(e) =>
                                updateScheduleSlot(dayIndex, slotIndex, "time", e.target.value)
                              }
                              className="font-mono"
                            />
                            <Input
                              placeholder="Nazwa aktywności"
                              value={slot.activity}
                              onChange={(e) =>
                                updateScheduleSlot(dayIndex, slotIndex, "activity", e.target.value)
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive shrink-0"
                            onClick={() => removeScheduleSlot(dayIndex, slotIndex)}
                            aria-label="Usuń slot"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </Button>
                        </div>
                      ))
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1 w-fit border-primary text-primary hover:bg-primary/10 dark:border-primary dark:text-amber-200 dark:hover:bg-primary/20"
                      onClick={() => addScheduleSlot(dayIndex)}
                    >
                      Dodaj slot
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section 4b – General attractions */}
        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-text-main dark:text-white">
              Atrakcje ogólne dla całego obozu
            </h2>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-text-light dark:text-stone-400">Przykłady atrakcji:</p>
              <div className="flex flex-wrap gap-2">
                {GENERAL_ATTRACTION_EXAMPLES.map((item) => {
                  const exists = form.generalAttractions.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        if (exists) return;
                        setForm((prev) => ({
                          ...prev,
                          generalAttractions: [...prev.generalAttractions, item],
                        }));
                      }}
                      disabled={exists}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                        exists
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-stone-200 bg-stone-50 text-text-main hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800/50 dark:text-stone-200 dark:hover:bg-stone-800"
                      )}
                    >
                      {exists && <span className="material-symbols-outlined text-base">check</span>}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
            {form.generalAttractions.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {form.generalAttractions.map((item, i) => (
                  <li
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-800/50 text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeGeneralAttraction(i)}
                      className="text-destructive hover:text-destructive/80 p-0.5 rounded"
                      aria-label="Usuń"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="inline-flex gap-2 flex-wrap items-center">
              <Input
                type="text"
                value={attractionInput}
                onChange={(e) => setAttractionInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addGeneralAttraction())
                }
                placeholder="Nazwa atrakcji"
                className="w-48"
              />
              <Button type="button" variant="outline" size="sm" onClick={addGeneralAttraction}>
                Dodaj atrakcję
              </Button>
            </div>
          </div>
        </section>

        {/* Section 5 – Included Items */}
        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-text-main dark:text-white">
              Co w cenie
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
            {INCLUDED_ITEMS_FIXED.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleIncluded(item)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                  form.includedItems.includes(item)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-stone-200 dark:border-stone-600 text-text-main dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                )}
              >
                {form.includedItems.includes(item) && (
                  <span className="material-symbols-outlined text-lg">check</span>
                )}
                {item}
              </button>
            ))}
            {form.customIncludedItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleIncluded(item)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                  form.includedItems.includes(item)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-stone-200 dark:border-stone-600 text-text-main dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                )}
              >
                {form.includedItems.includes(item) && (
                  <span className="material-symbols-outlined text-lg">check</span>
                )}
                {item}
              </button>
            ))}
            </div>
            <div className="inline-flex gap-1">
              <Input
                type="text"
                value={customItemInput}
                onChange={(e) => setCustomItemInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomIncluded())}
                placeholder="Własna pozycja"
                className="w-32 h-9 text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={addCustomIncluded}>
                Dodaj własne
              </Button>
            </div>
          </div>
        </section>

        {/* Bottom actions */}
        <div className="flex gap-2 pt-4 flex-wrap">
          <Button type="button" variant="ghost" asChild>
            <Link href="/admin/wydarzenia">Odrzuć szkic</Link>
          </Button>
          <Button type="button" variant="outline" onClick={handleSaveDraft}>
            Zapisz jako szkic
          </Button>
          <Button type="submit">Opublikuj obóz</Button>
        </div>
      </form>

      {/* Add location dialog */}
      <Dialog
        open={locationDialogOpen}
        onOpenChange={(open) => {
          setLocationDialogOpen(open);
          if (!open) {
            setLocationForm(emptyLocationForm);
            setLocationError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dodaj własną lokalizację</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLocationSubmit} className="space-y-4">
            {locationError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                <div className="flex gap-2">
                  <span className="material-symbols-outlined mt-0.5 text-base" aria-hidden>
                    error
                  </span>
                  <div className="text-sm font-medium leading-relaxed">
                    {locationError}
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="loc-name">Nazwa *</Label>
              <Input
                id="loc-name"
                value={locationForm.name}
                onChange={(e) =>
                  setLocationForm((f) => ({ ...f, name: e.target.value }))
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="loc-address">Adres *</Label>
              <Input
                id="loc-address"
                value={locationForm.address}
                onChange={(e) =>
                  setLocationForm((f) => ({ ...f, address: e.target.value }))
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="loc-city">Miasto *</Label>
              <Input
                id="loc-city"
                value={locationForm.city}
                onChange={(e) =>
                  setLocationForm((f) => ({ ...f, city: e.target.value }))
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="loc-postalCode">Kod pocztowy</Label>
              <Input
                id="loc-postalCode"
                value={locationForm.postalCode}
                onChange={(e) =>
                  setLocationForm((f) => ({ ...f, postalCode: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="loc-mapsUrl">Link do mapy (URL)</Label>
              <Input
                id="loc-mapsUrl"
                type="url"
                value={locationForm.mapsUrl}
                onChange={(e) =>
                  setLocationForm((f) => ({ ...f, mapsUrl: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocationDialogOpen(false)}
              >
                Anuluj
              </Button>
              <Button type="submit">Dodaj lokalizację</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
