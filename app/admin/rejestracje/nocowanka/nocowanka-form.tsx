"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
import { cn } from "@/lib/utils";

function FormSection({
  icon,
  title,
  description,
  actions,
  children,
}: {
  icon: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900/60">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 bg-stone-50 px-5 py-4 dark:border-stone-700 dark:bg-stone-800/60 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-primary">
              {icon}
            </span>
            <h2 className="text-base font-bold text-text-main dark:text-white">
              {title}
            </h2>
          </div>
          {description ? (
            <p className="mt-1 text-sm text-text-light dark:text-stone-400">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="space-y-4 p-5 sm:p-6">{children}</div>
    </section>
  );
}

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
    if (!form.name.trim()) {
      setError("Nazwa jest wymagana.");
      return;
    }
    const slugValue = form.slug.trim() || slugify(form.name);
    if (!slugValue) {
      setError("Nie udało się wygenerować identyfikatora URL z nazwy.");
      return;
    }
    if (form.imageUrls.some((url) => url.trim().startsWith("data:"))) {
      setError("Zdjęcia muszą być podane jako URL (https://...), nie jako wklejony plik base64.");
      return;
    }
    setSaving(true);
    try {
      if (variant === "create") {
        const payload = formToCreateArgs({ ...form, slug: slugValue });
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
        const payload = formToUpdateArgs({
          ...form,
          slug: form.slug.trim() || doc.slug,
        });
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
      id="nocowanka-form"
      onSubmit={handleSubmit}
      className="space-y-5 text-left"
    >
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      {variant === "create" ? (
        <div className="rounded-xl border border-stone-200 bg-stone-100 p-3 dark:border-stone-700 dark:bg-stone-800/60">
          <div className="flex flex-wrap items-center gap-2">
            <Label
              htmlFor="n-fill-like"
              className="text-sm font-medium text-text-main dark:text-stone-200"
            >
              Wypełnij jak
            </Label>
            <select
              id="n-fill-like"
              value={templateSourceId}
              onChange={(e) => applyRecentTemplate(e.target.value)}
              className="h-9 min-w-[14rem] flex-1 rounded-md border border-stone-300 bg-white px-3 text-sm dark:border-stone-600 dark:bg-stone-900"
            >
              <option value="">Wybierz nocowankę…</option>
              <option value="__klubowa__">Klubowa (szablon)</option>
              {recentNocowanki.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      <FormSection
        icon="info"
        title="Podstawowe"
        description="Nazwa, termin i miejsce nocowanki."
        actions={
          <label
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              form.isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-stone-300 bg-white text-stone-600 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-300"
            )}
          >
            <Checkbox
              id="n-active"
              checked={form.isActive}
              onCheckedChange={(c) =>
                setForm((f) => ({ ...f, isActive: c === true }))
              }
            />
            Aktywna
          </label>
        }
      >
        <div>
          <Label htmlFor="n-name">Tytuł *</Label>
          <Input
            id="n-name"
            value={form.name}
            onChange={(e) =>
              setForm((f) => {
                const name = e.target.value;
                return { ...f, name, slug: slugify(name) };
              })
            }
            className="mt-1.5"
            placeholder="np. Klubowa Nocowanka"
            required
          />
        </div>
        <div>
          <Label htmlFor="n-desc">Opis</Label>
          <Textarea
            id="n-desc"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="mt-1.5 min-h-[100px]"
            placeholder="Krótki opis na stronie publicznej"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="n-badge">Czas trwania</Label>
            <select
              id="n-badge"
              value={form.badge}
              onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
              className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="jednodniowa">Jednodniowa</option>
              <option value="dwudniowa">Dwudniowa</option>
            </select>
          </div>
          <div>
            <Label htmlFor="n-loc">Miejsce</Label>
            <Input
              id="n-loc"
              value={form.locationLabel}
              onChange={(e) =>
                setForm((f) => ({ ...f, locationLabel: e.target.value }))
              }
              className="mt-1.5"
              placeholder="np. B.P. w Zamienniku"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="n-startDate">Data rozpoczęcia</Label>
            <Input
              id="n-startDate"
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="n-endDate">Data zakończenia</Label>
            <Input
              id="n-endDate"
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, endDate: e.target.value }))
              }
              className="mt-1.5"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        icon="photo_library"
        title="Zdjęcia"
        description="Maksymalnie 2 zdjęcia — prześlij plik lub wklej URL."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageUrlField}
            disabled={form.imageUrls.length >= 2}
          >
            Dodaj zdjęcie
          </Button>
        }
      >
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
      </FormSection>

      <FormSection
        icon="star"
        title="Główne atrakcje"
        description="Lista atrakcji na stronie publicznej."
      >
        <div className="overflow-hidden rounded-lg border border-stone-200 dark:border-stone-700">
          {form.attractions.length === 0 ? (
            <p className="px-3 py-4 text-sm text-text-light dark:text-stone-400">
              Brak atrakcji.
            </p>
          ) : (
            <ul className="divide-y divide-stone-200 dark:divide-stone-700">
              {form.attractions.map((row, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1 px-2 py-1.5 sm:grid-cols-[auto_minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:gap-x-3 sm:px-3"
                >
                  <span className="row-span-2 w-5 self-center text-center text-xs font-semibold tabular-nums text-stone-400 sm:row-span-1">
                    {i + 1}
                  </span>
                  <Input
                    placeholder="Nazwa atrakcji"
                    value={row.title}
                    onChange={(e) =>
                      updateAttraction(i, "title", e.target.value)
                    }
                    className="h-8 min-w-0 border-0 bg-transparent px-1 shadow-none focus-visible:ring-1 sm:h-9"
                  />
                  <Input
                    placeholder="Opis (opcjonalnie)"
                    value={row.description}
                    onChange={(e) =>
                      updateAttraction(i, "description", e.target.value)
                    }
                    className="col-start-2 h-8 min-w-0 border-0 bg-transparent px-1 text-sm text-stone-600 shadow-none focus-visible:ring-1 dark:text-stone-300 sm:col-start-auto sm:h-9 sm:text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="row-span-2 h-8 w-8 shrink-0 self-center text-destructive hover:bg-destructive/10 hover:text-destructive sm:row-span-1"
                    onClick={() => removeAttraction(i)}
                    aria-label="Usuń atrakcję"
                    title="Usuń"
                  >
                    <span className="material-symbols-outlined text-lg">
                      close
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={addAttraction}
        >
          <span className="material-symbols-outlined mr-1 text-base">add</span>
          Dodaj atrakcję
        </Button>
      </FormSection>

      <FormSection
        icon="payments"
        title="Cena i wyposażenie"
        description="Opłata, limity miejsc oraz to, co w cenie i co zabrać."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="n-price">Cena (PLN)</Label>
            <div className="mt-1.5 flex rounded-md border border-input bg-background">
              <Input
                id="n-price"
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => {
                  const price = e.target.value;
                  setForm((f) => ({
                    ...f,
                    price,
                    priceDisplay:
                      price.trim() !== ""
                        ? `${price.trim()} PLN`
                        : f.priceDisplay,
                  }));
                }}
                className="border-0 rounded-r-none"
                placeholder="170"
              />
              <span className="inline-flex items-center border-l border-input px-3 text-sm text-text-light dark:text-stone-400">
                zł
              </span>
            </div>
          </div>
          <div>
            <Label htmlFor="n-max">Maks. uczestników</Label>
            <Input
              id="n-max"
              type="number"
              min={1}
              value={form.maxParticipants}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxParticipants: e.target.value }))
              }
              className="mt-1.5"
              placeholder="50"
            />
          </div>
          <div>
            <Label htmlFor="n-priceDisp">Cena (wyświetlana)</Label>
            <Input
              id="n-priceDisp"
              value={form.priceDisplay}
              onChange={(e) =>
                setForm((f) => ({ ...f, priceDisplay: e.target.value }))
              }
              className="mt-1.5"
              placeholder="np. 170 PLN"
            />
          </div>
          <div>
            <Label htmlFor="n-avail">Dostępność miejsc (%)</Label>
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
              className="mt-1.5"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>W cenie</Label>
            <div className="flex gap-2">
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
                className="min-w-0 flex-1"
              />
              <Button type="button" variant="secondary" onClick={addPriceIncluded}>
                Dodaj
              </Button>
            </div>
            {form.priceIncluded.length > 0 ? (
              <ul className="flex flex-wrap items-center gap-2">
                {form.priceIncluded.map((item, i) => (
                  <li
                    key={`${item}-${i}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 pl-3 pr-1.5 text-sm dark:border-stone-600 dark:bg-stone-800/60"
                  >
                    <span className="leading-none">{item}</span>
                    <button
                      type="button"
                      className="inline-flex size-6 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removePriceIncluded(i)}
                      aria-label={`Usuń ${item}`}
                    >
                      <span className="material-symbols-outlined text-base leading-none">
                        close
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Co zabrać</Label>
            <div className="flex gap-2">
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
                className="min-w-0 flex-1"
              />
              <Button type="button" variant="secondary" onClick={addWhatToBring}>
                Dodaj
              </Button>
            </div>
            {form.whatToBring.length > 0 ? (
              <ul className="flex flex-wrap items-center gap-2">
                {form.whatToBring.map((item, i) => (
                  <li
                    key={`${item}-${i}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 pl-3 pr-1.5 text-sm dark:border-stone-600 dark:bg-stone-800/60"
                  >
                    <span className="leading-none">{item}</span>
                    <button
                      type="button"
                      className="inline-flex size-6 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeWhatToBring(i)}
                      aria-label={`Usuń ${item}`}
                    >
                      <span className="material-symbols-outlined text-base leading-none">
                        close
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </FormSection>

      <FormSection
        icon="schedule"
        title="Harmonogram nocy"
        description="Kolejność slotów na stronie publicznej."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={addScheduleRow}>
            Dodaj slot
          </Button>
        }
      >
        <div className="space-y-3">
          {form.schedule.length === 0 ? (
            <p className="text-sm text-text-light dark:text-stone-400">
              Brak slotów. Dodaj pierwszy wpis harmonogramu.
            </p>
          ) : (
            form.schedule.map((row, i) => (
              <div
                key={i}
                className="grid items-end gap-2 border-b border-stone-100 pb-3 last:border-0 dark:border-stone-800 sm:grid-cols-12"
              >
                <div className="sm:col-span-2">
                  <Label className="text-xs">Godzina</Label>
                  <Input
                    type="time"
                    value={row.time}
                    onChange={(e) => updateSchedule(i, "time", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-4">
                  <Label className="text-xs">Tytuł</Label>
                  <Input
                    value={row.title}
                    onChange={(e) => updateSchedule(i, "title", e.target.value)}
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
            ))
          )}
        </div>
      </FormSection>

      <div className="sticky bottom-[calc(var(--risu-mobile-bottom-nav-h)+0.75rem)] z-20 flex justify-end md:bottom-4">
        <div className="flex gap-2 rounded-2xl border border-stone-200 bg-white/95 p-2 shadow-soft backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/95">
          {form.slug.trim() ? (
            <Button asChild variant="outline" type="button" size="sm" className="h-9 min-h-9 rounded-lg px-3 text-sm font-semibold">
              <Link
                href={`/admin/wydarzenia/nocowanka/${encodeURIComponent(form.slug.trim())}/pytania`}
              >
                Pytania
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" type="button" size="sm" className="h-9 min-h-9 rounded-lg px-3 text-sm font-semibold">
            <Link href="/admin/wydarzenia">Anuluj</Link>
          </Button>
          <Button type="submit" size="sm" disabled={saving} className="h-9 min-h-9 rounded-lg px-3 text-sm font-semibold">
            {saving
              ? "Zapisywanie…"
              : variant === "create"
                ? "Utwórz"
                : "Zapisz zmiany"}
          </Button>
        </div>
      </div>
    </form>
  );
}
