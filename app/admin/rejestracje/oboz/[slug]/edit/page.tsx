"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

const MAX_HERO_WIDTH = 1200;
const HERO_JPEG_QUALITY = 0.82;

/** Resize and compress image for hero; returns JPEG blob. */
function optimizeImageForHero(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > MAX_HERO_WIDTH) {
        height = Math.round((height * MAX_HERO_WIDTH) / width);
        width = MAX_HERO_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not available"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
        "image/jpeg",
        HERO_JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

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

function msToDateString(ms: number | undefined): string {
  if (ms == null) return "";
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
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
  galleryImageUrls: string[];
  scheduleByDay: ScheduleDay[];
  includedItems: string[];
  customIncludedItems: string[];
  generalAttractions: string[];
  coachIds: string[];
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

function campToFormState(camp: {
  slug: string;
  name: string;
  description?: string | null;
  startDate: number;
  endDate: number;
  locationId?: Id<"locations">;
  maxParticipants?: number | null;
  price?: number | null;
  isActive: boolean;
  isRegistrationOpen?: boolean | null;
  category?: string | null;
  ageGroup?: string | null;
  heroImageUrl?: string | null;
  galleryImageUrls?: string[] | null;
  scheduleByDay?: Array<{ dayLabel: string; slots: Array<{ time: string; activity: string }> }> | null;
  includedItems?: string[] | null;
  generalAttractions?: string[] | null;
  coachIds?: Id<"coaches">[] | null;
}): CampFormState {
  const category =
    camp.category === "zimowy" || camp.category === "polkolonie"
      ? camp.category
      : "letni";
  const included = camp.includedItems ?? [];
  const customIncluded = included.filter((x) => !INCLUDED_ITEMS_FIXED.includes(x));
  return {
    slug: camp.slug ?? "",
    name: camp.name ?? "",
    description: camp.description ?? "",
    startDate: msToDateString(camp.startDate),
    endDate: msToDateString(camp.endDate),
    locationId: camp.locationId ?? "",
    maxParticipants: camp.maxParticipants != null ? String(camp.maxParticipants) : "",
    price: camp.price != null ? String(camp.price) : "",
    isActive: camp.isActive ?? true,
    isRegistrationOpen: camp.isRegistrationOpen ?? true,
    category,
    ageGroup: camp.ageGroup ?? "",
    heroImageUrl: camp.heroImageUrl ?? "",
    galleryImageUrls: [
      (camp.galleryImageUrls ?? [])[0] ?? "",
      (camp.galleryImageUrls ?? [])[1] ?? "",
    ],
    scheduleByDay:
      camp.scheduleByDay?.map((d) => ({
        dayLabel: d.dayLabel ?? "",
        slots: d.slots?.map((s) => ({ time: s.time ?? "", activity: s.activity ?? "" })) ?? [],
      })) ?? [],
    includedItems: included,
    customIncludedItems: customIncluded,
    generalAttractions: camp.generalAttractions ?? [],
    coachIds: (camp.coachIds ?? []).map((id) => String(id)),
  };
}

export default function AdminEditCampPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug.trim() : "";
  const camp = useQuery(
    api.camps.getCampBySlug,
    slug ? { slug } : "skip"
  );
  const locations = useQuery(api.locations.listForAdmin);
  const coaches = useQuery(api.coaches.listForAdmin);
  const updateCamp = useMutation(api.camps.update);
  const createLocation = useMutation(api.locations.create);
  const generateUploadUrl = useMutation(api.camps.generateUploadUrl);
  const setCampHeroImage = useMutation(api.camps.setCampHeroImage);
  const setCampGalleryImage = useMutation(api.camps.setCampGalleryImage);
  const heroImageFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [form, setForm] = useState<CampFormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [customItemInput, setCustomItemInput] = useState("");
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [locationForm, setLocationForm] = useState<LocationFormState>(emptyLocationForm);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [attractionInput, setAttractionInput] = useState("");
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null);
  const [galleryUploadingIndex, setGalleryUploadingIndex] = useState<number | null>(null);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (camp) {
      setForm(campToFormState(camp));
    }
  }, [camp]);

  const toggleIncluded = useCallback((item: string) => {
    setForm((f) =>
      !f
        ? f
        : {
            ...f,
            includedItems: f.includedItems.includes(item)
              ? f.includedItems.filter((x) => x !== item)
              : [...f.includedItems, item],
          }
    );
  }, []);

  const addScheduleDay = useCallback(() => {
    setForm((f) =>
      !f
        ? f
        : {
            ...f,
            scheduleByDay: [
              ...f.scheduleByDay,
              { dayLabel: `Dzień ${f.scheduleByDay.length + 1}`, slots: [] },
            ],
          }
    );
  }, []);

  const addScheduleSlot = useCallback((dayIndex: number) => {
    setForm((f) => {
      if (!f) return f;
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
        if (!f) return f;
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
      if (!f) return f;
      const next = [...f.scheduleByDay];
      const day = next[dayIndex];
      if (!day) return f;
      next[dayIndex] = { ...day, slots: day.slots.filter((_, i) => i !== slotIndex) };
      return { ...f, scheduleByDay: next };
    });
  }, []);

  const removeScheduleDay = useCallback((dayIndex: number) => {
    setForm((f) =>
      !f ? f : { ...f, scheduleByDay: f.scheduleByDay.filter((_, i) => i !== dayIndex) }
    );
  }, []);

  const addGeneralAttraction = useCallback(() => {
    const trimmed = attractionInput.trim();
    if (!trimmed) return;
    setForm((f) => (f ? { ...f, generalAttractions: [...f.generalAttractions, trimmed] } : f));
    setAttractionInput("");
  }, [attractionInput]);

  const removeGeneralAttraction = useCallback((index: number) => {
    setForm((f) =>
      f ? { ...f, generalAttractions: f.generalAttractions.filter((_, i) => i !== index) } : f
    );
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
        setForm((f) => (f ? { ...f, locationId: id } : f));
        setLocationForm(emptyLocationForm);
        setLocationDialogOpen(false);
      } catch (err) {
        setLocationError(err instanceof Error ? err.message : "Wystąpił błąd.");
      }
    },
    [createLocation, locationForm]
  );

  const handleHeroImageFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !file.type.startsWith("image/") || !camp) return;
      setHeroUploadError(null);
      setHeroUploading(true);
      try {
        const blob = await optimizeImageForHero(file);
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        });
        if (!res.ok) throw new Error("Upload nie powiódł się.");
        const { storageId } = (await res.json()) as { storageId: string };
        if (!storageId) throw new Error("Brak storageId w odpowiedzi.");
        const url = await setCampHeroImage({
          campId: camp._id,
          storageId: storageId as Id<"_storage">,
        });
        setForm((f) => (f ? { ...f, heroImageUrl: url } : f));
      } catch (err) {
        setHeroUploadError(err instanceof Error ? err.message : "Wystąpił błąd.");
      } finally {
        setHeroUploading(false);
      }
    },
    [camp, generateUploadUrl, setCampHeroImage]
  );

  const handleGalleryImageFile = useCallback(
    async (index: 0 | 1, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !file.type.startsWith("image/") || !camp) return;
      setGalleryUploadError(null);
      setGalleryUploadingIndex(index);
      try {
        const blob = await optimizeImageForHero(file);
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        });
        if (!res.ok) throw new Error("Upload nie powiódł się.");
        const { storageId } = (await res.json()) as { storageId: string };
        if (!storageId) throw new Error("Brak storageId w odpowiedzi.");
        const url = await setCampGalleryImage({
          campId: camp._id,
          index,
          storageId: storageId as Id<"_storage">,
        });
        setForm((f) => {
          if (!f) return f;
          const next = [...(f.galleryImageUrls ?? ["", ""])];
          next[index] = url;
          return { ...f, galleryImageUrls: next.slice(0, 2) };
        });
      } catch (err) {
        setGalleryUploadError(err instanceof Error ? err.message : "Wystąpił błąd.");
      } finally {
        setGalleryUploadingIndex(null);
      }
    },
    [camp, generateUploadUrl, setCampGalleryImage]
  );

  const addCustomIncluded = useCallback(() => {
    const trimmed = customItemInput.trim();
    if (!trimmed) return;
    setForm((f) =>
      f
        ? {
            ...f,
            customIncludedItems: [...f.customIncludedItems, trimmed],
            includedItems: [...f.includedItems, trimmed],
          }
        : f
    );
    setCustomItemInput("");
  }, [customItemInput]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!camp || !form) return;
      setError(null);
      setSuccess(null);
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

      setSaving(true);
      try {
        await updateCamp({
          id: camp._id,
          slug: slugValue,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          startDate: startMs,
          endDate: endMs,
          locationId: form.locationId ? (form.locationId as Id<"locations">) : undefined,
          maxParticipants: form.maxParticipants.trim()
            ? parseInt(form.maxParticipants, 10)
            : undefined,
          price: form.price.trim() ? parseFloat(form.price) : undefined,
          isRegistrationOpen: form.isRegistrationOpen,
          category: form.category,
          ageGroup: form.ageGroup.trim() || undefined,
          heroImageUrl: form.heroImageUrl.trim() || undefined,
          galleryImageUrls:
            form.galleryImageUrls.filter(Boolean).length > 0
              ? form.galleryImageUrls.filter(Boolean)
              : undefined,
          scheduleByDay,
          includedItems: form.includedItems,
          generalAttractions: form.generalAttractions,
          coachIds: form.coachIds as Id<"coaches">[],
        });
        setSuccess("Zapisano zmiany.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (slugValue !== slug) {
          router.replace(`/admin/wydarzenia/oboz/${encodeURIComponent(slugValue)}/edit`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd.");
      } finally {
        setSaving(false);
      }
    },
    [camp, form, updateCamp, router, slug]
  );

  if (camp === undefined || (slug && !camp)) {
    return (
      <div className="max-w-3xl">
        <p className="text-text-light dark:text-stone-400">
          {camp === undefined ? "Ładowanie…" : "Nie znaleziono obozu."}
        </p>
        <Link href="/admin/wydarzenia" className="text-primary font-medium risu-underline mt-2 inline-block">
          ← Wydarzenia
        </Link>
      </div>
    );
  }

  if (!form || !camp) return null;

  return (
    <div className="max-w-3xl">
      <nav className="flex items-center gap-2 text-sm text-text-light dark:text-stone-400 mb-6">
        <Link href="/admin/wydarzenia" className="hover:text-primary transition-colors">
          Wydarzenia
        </Link>
        <span aria-hidden>›</span>
        <Link
          href={`/admin/rejestracje/oboz/${encodeURIComponent(camp.slug)}`}
          className="hover:text-primary transition-colors"
        >
          {camp.name}
        </Link>
        <span aria-hidden>›</span>
        <span className="text-text-main dark:text-stone-200">Edycja</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white">
          Edytuj obóz
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" form="camp-edit-form" disabled={saving}>
            {saving ? "Zapisywanie…" : "Zapisz zmiany"}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/wydarzenia/oboz/${encodeURIComponent(camp.slug)}/pytania`}>
              Pytania formularza
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/rejestracje/oboz/${encodeURIComponent(camp.slug)}`}>
              Anuluj
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 shadow-sm">
          <div className="flex gap-3">
            <span className="material-symbols-outlined mt-0.5 text-lg" aria-hidden>
              error
            </span>
            <div className="text-sm md:text-base font-medium leading-relaxed">{error}</div>
          </div>
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4 shadow-sm text-primary font-medium">
          {success}
        </div>
      )}

      <form id="camp-edit-form" onSubmit={handleSubmit} className="space-y-8">
        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
            Obraz główny (hero)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Zdjęcie wyświetlane u góry strony obozu. Prześlij plik lub wklej URL.
          </p>
          <div className="min-h-[140px] rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 p-5 dark:border-stone-600 dark:bg-stone-900/30">
            <input
              ref={heroImageFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleHeroImageFile}
            />
            <h3 className="mb-3 text-sm font-semibold text-text-main dark:text-white">
              Prześlij plik
            </h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full shrink-0 sm:w-auto"
                disabled={heroUploading}
                onClick={() => heroImageFileInputRef.current?.click()}
              >
                {heroUploading ? "Wysyłanie…" : "Dodaj plik"}
              </Button>
              <Input
                type="url"
                value={form.heroImageUrl}
                onChange={(e) =>
                  setForm((f) => (f ? { ...f, heroImageUrl: e.target.value } : f))
                }
                placeholder="URL obrazu"
                className="min-w-0 flex-1"
              />
            </div>
            {form.heroImageUrl ? (
              <div className="relative mx-auto mt-4 w-full max-w-md overflow-hidden rounded-lg border border-stone-200 shadow-sm dark:border-stone-700 sm:mx-0">
                <img
                  src={form.heroImageUrl}
                  alt="Podgląd hero"
                  className="h-40 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => (f ? { ...f, heroImageUrl: "" } : f))}
                  className="absolute right-2 top-2 z-10 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-md backdrop-blur-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900"
                >
                  <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden>
                    delete
                  </span>
                  Usuń obraz
                </button>
              </div>
            ) : null}
            {heroUploadError ? (
              <p className="mt-3 text-sm text-destructive">{heroUploadError}</p>
            ) : null}
          </div>
        </section>

        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
            Podstawowe dane
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="camp-name">Nazwa obozu *</Label>
              <Input
                id="camp-name"
                value={form.name}
                onChange={(e) => setForm((f) => (f ? { ...f, name: e.target.value } : f))}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="camp-slug">Identyfikator URL</Label>
              <Input
                id="camp-slug"
                value={form.slug}
                readOnly
                disabled
                className="mt-1 font-mono text-sm bg-muted cursor-not-allowed"
                title="Identyfikator URL jest generowany przy tworzeniu obozu i nie można go zmienić."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Identyfikator jest ustalany przy tworzeniu obozu i nie podlega edycji.
              </p>
            </div>
            <div>
              <Label className="mb-2 block">Kategoria</Label>
              <div className="flex rounded-lg border border-input bg-muted/30 p-1 w-fit">
                {(["letni", "zimowy", "polkolonie"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((f) => (f ? { ...f, category: cat } : f))}
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
              <Label htmlFor="camp-ageGroup">Grupa wiekowa</Label>
              <select
                id="camp-ageGroup"
                value={form.ageGroup}
                onChange={(e) => setForm((f) => (f ? { ...f, ageGroup: e.target.value } : f))}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— wybierz —</option>
                {[
                  ...(form.ageGroup && !AGE_GROUPS.includes(form.ageGroup)
                    ? [form.ageGroup]
                    : []),
                  ...AGE_GROUPS,
                ].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="camp-locationId">Lokalizacja</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-primary h-auto py-1"
                  onClick={() => setLocationDialogOpen(true)}
                >
                  Dodaj lokalizację
                </Button>
              </div>
              <select
                id="camp-locationId"
                value={form.locationId}
                onChange={(e) => setForm((f) => (f ? { ...f, locationId: e.target.value } : f))}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— wybierz —</option>
                {locations?.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="camp-startDate">Data rozpoczęcia *</Label>
                <Input
                  id="camp-startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => (f ? { ...f, startDate: e.target.value } : f))}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="camp-endDate">Data zakończenia *</Label>
                <Input
                  id="camp-endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => (f ? { ...f, endDate: e.target.value } : f))}
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </div>
        </section>

        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
            Trenerzy
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Wybierz trenerów przypisanych do tego obozu (wyświetlani na stronie obozu).
          </p>
          <div className="flex flex-wrap gap-4">
            {coaches?.map((c) => {
              const coachIdStr = String(c._id);
              const isCoachSelected = form.coachIds.some((id) => String(id) === coachIdStr);
              return (
              <div key={c._id} className="flex items-center gap-2">
                <Checkbox
                  id={`coach-${c._id}`}
                  checked={isCoachSelected}
                  onCheckedChange={(checked) => {
                    setForm((f) => {
                      if (!f) return f;
                      if (checked === true) {
                        if (f.coachIds.some((id) => String(id) === coachIdStr)) return f;
                        return { ...f, coachIds: [...f.coachIds, coachIdStr] };
                      }
                      if (checked === false) {
                        return {
                          ...f,
                          coachIds: f.coachIds.filter((id) => String(id) !== coachIdStr),
                        };
                      }
                      return f;
                    });
                  }}
                />
                <Label
                  htmlFor={`coach-${c._id}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {c.name}
                  {c.disciplines?.length ? ` (${c.disciplines.join(", ")})` : ""}
                </Label>
              </div>
            );
            }) ?? null}
            {coaches?.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak trenerów. Dodaj trenerów w sekcji Admin → Trenerzy.</p>
            ) : null}
          </div>
        </section>

        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
            Media i opis
          </h2>
          <div className="space-y-6">
            <div>
              <Label className="mb-2 block">Dodatkowe zdjęcia (max 2)</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Zdjęcia wyświetlane na stronie obozu w sekcji galerii. Prześlij plik lub wklej URL.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {([0, 1] as const).map((index) => {
                  const url = form.galleryImageUrls[index] ?? "";
                  return (
                    <div
                      key={index}
                      className="flex min-h-[120px] flex-col rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 p-4 dark:border-stone-600 dark:bg-stone-900/30"
                    >
                      <input
                        ref={(el) => { galleryFileInputRefs.current[index] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleGalleryImageFile(index, e)}
                      />
                      <h3 className="mb-3 text-sm font-semibold text-text-main dark:text-white">
                        Prześlij plik
                      </h3>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="w-full shrink-0 sm:w-auto"
                          disabled={galleryUploadingIndex !== null}
                          onClick={() => galleryFileInputRefs.current[index]?.click()}
                        >
                          {galleryUploadingIndex === index ? "Wysyłanie…" : "Dodaj plik"}
                        </Button>
                        <Input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((f) => {
                              if (!f) return f;
                              const next = [...(f.galleryImageUrls ?? ["", ""])];
                              next[index] = v;
                              return { ...f, galleryImageUrls: next.slice(0, 2) };
                            });
                          }}
                          placeholder="URL obrazu"
                          className="min-w-0 flex-1 text-sm"
                        />
                      </div>
                      {url ? (
                        <div className="relative mt-3 w-full overflow-hidden rounded-lg border border-stone-200 shadow-sm dark:border-stone-700">
                          <img
                            src={url}
                            alt={`Galeria ${index + 1}`}
                            className="h-28 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => {
                                if (!f) return f;
                                const next = [...(f.galleryImageUrls ?? ["", ""])];
                                next[index] = "";
                                return { ...f, galleryImageUrls: next.slice(0, 2) };
                              })
                            }
                            className="absolute right-2 top-2 z-10 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-md backdrop-blur-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-900"
                          >
                            <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden>
                              delete
                            </span>
                            Usuń obraz
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              {galleryUploadError ? (
                <p className="text-sm text-destructive mt-2">{galleryUploadError}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="camp-description">Opis</Label>
              <Textarea
                id="camp-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => (f ? { ...f, description: e.target.value } : f))
                }
                className="mt-1 min-h-[120px]"
              />
            </div>
          </div>
        </section>

        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
            Cena i liczba miejsc
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="camp-price">Cena (PLN)</Label>
              <Input
                id="camp-price"
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm((f) => (f ? { ...f, price: e.target.value } : f))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="camp-maxParticipants">Maks. uczestników</Label>
              <Input
                id="camp-maxParticipants"
                type="number"
                min={1}
                value={form.maxParticipants}
                onChange={(e) =>
                  setForm((f) => (f ? { ...f, maxParticipants: e.target.value } : f))
                }
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="camp-isRegistrationOpen"
                checked={form.isRegistrationOpen}
                onCheckedChange={(c) =>
                  setForm((f) => (f ? { ...f, isRegistrationOpen: c === true } : f))
                }
              />
              <Label htmlFor="camp-isRegistrationOpen" className="text-sm font-medium cursor-pointer">
                Rejestracja otwarta
              </Label>
            </div>
          </div>
        </section>

        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-main dark:text-white">
              Program dnia
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={addScheduleDay}>
              Dodaj dzień
            </Button>
          </div>
          <div className="space-y-6">
            {form.scheduleByDay.length === 0 ? (
              <p className="text-sm text-text-light dark:text-stone-400">
                Brak dni. Kliknij „Dodaj dzień”.
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
                      onChange={(e) => {
                        setForm((f) => {
                          if (!f) return f;
                          const next = [...f.scheduleByDay];
                          next[dayIndex] = { ...next[dayIndex]!, dayLabel: e.target.value };
                          return { ...f, scheduleByDay: next };
                        });
                      }}
                      placeholder="np. Dzień 1"
                      className="w-40"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive ml-auto"
                      onClick={() => removeScheduleDay(dayIndex)}
                    >
                      Usuń dzień
                    </Button>
                  </div>
                  <div className="space-y-2 pl-2">
                    {day.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex gap-2 items-start">
                        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                          <Input
                            type="time"
                            value={slot.time}
                            onChange={(e) =>
                              updateScheduleSlot(dayIndex, slotIndex, "time", e.target.value)
                            }
                            className="h-10 w-full min-w-[9.5rem] shrink-0 font-mono sm:w-[10.5rem] md:min-w-[11rem] md:w-44"
                          />
                          <Input
                            placeholder="Aktywność"
                            value={slot.activity}
                            onChange={(e) =>
                              updateScheduleSlot(dayIndex, slotIndex, "activity", e.target.value)
                            }
                            className="min-h-10 min-w-0 flex-1"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive shrink-0"
                          onClick={() => removeScheduleSlot(dayIndex, slotIndex)}
                          aria-label="Usuń slot"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </Button>
                      </div>
                    ))}
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

        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
            Atrakcje ogólne
          </h2>
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
                        setForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                generalAttractions: [...prev.generalAttractions, item],
                              }
                            : prev
                        );
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
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGeneralAttraction())}
                placeholder="Nazwa atrakcji"
                className="w-48"
              />
              <Button type="button" variant="outline" size="sm" onClick={addGeneralAttraction}>
                Dodaj
              </Button>
            </div>
          </div>
        </section>

        <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50">
          <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
            Co w cenie
          </h2>
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
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addCustomIncluded())
                }
                placeholder="Własna pozycja"
                className="w-32 h-9 text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={addCustomIncluded}>
                Dodaj własne
              </Button>
            </div>
          </div>
        </section>

        <div className="flex gap-2 flex-wrap">
          <Button type="submit" disabled={saving}>
            {saving ? "Zapisywanie…" : "Zapisz zmiany"}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/rejestracje/oboz/${encodeURIComponent(camp.slug)}`}>
              Anuluj
            </Link>
          </Button>
        </div>
      </form>

      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dodaj lokalizację</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLocationSubmit} className="space-y-4">
            {locationError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-sm">
                {locationError}
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
              <Label htmlFor="loc-mapsUrl">Link do map (URL)</Label>
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
              <Button type="button" variant="outline" onClick={() => setLocationDialogOpen(false)}>
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
