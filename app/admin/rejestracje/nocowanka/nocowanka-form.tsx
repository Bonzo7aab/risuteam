"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import imageCompression from "browser-image-compression";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type AttractionFormRow = { title: string; description: string };
type ScheduleFormRow = { time: string; title: string; description: string };

export type NocowankaFormState = {
  slug: string;
  name: string;
  description: string;
  badge: string;
  startDate: string;
  endDate: string;
  locationLabel: string;
  maxParticipants: string;
  price: string;
  priceDisplay: string;
  priceIncluded: string[];
  whatToBring: string[];
  imageUrls: string[];
  availabilityPercent: string;
  isActive: boolean;
  attractions: AttractionFormRow[];
  schedule: ScheduleFormRow[];
};

const KLUBOWA_TEMPLATE: NocowankaFormState = {
  slug: "klubowa",
  name: "Klubowa Nocowanka",
  description:
    "Dołącz do nas na najbardziej ekscytującą noc pełną gier, pizzy i nocnych przygód z Risu Team!",
  badge: "jednodniowa",
  startDate: "2026-03-06",
  endDate: "2026-03-07",
  locationLabel: "B.P. w Zamienniku",
  maxParticipants: "50",
  price: "170",
  priceDisplay: "170 PLN",
  priceIncluded: [
    "Pizza i napoje",
    "Gry i atrakcje",
    "Opieka kadry",
    "Śniadanie",
  ],
  whatToBring: [
    "Śpiwór",
    "Poduszka",
    "Ubranie na zmianę",
    "Przybory toaletowe",
    "Ulubiona przytulanka",
  ],
  imageUrls: [],
  availabilityPercent: "75",
  isActive: true,
  attractions: [
    { title: "Gry i Zabawy", description: "" },
    { title: "Uczta Pizza", description: "" },
    { title: "Seanse Kinowe", description: "" },
    { title: "Dyskoteka", description: "" },
    { title: "Spanie na Macie", description: "" },
  ],
  schedule: [
    { time: "19:00", title: "Przyjazd i Zakwaterowanie", description: "" },
    { time: "20:00", title: "Czas na Pizzę", description: "" },
    { time: "21:00", title: "Kino & Gry", description: "" },
    { time: "22:30", title: "Cisza Nocna", description: "" },
    { time: "08:00", title: "Śniadanie i Odbiór", description: "" },
  ],
};

export function emptyNocowankaForm(): NocowankaFormState {
  return {
    slug: "",
    name: "",
    description: "",
    badge: "jednodniowa",
    startDate: "",
    endDate: "",
    locationLabel: "",
    maxParticipants: "",
    price: "",
    priceDisplay: "",
    availabilityPercent: "",
    priceIncluded: [],
    whatToBring: [],
    imageUrls: [],
    isActive: true,
    attractions: [{ title: "", description: "" }],
    schedule: [{ time: "", title: "", description: "" }],
  };
}

function docToForm(doc: Doc<"nocowanki">): NocowankaFormState {
  const normalizedBadge =
    doc.badge === "jednodniowy"
      ? "jednodniowa"
      : doc.badge === "dwudniowy"
        ? "dwudniowa"
        : (doc.badge ?? "jednodniowa");
  return {
    slug: doc.slug,
    name: doc.name,
    description: doc.description ?? "",
    badge: normalizedBadge,
    startDate: "",
    endDate: "",
    locationLabel: doc.locationLabel ?? "",
    maxParticipants:
      doc.maxParticipants != null ? String(doc.maxParticipants) : "",
    price: doc.price != null ? String(doc.price) : "",
    priceDisplay: doc.priceDisplay ?? "",
    availabilityPercent:
      doc.availabilityPercent != null ? String(doc.availabilityPercent) : "",
    priceIncluded: doc.priceIncluded?.length ? [...doc.priceIncluded] : [],
    whatToBring: doc.whatToBring?.length ? [...doc.whatToBring] : [],
    imageUrls: doc.imageUrls?.length ? [...doc.imageUrls].slice(0, 2) : [],
    isActive: doc.isActive,
    attractions: doc.attractions?.length
      ? doc.attractions.map((a) => ({ title: a.title, description: a.description }))
      : [{ title: "", description: "" }],
    schedule: doc.schedule?.length
      ? doc.schedule.map((s) => ({ ...s }))
      : [{ time: "", title: "", description: "" }],
  };
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

function formatDateRangeLabel(startDate: string, endDate: string): string | undefined {
  if (!startDate || !endDate) return undefined;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return undefined;
  }
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const startTxt = start.toLocaleDateString("pl-PL", opts);
  const endTxt = end.toLocaleDateString("pl-PL", opts);
  return `${startTxt} – ${endTxt}`;
}

function normalizedLists(f: NocowankaFormState) {
  const attractions = f.attractions
    .filter((a) => a.title.trim() || a.description.trim())
    .map((a) => ({
      icon: "stars",
      title: a.title.trim(),
      description: (a.description ?? "").trim(),
    }));

  const schedule = f.schedule
    .filter((s) => s.time.trim() || s.title.trim() || s.description.trim())
    .map((s) => ({
      time: s.time.trim(),
      title: s.title.trim(),
      description: (s.description ?? "").trim(),
    }));

  const whatToBring = f.whatToBring.map((x) => x.trim()).filter(Boolean);
  const priceIncluded = f.priceIncluded.map((x) => x.trim()).filter(Boolean);
  const imageUrls = f.imageUrls.map((x) => x.trim()).filter(Boolean).slice(0, 2);

  const maxP = f.maxParticipants.trim()
    ? parseInt(f.maxParticipants, 10)
    : undefined;
  const priceN = f.price.trim() ? parseFloat(f.price) : undefined;
  const avail = f.availabilityPercent.trim()
    ? parseInt(f.availabilityPercent, 10)
    : undefined;
  return {
    slug: f.slug.trim(),
    name: f.name.trim(),
    description: f.description.trim() || undefined,
    maxParticipants:
      maxP !== undefined && !Number.isNaN(maxP) ? maxP : undefined,
    price: priceN !== undefined && !Number.isNaN(priceN) ? priceN : undefined,
    isActive: f.isActive,
    badge: f.badge.trim() || undefined,
    titlePart1: undefined,
    titlePart2: undefined,
    datesLabel: formatDateRangeLabel(f.startDate, f.endDate),
    locationLabel: f.locationLabel.trim() || undefined,
    priceDisplay: f.priceDisplay.trim() || undefined,
    availabilityPercent:
      avail !== undefined && !Number.isNaN(avail) ? avail : undefined,
    stats: [],
    attractions,
    schedule,
    whatToBring,
    priceIncluded,
    imageUrls,
  };
}

function formToCreateArgs(f: NocowankaFormState) {
  const n = normalizedLists(f);
  return {
    slug: n.slug,
    name: n.name,
    description: n.description,
    maxParticipants: n.maxParticipants,
    price: n.price,
    isActive: n.isActive,
    badge: n.badge,
    titlePart1: n.titlePart1,
    titlePart2: n.titlePart2,
    datesLabel: n.datesLabel,
    locationLabel: n.locationLabel,
    priceDisplay: n.priceDisplay,
    availabilityPercent: n.availabilityPercent,
    stats: n.stats.length ? n.stats : undefined,
    attractions: n.attractions.length ? n.attractions : undefined,
    schedule: n.schedule.length ? n.schedule : undefined,
    whatToBring: n.whatToBring.length ? n.whatToBring : undefined,
    priceIncluded: n.priceIncluded.length ? n.priceIncluded : undefined,
    imageUrls: n.imageUrls.length ? n.imageUrls : undefined,
  };
}

function formToUpdateArgs(f: NocowankaFormState) {
  const n = normalizedLists(f);
  return {
    slug: n.slug,
    name: n.name,
    description: n.description,
    maxParticipants: n.maxParticipants,
    price: n.price,
    isActive: n.isActive,
    badge: n.badge,
    titlePart1: n.titlePart1,
    titlePart2: n.titlePart2,
    datesLabel: n.datesLabel,
    locationLabel: n.locationLabel,
    priceDisplay: n.priceDisplay,
    availabilityPercent: n.availabilityPercent,
    stats: n.stats,
    attractions: n.attractions,
    schedule: n.schedule,
    whatToBring: n.whatToBring,
    priceIncluded: n.priceIncluded,
    imageUrls: n.imageUrls,
  };
}

type NocowankaEditorProps = {
  variant: "create" | "edit";
  /** Loaded nocowanka for edit; undefined = still loading */
  doc?: Doc<"nocowanki"> | null;
  /** Route slug for edit (used to reset hydration when navigating) */
  editSlug?: string;
};

export function NocowankaEditor({ variant, doc, editSlug }: NocowankaEditorProps) {
  const router = useRouter();
  const createNocowanka = useMutation(api.nocowanki.create);
  const updateNocowanka = useMutation(api.nocowanki.update);
  const generateUploadUrl = useMutation(api.nocowanki.generateUploadUrl);
  const resolveImageUrl = useMutation(api.nocowanki.resolveImageUrl);
  const nocowankiForPicker = useQuery(api.nocowanki.listForAdmin, {});

  const [form, setForm] = useState<NocowankaFormState>(() =>
    emptyNocowankaForm()
  );
  const [editFormReady, setEditFormReady] = useState(variant === "create");
  const [whatInput, setWhatInput] = useState("");
  const [includedInput, setIncludedInput] = useState("");
  const [templateSourceId, setTemplateSourceId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);
  const imageFileInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (variant !== "edit") {
      setEditFormReady(true);
      return;
    }
    setEditFormReady(false);
  }, [variant, editSlug]);

  useEffect(() => {
    if (variant !== "edit" || doc === undefined || doc === null) return;
    setForm(docToForm(doc));
    setEditFormReady(true);
    // Only re-hydrate when the document identity changes (not on every query refresh).
  }, [variant, doc?._id]);

  const applyKlubowaTemplate = useCallback(() => {
    setForm({ ...KLUBOWA_TEMPLATE });
    setTemplateSourceId("__klubowa__");
    setError(null);
  }, []);

  const recentNocowanki = (nocowankiForPicker ?? [])
    .slice()
    .sort((a, b) => b._creationTime - a._creationTime)
    .slice(0, 12);

  const applyRecentTemplate = useCallback(
    (sourceId: string) => {
      if (!sourceId) {
        setTemplateSourceId("");
        return;
      }
      if (sourceId === "__klubowa__") {
        applyKlubowaTemplate();
        return;
      }
      const source = recentNocowanki.find((item) => item._id === sourceId);
      if (!source) return;
      const next = docToForm(source);
      setForm({ ...next, slug: slugify(next.name) });
      setTemplateSourceId(sourceId);
      setError(null);
    },
    [applyKlubowaTemplate, recentNocowanki]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.slug.trim() || !form.name.trim()) {
      setError("Slug i nazwa są wymagane.");
      return;
    }
    if (form.imageUrls.some((url) => url.trim().startsWith("data:"))) {
      setError("Zdjęcia muszą być podane jako URL (https://...), nie jako wklejony plik base64.");
      return;
    }
    setSaving(true);
    try {
      if (variant === "create") {
        const payload = formToCreateArgs(form);
        await createNocowanka({
          slug: payload.slug,
          name: payload.name,
          description: payload.description,
          maxParticipants: payload.maxParticipants,
          price: payload.price,
          isActive: payload.isActive,
          badge: payload.badge,
          datesLabel: payload.datesLabel,
          locationLabel: payload.locationLabel,
          stats: undefined,
          attractions: payload.attractions,
          whatToBring: payload.whatToBring,
          priceIncluded: payload.priceIncluded,
          imageUrls: payload.imageUrls,
          priceDisplay: payload.priceDisplay,
          availabilityPercent: payload.availabilityPercent,
          schedule: payload.schedule,
        });
        router.push(
          `/admin/rejestracje/nocowanka/${encodeURIComponent(payload.slug)}`
        );
      } else {
        if (!doc) throw new Error("Brak dokumentu nocowanki.");
        const payload = formToUpdateArgs(form);
        await updateNocowanka({
          id: doc._id as Id<"nocowanki">,
          slug: payload.slug,
          name: payload.name,
          description: payload.description,
          maxParticipants: payload.maxParticipants,
          price: payload.price,
          isActive: payload.isActive,
          badge: payload.badge,
          datesLabel: payload.datesLabel ?? doc.datesLabel,
          locationLabel: payload.locationLabel,
          stats: [],
          attractions: payload.attractions,
          whatToBring: payload.whatToBring,
          priceIncluded: payload.priceIncluded,
          imageUrls: payload.imageUrls,
          priceDisplay: payload.priceDisplay,
          availabilityPercent: payload.availabilityPercent,
          schedule: payload.schedule,
        });
        router.push(
          `/admin/rejestracje/nocowanka/${encodeURIComponent(payload.slug)}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setSaving(false);
    }
  };

  const addAttraction = () =>
    setForm((f) => ({
      ...f,
      attractions: [...f.attractions, { title: "", description: "" }],
    }));
  const updateAttraction = (
    i: number,
    field: "title" | "description",
    value: string
  ) => {
    setForm((f) => {
      const next = [...f.attractions];
      const row = next[i];
      if (!row) return f;
      next[i] = { ...row, [field]: value };
      return { ...f, attractions: next };
    });
  };
  const removeAttraction = (i: number) =>
    setForm((f) => ({
      ...f,
      attractions: f.attractions.filter((_, j) => j !== i),
    }));

  const addScheduleRow = () =>
    setForm((f) => ({
      ...f,
      schedule: [...f.schedule, { time: "", title: "", description: "" }],
    }));
  const updateSchedule = (
    i: number,
    field: "time" | "title" | "description",
    value: string
  ) => {
    setForm((f) => {
      const next = [...f.schedule];
      const row = next[i];
      if (!row) return f;
      next[i] = { ...row, [field]: value };
      return { ...f, schedule: next };
    });
  };
  const removeSchedule = (i: number) =>
    setForm((f) => ({
      ...f,
      schedule: f.schedule.filter((_, j) => j !== i),
    }));

  const addWhatToBring = () => {
    const t = whatInput.trim();
    if (!t) return;
    setForm((f) => ({ ...f, whatToBring: [...f.whatToBring, t] }));
    setWhatInput("");
  };
  const removeWhatToBring = (i: number) =>
    setForm((f) => ({
      ...f,
      whatToBring: f.whatToBring.filter((_, j) => j !== i),
    }));

  const addPriceIncluded = () => {
    const t = includedInput.trim();
    if (!t) return;
    setForm((f) => ({ ...f, priceIncluded: [...f.priceIncluded, t] }));
    setIncludedInput("");
  };
  const removePriceIncluded = (i: number) =>
    setForm((f) => ({
      ...f,
      priceIncluded: f.priceIncluded.filter((_, j) => j !== i),
    }));

  const addImageUrlField = () =>
    setForm((f) => {
      if (f.imageUrls.length >= 2) return f;
      return { ...f, imageUrls: [...f.imageUrls, ""] };
    });
  const updateImageUrl = (i: number, value: string) =>
    setForm((f) => {
      const next = [...f.imageUrls];
      if (i < 0 || i >= next.length) return f;
      next[i] = value;
      return { ...f, imageUrls: next };
    });
  const removeImageUrl = (i: number) =>
    setForm((f) => ({
      ...f,
      imageUrls: f.imageUrls.filter((_, j) => j !== i),
    }));
  const handleImageFile = useCallback(
    async (index: number, file?: File) => {
      if (!file || !file.type.startsWith("image/")) return;
      setError(null);
      setUploadingImageIndex(index);
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.7,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          initialQuality: 0.82,
        });
        const uploadUrl = await generateUploadUrl();
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": compressedFile.type || "image/jpeg" },
          body: compressedFile,
        });
        if (!uploadRes.ok) throw new Error("Upload obrazu nie powiódł się.");
        const { storageId } = (await uploadRes.json()) as { storageId?: string };
        if (!storageId) throw new Error("Brak storageId w odpowiedzi uploadu.");
        const url = await resolveImageUrl({
          storageId: storageId as Id<"_storage">,
        });
        updateImageUrl(index, url);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Nie udało się przesłać obrazu. Spróbuj ponownie."
        );
      } finally {
        setUploadingImageIndex(null);
      }
    },
    [generateUploadUrl, resolveImageUrl]
  );

  if (variant === "edit" && doc === undefined) {
    return (
      <p className="text-text-light dark:text-stone-400">Ładowanie…</p>
    );
  }

  if (variant === "edit" && doc && !editFormReady) {
    return (
      <p className="text-text-light dark:text-stone-400">Ładowanie…</p>
    );
  }

  if (variant === "edit" && doc === null) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Nie znaleziono nocowanki w bazie.</p>
        <Button asChild variant="outline">
          <Link href="/admin/wydarzenia">Wróć do listy</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 max-w-3xl text-left"
    >
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/wydarzenia">← Wydarzenia</Link>
        </Button>
        {variant === "create" && (
          <div className="flex items-center gap-2">
            <Label htmlFor="n-fill-like" className="text-sm">
              Wypełnij jak
            </Label>
            <select
              id="n-fill-like"
              value={templateSourceId}
              onChange={(e) => applyRecentTemplate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Wybierz nocowankę...</option>
              <option value="__klubowa__">Klubowa (szablon)</option>
              {recentNocowanki.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Podstawowe + Hero */}
      <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-text-main dark:text-white">
            Podstawowe
          </h2>
          <div className="flex items-center gap-3">
            <Label className="text-sm text-text-main dark:text-stone-200">
              Status
            </Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="n-active"
                checked={form.isActive}
                onCheckedChange={(c) =>
                  setForm((f) => ({ ...f, isActive: c === true }))
                }
              />
              <Label htmlFor="n-active" className="cursor-pointer text-sm">
                Aktywna
              </Label>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="n-name" className="text-text-main dark:text-stone-200">
              Tytuł *
            </Label>
            <Input
              id="n-name"
              value={form.name}
              onChange={(e) =>
                setForm((f) => {
                  const name = e.target.value;
                  return { ...f, name, slug: slugify(name) };
                })
              }
              className="mt-1"
              required
            />
            <p className="mt-1 text-xs text-text-light dark:text-stone-400 font-mono">
              Slug: {form.slug || "—"}
            </p>
          </div>
          {variant === "create" ? (
            <div className="sm:col-span-2">
              <Label htmlFor="n-slug" className="text-text-main dark:text-stone-200">
                Slug *
              </Label>
              <Input
                id="n-slug"
                value={form.slug}
                className="mt-1 font-mono text-sm"
                placeholder="np. klubowa"
                required
                readOnly
              />
              <p className="mt-1 text-xs text-text-light dark:text-stone-400">
                Automatycznie generowany na podstawie tytułu.
              </p>
            </div>
          ) : null}
        </div>
        <div>
          <Label htmlFor="n-desc" className="text-text-main dark:text-stone-200">
            Opis
          </Label>
          <Textarea
            id="n-desc"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="mt-1 min-h-[100px]"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="n-badge" className="text-text-main dark:text-stone-200">
              Czas trwania
            </Label>
            <select
              id="n-badge"
              value={form.badge}
              onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="jednodniowa">Jednodniowa</option>
              <option value="dwudniowa">Dwudniowa</option>
            </select>
          </div>
          <div>
            <Label htmlFor="n-loc" className="text-text-main dark:text-stone-200">
              Miejsce
            </Label>
            <Input
              id="n-loc"
              value={form.locationLabel}
              onChange={(e) =>
                setForm((f) => ({ ...f, locationLabel: e.target.value }))
              }
              className="mt-1"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="n-startDate" className="text-text-main dark:text-stone-200">
              Data rozpoczęcia
            </Label>
            <Input
              id="n-startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="n-endDate" className="text-text-main dark:text-stone-200">
              Data zakończenia
            </Label>
            <Input
              id="n-endDate"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              className="mt-1"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="n-max" className="text-text-main dark:text-stone-200">
              Maks. uczestników
            </Label>
            <Input
              id="n-max"
              type="number"
              min={1}
              value={form.maxParticipants}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxParticipants: e.target.value }))
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="n-price" className="text-text-main dark:text-stone-200">
              Cena
            </Label>
            <Input
              id="n-price"
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              className="mt-1"
            />
          </div>
        </div>
      </section>

      {/* Zdjęcia */}
      <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text-main dark:text-white">
            Zdjęcia
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageUrlField}
            disabled={form.imageUrls.length >= 2}
          >
            Dodaj zdjęcie
          </Button>
        </div>
        <p className="text-xs text-text-light dark:text-stone-400">
          Maksymalnie 2 zdjęcia. Podaj bezpośrednie URL-e obrazów (https://...).
        </p>
        {form.imageUrls.length === 0 ? (
          <p className="text-sm text-text-light dark:text-stone-400">
            Brak zdjęć. Dodaj przynajmniej jedno, jeśli nocowanka ma galerię.
          </p>
        ) : (
          <div className="space-y-3">
            {form.imageUrls.map((url, i) => (
              <div
                key={i}
                className="border-2 border-dashed border-stone-200 dark:border-stone-600 rounded-xl p-4 bg-stone-50 dark:bg-stone-900/30 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-text-main dark:text-stone-200">
                    Zdjęcie {i + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => removeImageUrl(i)}
                  >
                    Usuń
                  </Button>
                </div>
                <p className="text-xs text-text-light dark:text-stone-400">
                  Prześlij plik (zostanie automatycznie skompresowany) lub wklej URL.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={(el) => {
                      imageFileInputRefs.current[i] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      void handleImageFile(i, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={uploadingImageIndex === i}
                    onClick={() => imageFileInputRefs.current[i]?.click()}
                  >
                    {uploadingImageIndex === i ? "Przesyłanie..." : "Prześlij plik"}
                  </Button>
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => updateImageUrl(i, e.target.value)}
                    placeholder={`Lub wklej URL zdjęcia ${i + 1}`}
                    className="max-w-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Atrakcje */}
      <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text-main dark:text-white">
            Główne atrakcje
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={addAttraction}>
            Dodaj kartę
          </Button>
        </div>
        <div className="space-y-4">
          {form.attractions.map((row, i) => (
            <div
              key={i}
              className="rounded-lg border border-stone-200 dark:border-stone-600 p-3 space-y-2"
            >
              <Input
                placeholder="Tytuł"
                value={row.title}
                onChange={(e) =>
                  updateAttraction(i, "title", e.target.value)
                }
              />
              <Input
                placeholder="Opis (opcjonalnie)"
                value={row.description}
                onChange={(e) =>
                  updateAttraction(i, "description", e.target.value)
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => removeAttraction(i)}
              >
                Usuń kartę
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Cena i co zabrać */}
      <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50 space-y-4">
        <h2 className="text-lg font-semibold text-text-main dark:text-white">
          Cena i wyposażenie
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="n-priceDisp" className="text-text-main dark:text-stone-200">
              Cena
            </Label>
            <Input
              id="n-priceDisp"
              value={form.priceDisplay}
              onChange={(e) =>
                setForm((f) => ({ ...f, priceDisplay: e.target.value }))
              }
              className="mt-1"
              placeholder="np. 170 PLN"
            />
          </div>
          <div>
            <Label htmlFor="n-avail" className="text-text-main dark:text-stone-200">
              Dostępne miejsca
            </Label>
            <Input
              id="n-avail"
              type="number"
              min={0}
              max={100}
              value={form.availabilityPercent}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  availabilityPercent: e.target.value,
                }))
              }
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-text-main dark:text-stone-200">
              W cenie
            </Label>
            <div className="mt-1 flex flex-col gap-2 lg:flex-row lg:items-start">
              <div className="flex min-w-0 w-full gap-2 lg:w-1/2">
                <Input
                  value={includedInput}
                  onChange={(e) => setIncludedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPriceIncluded();
                    }
                  }}
                  placeholder="Dodaj pozycję i Enter"
                  className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={addPriceIncluded}>
                  Dodaj
                </Button>
              </div>
              <ul className="flex flex-wrap gap-2 lg:w-1/2 lg:justify-end">
                {form.priceIncluded.map((item, i) => (
                  <li
                    key={`${item}-${i}`}
                    className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      className="text-destructive text-xs"
                      onClick={() => removePriceIncluded(i)}
                      aria-label="Usuń"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-text-main dark:text-stone-200">
              Co zabrać
            </Label>
            <div className="mt-1 flex flex-col gap-2 lg:flex-row lg:items-start">
              <div className="flex min-w-0 w-full gap-2 lg:w-1/2">
                <Input
                  value={whatInput}
                  onChange={(e) => setWhatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addWhatToBring();
                    }
                  }}
                  placeholder="Dodaj pozycję i Enter"
                  className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={addWhatToBring}>
                  Dodaj
                </Button>
              </div>
              <ul className="flex flex-wrap gap-2 lg:w-1/2 lg:justify-end">
                {form.whatToBring.map((item, i) => (
                  <li
                    key={`${item}-${i}`}
                    className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      className="text-destructive text-xs"
                      onClick={() => removeWhatToBring(i)}
                      aria-label="Usuń"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Harmonogram */}
      <section className="p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text-main dark:text-white">
            Harmonogram nocy
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={addScheduleRow}>
            Dodaj slot
          </Button>
        </div>
        <div className="space-y-3">
          {form.schedule.map((row, i) => (
            <div
              key={i}
              className="grid gap-2 sm:grid-cols-12 items-end border-b border-stone-100 dark:border-stone-800 pb-3"
            >
              <div className="sm:col-span-2">
                <Label className="text-xs">Godzina</Label>
                <Input
                  type="time"
                  value={row.time}
                  onChange={(e) =>
                    updateSchedule(i, "time", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-4">
                <Label className="text-xs">Tytuł</Label>
                <Input
                  value={row.title}
                  onChange={(e) =>
                    updateSchedule(i, "title", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-5">
                <Label className="text-xs">Opis</Label>
                <Input
                  value={row.description}
                  onChange={(e) =>
                    updateSchedule(i, "description", e.target.value)
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive sm:col-span-1"
                onClick={() => removeSchedule(i)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {form.slug.trim() ? (
            <Button asChild variant="outline" type="button" className="font-semibold">
              <Link
                href={`/admin/wydarzenia/nocowanka/${encodeURIComponent(form.slug.trim())}/pytania`}
              >
                Pytania formularza
              </Link>
            </Button>
          ) : (
            <p className="self-center text-xs text-text-light dark:text-stone-400">
              Ustaw slug nocowanki, aby przejść do pytań formularza.
            </p>
          )}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" type="button">
            <Link href="/admin/wydarzenia">Anuluj</Link>
          </Button>
          <Button type="submit" disabled={saving} className="min-w-[160px]">
            {saving
              ? "Zapisywanie…"
              : variant === "create"
                ? "Utwórz nocowankę"
                : "Zapisz zmiany"}
          </Button>
        </div>
      </div>
    </form>
  );
}
