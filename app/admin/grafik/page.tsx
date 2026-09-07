"use client";

import {
  Suspense,
  useState,
  useEffect,
  useMemo,
  useRef,
  type ElementType,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ScheduleView } from "@/components/grafik/schedule-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DAYS = [
  { value: 0, label: "Nd" },
  { value: 1, label: "Pon" },
  { value: 2, label: "Wt" },
  { value: 3, label: "Śr" },
  { value: 4, label: "Czw" },
  { value: 5, label: "Pt" },
  { value: 6, label: "Sb" },
] as const;

const DISCIPLINE_OPTIONS = ["Judo", "Karate", "Gimnastyka"] as const;

const STATUS_LABELS: Record<string, string> = {
  active: "Aktywny",
  pending_payment: "Oczekuje na płatność",
  cancelled: "Anulowany",
  ended: "Zakończony",
};

type SlotDraft = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type PendingSlotFromTable = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

function dayLabel(dayOfWeek: number): string {
  return DAYS.find((d) => d.value === dayOfWeek)?.label ?? String(dayOfWeek);
}

function slotChipLabel(slot: SlotDraft): string {
  return `${dayLabel(slot.dayOfWeek)} ${slot.startTime}–${slot.endTime}`;
}

/** Matches Tailwind `sm` (640px): drawer below, dialog at sm+. */
const MOBILE_EDITOR_MQ = "(max-width: 639px)";

function AdminGrafikPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const didApplyClassIdFromUrl = useRef(false);
  const classesList = useQuery(api.classes.listForAdmin);
  const [selectedClassId, setSelectedClassId] = useState<Id<"classes"> | null>(null);

  const classDetail = useQuery(
    api.classes.getForAdmin,
    selectedClassId ? { classId: selectedClassId } : "skip"
  );
  const timeSlots = useQuery(
    api.classes.getTimeSlotsForClass,
    selectedClassId ? { classId: selectedClassId } : "skip"
  );
  const enrollments = useQuery(
    api.subscriptions.listByClassForAdmin,
    selectedClassId ? { classId: selectedClassId } : "skip"
  );
  const coaches = useQuery(api.coaches.listForAdmin);
  const locations = useQuery(api.locations.listForAdmin);
  const allChildren = useQuery(api.children.listForAdmin);

  const updateClass = useMutation(api.classes.update);
  const createClass = useMutation(api.classes.create);
  const removeClass = useMutation(api.classes.remove);
  const replaceTimeSlots = useMutation(api.classes.replaceTimeSlotsForClass);
  const adminRemoveEnrollment = useMutation(
    api.subscriptions.adminRemoveEnrollment
  );
  const adminEnrollInClass = useMutation(api.subscriptions.adminEnrollInClass);

  const [formName, setFormName] = useState("");
  const [formDiscipline, setFormDiscipline] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLocationId, setFormLocationId] = useState("");
  const [formAgeGroup, setFormAgeGroup] = useState("");
  const [formCoachId, setFormCoachId] = useState("");
  const [formMaxCapacity, setFormMaxCapacity] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [slotsDraft, setSlotsDraft] = useState<SlotDraft[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [focusedDayForSlots, setFocusedDayForSlots] = useState<number | null>(null);
  const [pendingSlotFromTable, setPendingSlotFromTable] =
    useState<PendingSlotFromTable | null>(null);
  const [timeStart, setTimeStart] = useState("16:00");
  const [timeEnd, setTimeEnd] = useState("17:30");
  const [enrollmentSearch, setEnrollmentSearch] = useState("");
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [childSearch, setChildSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [useDrawerForEditor, setUseDrawerForEditor] = useState(false);
  /** True while adding a class — same Dialog/Drawer shell as the editor */
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSaving, setCreateSaving] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_EDITOR_MQ);
    const apply = () => setUseDrawerForEditor(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (didApplyClassIdFromUrl.current || classesList === undefined) return;
    const raw = searchParams.get("classId");
    if (!raw) return;
    if (classesList.some((c) => c._id === raw)) {
      setSelectedClassId(raw as Id<"classes">);
      didApplyClassIdFromUrl.current = true;
    }
  }, [searchParams, classesList]);

  const enrolledChildIds = useMemo(
    () =>
      new Set(
        (enrollments ?? [])
          .filter((e) => e.status === "active" || e.status === "pending_payment")
          .map((e) => e.childId)
          .filter(Boolean) as Id<"children">[]
      ),
    [enrollments]
  );

  const availableChildren = useMemo(() => {
    if (!allChildren) return [];
    const search = childSearch.trim().toLowerCase();
    return allChildren.filter((c) => {
      if (enrolledChildIds.has(c._id)) return false;
      if (!search) return true;
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      const parent = (c.parentName ?? "").toLowerCase();
      return fullName.includes(search) || parent.includes(search);
    });
  }, [allChildren, enrolledChildIds, childSearch]);

  const filteredEnrollments = useMemo(() => {
    if (!enrollments) return [];
    const search = enrollmentSearch.trim().toLowerCase();
    if (!search) return enrollments;
    return enrollments.filter((e) => {
      const childName = e.child
        ? `${e.child.firstName} ${e.child.lastName}`.toLowerCase()
        : "";
      const userName = (e.user?.name ?? "").toLowerCase();
      return childName.includes(search) || userName.includes(search);
    });
  }, [enrollments, enrollmentSearch]);

  useEffect(() => {
    if (isCreating || !classDetail || !selectedClassId) return;
    setFormName(classDetail.name);
    setFormDiscipline(classDetail.discipline);
    setFormDescription(classDetail.description ?? "");
    setFormLocationId(classDetail.locationId);
    setFormAgeGroup(classDetail.ageGroup ?? "");
    setFormCoachId(classDetail.coachId);
    setFormMaxCapacity(
      classDetail.maxCapacity != null ? String(classDetail.maxCapacity) : ""
    );
    setFormIsActive(classDetail.isActive);
  }, [isCreating, classDetail, selectedClassId]);

  useEffect(() => {
    if (timeSlots === undefined || !selectedClassId) return;
    setSlotsDraft(
      timeSlots.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      }))
    );
    if (pendingSlotFromTable !== null) {
      setFocusedDayForSlots(pendingSlotFromTable.dayOfWeek);
      setSelectedDays([pendingSlotFromTable.dayOfWeek]);
      setTimeStart(pendingSlotFromTable.startTime);
      setTimeEnd(pendingSlotFromTable.endTime);
      setPendingSlotFromTable(null);
    } else {
      setFocusedDayForSlots(null);
    }
  }, [timeSlots, selectedClassId, pendingSlotFromTable]);

  const closePanel = () => {
    setIsCreating(false);
    setCreateError(null);
    setSelectedClassId(null);
    setPendingSlotFromTable(null);
    setAddStudentOpen(false);
    setEnrollmentSearch("");
    setChildSearch("");
    setError(null);
    setSuccess(null);
    router.replace("/admin/grafik");
  };

  /** Zamknij panel; zmiany niezapisane są porzucane (przy ponownym otwarciu dane z serwera). */
  const handleDiscard = () => {
    closePanel();
  };

  const handleSave = async () => {
    if (!selectedClassId) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const maxCapParsed = formMaxCapacity.trim()
        ? parseInt(formMaxCapacity, 10)
        : undefined;
      if (
        formMaxCapacity.trim() &&
        (Number.isNaN(maxCapParsed) || (maxCapParsed != null && maxCapParsed < 1))
      ) {
        setError("Podaj poprawną maks. liczbę uczestników (min. 1) lub zostaw puste.");
        return;
      }
      await updateClass({
        id: selectedClassId,
        name: formName.trim() || undefined,
        discipline: formDiscipline || undefined,
        description: formDescription.trim() || undefined,
        locationId: formLocationId
          ? (formLocationId as Id<"locations">)
          : undefined,
        ageGroup: formAgeGroup.trim() || undefined,
        coachId: formCoachId ? (formCoachId as Id<"coaches">) : undefined,
        maxCapacity: maxCapParsed,
        isActive: formIsActive,
      });
      const validSlots = slotsDraft.filter(
        (s) => s.startTime?.trim() && s.endTime?.trim()
      );
      await replaceTimeSlots({
        classId: selectedClassId,
        slots: validSlots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime.trim(),
          endTime: s.endTime.trim(),
        })),
      });
      closePanel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClassId) return;
    if (!confirm("Na pewno chcesz usunąć tę grupę zajęć?")) return;
    setError(null);
    setSuccess(null);
    setDeleting(true);
    try {
      await removeClass({ id: selectedClassId });
      closePanel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateNewClass = async () => {
    setCreateError(null);
    setError(null);
    if (!formName.trim()) {
      setCreateError("Podaj nazwę grupy.");
      return;
    }
    if (!formLocationId || !formCoachId) {
      setCreateError("Wybierz lokalizację i trenera.");
      return;
    }
    const maxCapParsed = formMaxCapacity.trim()
      ? parseInt(formMaxCapacity, 10)
      : undefined;
    if (
      formMaxCapacity.trim() &&
      (Number.isNaN(maxCapParsed) || (maxCapParsed != null && maxCapParsed < 1))
    ) {
      setCreateError(
        "Podaj poprawną maks. liczbę uczestników (min. 1) lub zostaw puste."
      );
      return;
    }
    setCreateSaving(true);
    try {
      const newId = await createClass({
        name: formName.trim(),
        discipline: formDiscipline,
        description: formDescription.trim() || undefined,
        locationId: formLocationId as Id<"locations">,
        coachId: formCoachId as Id<"coaches">,
        ageGroup: formAgeGroup.trim() || undefined,
        maxCapacity: maxCapParsed,
        isActive: formIsActive,
      });
      const validSlots = slotsDraft.filter(
        (s) => s.startTime?.trim() && s.endTime?.trim()
      );
      await replaceTimeSlots({
        classId: newId,
        slots: validSlots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime.trim(),
          endTime: s.endTime.trim(),
        })),
      });
      setIsCreating(false);
      setCreateError(null);
      setSelectedClassId(newId);
      setSuccess("Grupa utworzona. Możesz zarządzać uczestnikami w panelu obok.");
      router.replace(`/admin/grafik?classId=${encodeURIComponent(newId)}`);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Wystąpił błąd."
      );
    } finally {
      setCreateSaving(false);
    }
  };

  const openCreateClass = () => {
    setCreateError(null);
    setError(null);
    setSuccess(null);
    setFormName("");
    setFormDiscipline("Judo");
    setFormDescription("");
    setFormLocationId("");
    setFormAgeGroup("");
    setFormCoachId("");
    setFormMaxCapacity("");
    setFormIsActive(true);
    setSlotsDraft([]);
    setSelectedDays([]);
    setFocusedDayForSlots(null);
    setPendingSlotFromTable(null);
    setTimeStart("16:00");
    setTimeEnd("17:30");
    setIsCreating(true);
    setSelectedClassId(null);
    router.replace("/admin/grafik");
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) => {
      const isSelected = prev.includes(day);
      const next = isSelected ? prev.filter((d) => d !== day) : [...prev, day];

      if (next.length === 0) {
        // No selected days => show all existing slots/hours.
        setFocusedDayForSlots(null);
      } else if (!isSelected) {
        // Newly selected day becomes the focused day.
        setFocusedDayForSlots(day);
      } else if (focusedDayForSlots === day) {
        // If we removed the focused day, move focus to first remaining selected day.
        setFocusedDayForSlots(next[0] ?? null);
      }

      return next;
    });
  };

  const addSlots = () => {
    const start = timeStart.trim();
    const end = timeEnd.trim();
    if (!start || !end) return;
    if (selectedDays.length === 0) return;
    const selectedSet = new Set(selectedDays);
    const newSlots: SlotDraft[] = selectedDays.map((dayOfWeek) => ({
      dayOfWeek,
      startTime: start,
      endTime: end,
    }));
    // Treat "+" as update/replace for selected days so hour edits work predictably.
    setSlotsDraft((prev) => {
      const kept = prev.filter((slot) => !selectedSet.has(slot.dayOfWeek));
      return [...kept, ...newSlots];
    });
  };

  const removeSlot = (index: number) => {
    setSlotsDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const slotsByDayCount = useMemo(() => {
    const counts = new Map<number, number>();
    for (const slot of slotsDraft) {
      counts.set(slot.dayOfWeek, (counts.get(slot.dayOfWeek) ?? 0) + 1);
    }
    return counts;
  }, [slotsDraft]);

  const sortedSlotEntries = useMemo(
    () =>
      slotsDraft
        .map((slot, index) => ({ slot, index }))
        .sort((a, b) => {
          if (a.slot.dayOfWeek !== b.slot.dayOfWeek) {
            return a.slot.dayOfWeek - b.slot.dayOfWeek;
          }
          if (a.slot.startTime !== b.slot.startTime) {
            return a.slot.startTime.localeCompare(b.slot.startTime);
          }
          return a.slot.endTime.localeCompare(b.slot.endTime);
        }),
    [slotsDraft]
  );

  const visibleSlotEntries = useMemo(() => {
    if (selectedDays.length === 0) return sortedSlotEntries;
    const selectedSet = new Set(selectedDays);
    return sortedSlotEntries.filter((entry) =>
      selectedSet.has(entry.slot.dayOfWeek)
    );
  }, [sortedSlotEntries, selectedDays]);

  const handleRemoveEnrollment = async (subscriptionId: Id<"subscriptions">) => {
    if (!confirm("Usunąć tego uczestnika z listy?")) return;
    setError(null);
    try {
      await adminRemoveEnrollment({ subscriptionId });
      setSuccess("Uczestnik usunięty.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    }
  };

  const handleAddEnrollment = async (childId: Id<"children">) => {
    if (!selectedClassId) return;
    setError(null);
    try {
      await adminEnrollInClass({ classId: selectedClassId, childId });
      setAddStudentOpen(false);
      setChildSearch("");
      setSuccess("Uczestnik dodany.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    }
  };

  const atCapacity =
    classDetail &&
    classDetail.maxCapacity != null &&
    (enrollments?.filter(
      (e) => e.status === "active" || e.status === "pending_payment"
    ).length ?? 0) >= classDetail.maxCapacity;

  const activeEnrollmentCount =
    enrollments?.filter(
      (e) => e.status === "active" || e.status === "pending_payment"
    ).length ?? 0;

  const panelOpen = isCreating || selectedClassId !== null;

  const renderCreateTitleAndActions = (Title: ElementType) => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <Title className="text-left text-lg sm:text-xl">Nowa grupa zajęć</Title>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 flex-1 touch-manipulation sm:flex-none"
          onClick={closePanel}
          disabled={createSaving}
        >
          Anuluj
        </Button>
        <Button
          type="button"
          className="min-h-11 flex-1 touch-manipulation sm:flex-none"
          disabled={createSaving}
          onClick={handleCreateNewClass}
        >
          {createSaving ? "Zapisywanie…" : "Dodaj grupę"}
        </Button>
      </div>
    </div>
  );

  const renderTitleAndActions = (Title: ElementType) => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <Title className="text-left text-lg sm:text-xl">Edycja grupy zajęć</Title>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
        <Button
          variant="outline"
          className="min-h-11 flex-1 touch-manipulation sm:flex-none"
          onClick={handleDiscard}
          disabled={saving || deleting}
        >
          Odrzuć
        </Button>
        <Button
          variant="destructive"
          className="min-h-11 flex-1 touch-manipulation sm:flex-none"
          onClick={handleDeleteClass}
          disabled={saving || deleting}
        >
          {deleting ? "Usuwanie…" : "Usuń grupę"}
        </Button>
        <Button
          className="min-h-11 flex-1 touch-manipulation sm:flex-none"
          onClick={handleSave}
          disabled={saving || deleting}
        >
          {saving ? "Zapisywanie…" : "Zapisz zmiany"}
        </Button>
      </div>
    </div>
  );

  const classEditorScrollArea = (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain",
        useDrawerForEditor ? "px-3 py-3 sm:px-6 sm:py-6" : "p-4 sm:p-6"
      )}
    >
      {((isCreating && createError) || (!isCreating && error) || (!isCreating && success)) && (
        <div className="mb-4 space-y-2">
          {isCreating && createError && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {createError}
            </div>
          )}
          {!isCreating && error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {!isCreating && success && (
            <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
              {success}
            </div>
          )}
        </div>
      )}
      {isCreating && locations !== undefined && locations.length === 0 && (
        <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">
          Dodaj najpierw lokalizację w sekcji Lokalizacje.
        </p>
      )}
      {isCreating && coaches !== undefined && coaches.length === 0 && (
        <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">
          Dodaj najpierw trenera w sekcji Trenerzy.
        </p>
      )}
      <div
        className={cn(
          "flex flex-col",
          useDrawerForEditor
            ? "divide-y divide-stone-200 dark:divide-stone-700"
            : "gap-6 lg:flex-row lg:gap-8"
        )}
      >
        {!isCreating && selectedClassId && classDetail === undefined ? (
          <div className="flex-1 py-12 text-center text-text-light dark:text-stone-400">
            Ładowanie…
          </div>
        ) : !isCreating && selectedClassId && classDetail === null ? (
          <div className="flex-1 py-12 text-center text-text-light dark:text-stone-400">
            Nie znaleziono grupy.
          </div>
        ) : (isCreating || classDetail) ? (
          <>
            <div
              className={cn(
                "min-w-0 flex-1",
                useDrawerForEditor &&
                  "divide-y divide-stone-200 dark:divide-stone-700"
              )}
            >
              {(isCreating || classDetail) && (
                <>
                  <Card
                    className={cn(
                      useDrawerForEditor
                        ? "border-0 bg-transparent py-4 shadow-none dark:bg-transparent"
                        : "mb-6 rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900/50"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="material-symbols-outlined text-primary text-xl">
                            info
                          </span>
                          Szczegóły zajęć
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="formIsActive"
                            checked={formIsActive}
                            onCheckedChange={(checked) =>
                              setFormIsActive(checked === true)
                            }
                          />
                          <Label
                            htmlFor="formIsActive"
                            className="cursor-pointer whitespace-nowrap text-sm font-medium text-text-main dark:text-stone-200"
                          >
                            Aktywna
                          </Label>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label
                          htmlFor="className"
                          className="text-text-main dark:text-stone-200"
                        >
                          Nazwa grupy{isCreating ? " *" : ""}
                        </Label>
                        <Input
                          id="className"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="mt-1.5 min-h-11 rounded-xl text-base"
                          placeholder="np. Gimnastyka maluchy"
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block text-text-main dark:text-stone-200">
                          Dyscyplina
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {DISCIPLINE_OPTIONS.map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setFormDiscipline(d)}
                              className={cn(
                                "min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-colors touch-manipulation",
                                formDiscipline === d
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-stone-100 text-text-main hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                              )}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="classDescription"
                          className="text-text-main dark:text-stone-200"
                        >
                          Opis
                        </Label>
                        <Textarea
                          id="classDescription"
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="mt-1.5 min-h-[80px] rounded-xl text-base"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="ageGroup"
                          className="text-text-main dark:text-stone-200"
                        >
                          Grupa wiekowa
                        </Label>
                        <Input
                          id="ageGroup"
                          value={formAgeGroup}
                          onChange={(e) => setFormAgeGroup(e.target.value)}
                          className="mt-1.5 min-h-11 rounded-xl text-base"
                          placeholder="np. 3–5 lat"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="coachId"
                          className="text-text-main dark:text-stone-200"
                        >
                          Trener
                        </Label>
                        <select
                          id="coachId"
                          value={formCoachId}
                          onChange={(e) => setFormCoachId(e.target.value)}
                          className="mt-1.5 flex min-h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-base"
                        >
                          <option value="">— wybierz —</option>
                          {coaches?.map((coach) => (
                            <option key={coach._id} value={coach._id}>
                              {coach.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label
                          htmlFor="formLocationId"
                          className="text-text-main dark:text-stone-200"
                        >
                          Lokalizacja
                        </Label>
                        <div className="mt-1.5 flex items-start gap-2">
                          <span className="material-symbols-outlined mt-2.5 shrink-0 text-lg text-primary">
                            location_on
                          </span>
                          <select
                            id="formLocationId"
                            value={formLocationId}
                            onChange={(e) => setFormLocationId(e.target.value)}
                            className="flex min-h-11 w-full min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-base"
                          >
                            <option value="">— wybierz —</option>
                            {locations?.map((loc) => (
                              <option key={loc._id} value={loc._id}>
                                {loc.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="formMaxCapacity"
                          className="text-text-main dark:text-stone-200"
                        >
                          Maks. liczba uczestników
                        </Label>
                        <Input
                          id="formMaxCapacity"
                          type="number"
                          min={1}
                          value={formMaxCapacity}
                          onChange={(e) => setFormMaxCapacity(e.target.value)}
                          className="mt-1.5 min-h-11 rounded-xl text-base"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      useDrawerForEditor
                        ? "border-0 bg-transparent py-4 shadow-none dark:bg-transparent"
                        : "rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900/50"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="material-symbols-outlined text-primary text-xl">
                          schedule
                        </span>
                        Grafik
                      </CardTitle>
                      <CardDescription className="text-text-light dark:text-stone-400">
                        Dodaj terminy: wybierz dni, ustaw godziny i kliknij +.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="mb-2 block text-text-main dark:text-stone-200">
                          Dni tygodnia
                        </Label>
                        <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap">
                          {DAYS.map((d) => (
                            <button
                              key={d.value}
                              type="button"
                              onClick={() => toggleDay(d.value)}
                              className={cn(
                                "min-h-11 rounded-full px-2 text-sm font-medium transition-colors touch-manipulation sm:px-4",
                                selectedDays.includes(d.value)
                                  ? "bg-primary text-primary-foreground"
                                  : focusedDayForSlots === d.value
                                    ? "bg-primary/20 text-primary dark:bg-primary/25 dark:text-primary-foreground"
                                    : "bg-stone-100 text-text-main hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                              )}
                            >
                              <span>{d.label}</span>
                              {(slotsByDayCount.get(d.value) ?? 0) > 0 && (
                                <span className="ml-1 rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-primary dark:bg-stone-900/70 dark:text-primary-foreground">
                                  {slotsByDayCount.get(d.value)}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block text-text-main dark:text-stone-200">
                          Godziny
                        </Label>
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                          <div className="flex w-full items-center gap-2 sm:w-auto">
                            <Input
                              type="time"
                              value={timeStart}
                              onChange={(e) => setTimeStart(e.target.value)}
                              className="min-h-11 min-w-0 flex-1 rounded-xl text-base sm:w-36 sm:flex-none"
                            />
                            <span className="shrink-0 text-text-light dark:text-stone-400">
                              –
                            </span>
                            <Input
                              type="time"
                              value={timeEnd}
                              onChange={(e) => setTimeEnd(e.target.value)}
                              className="min-h-11 min-w-0 flex-1 rounded-xl text-base sm:w-36 sm:flex-none"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="default"
                            onClick={addSlots}
                            disabled={selectedDays.length === 0}
                            className="h-11 w-full shrink-0 gap-2 rounded-xl font-bold sm:h-11 sm:w-11 sm:rounded-full sm:p-0"
                            aria-label="Dodaj terminy"
                          >
                            <span className="material-symbols-outlined text-xl sm:text-2xl">
                              add
                            </span>
                            <span className="sm:sr-only">Dodaj terminy</span>
                          </Button>
                        </div>
                      </div>
                      {slotsDraft.length > 0 && (
                        <div>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <Label className="block text-text-main dark:text-stone-200">
                              Terminy
                            </Label>
                            {focusedDayForSlots !== null && (
                              <button
                                type="button"
                                className="text-xs font-semibold text-primary underline underline-offset-4"
                                onClick={() => setFocusedDayForSlots(null)}
                              >
                                Pokaż wszystkie dni
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {visibleSlotEntries.map(({ slot, index }) => (
                              <span
                                key={`${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}-${index}`}
                                className="inline-flex min-h-10 items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                              >
                                {slotChipLabel(slot)}
                                <button
                                  type="button"
                                  onClick={() => removeSlot(index)}
                                  className="touch-manipulation rounded-full p-2 hover:bg-primary/20 sm:p-0.5"
                                  aria-label="Usuń"
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    close
                                  </span>
                                </button>
                              </span>
                            ))}
                          </div>
                          {visibleSlotEntries.length === 0 && focusedDayForSlots !== null && (
                            <p className="mt-2 text-sm text-text-light dark:text-stone-400">
                              Brak terminów dla dnia: {dayLabel(focusedDayForSlots)}.
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {!isCreating && classDetail && (
              <aside
                className={cn(
                  "w-full shrink-0",
                  !useDrawerForEditor && "lg:w-80"
                )}
              >
                <Card
                  className={cn(
                    useDrawerForEditor
                      ? "border-0 bg-transparent py-4 shadow-none dark:bg-transparent"
                      : "rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900/50 lg:sticky lg:top-4"
                  )}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="material-symbols-outlined text-primary text-xl">
                        group
                      </span>
                      Zapisani
                    </CardTitle>
                    <CardDescription className="text-text-light dark:text-stone-400">
                      {activeEnrollmentCount}
                      {classDetail.maxCapacity != null
                        ? `/${classDetail.maxCapacity}`
                        : ""}{" "}
                      uczestników
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-stone-400">
                        search
                      </span>
                      <Input
                        placeholder="Szukaj…"
                        value={enrollmentSearch}
                        onChange={(e) => setEnrollmentSearch(e.target.value)}
                        className="min-h-11 rounded-xl pl-10 text-base"
                      />
                    </div>
                    <ul className="max-h-[min(50dvh,20rem)] space-y-2 overflow-y-auto overscroll-contain sm:max-h-80">
                      {filteredEnrollments.length === 0 ? (
                        <li className="py-4 text-center text-sm text-text-light dark:text-stone-400">
                          {enrollmentSearch ? "Brak wyników." : "Brak zapisanych."}
                        </li>
                      ) : (
                        filteredEnrollments.map((e) => (
                          <li
                            key={e._id}
                            className="flex min-h-[3.25rem] items-center gap-3 rounded-xl p-2 hover:bg-stone-100 dark:hover:bg-stone-800/50"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {e.child
                                ? (e.child.firstName[0] ?? "")
                                    .concat(e.child.lastName[0] ?? "")
                                    .toUpperCase()
                                    .slice(0, 2)
                                : "?"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-text-main dark:text-white">
                                {e.child
                                  ? `${e.child.firstName} ${e.child.lastName}`
                                  : "—"}
                              </p>
                              <p className="text-xs text-text-light dark:text-stone-400">
                                {STATUS_LABELS[e.status] ?? e.status}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveEnrollment(e._id)}
                              className="touch-manipulation rounded-full p-2.5 text-stone-400 hover:bg-destructive/10 hover:text-destructive sm:p-1.5"
                              aria-label="Usuń z listy"
                            >
                              <span className="material-symbols-outlined text-lg">
                                remove_circle_outline
                              </span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                    <Popover open={addStudentOpen} onOpenChange={setAddStudentOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-11 w-full rounded-xl text-base font-bold"
                          disabled={atCapacity === true}
                        >
                          <span className="material-symbols-outlined mr-2">add</span>
                          Dodaj uczestnika
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="z-[70] w-[calc(100vw-2rem)] max-w-sm p-0 sm:w-80"
                        align="center"
                        side="bottom"
                        sideOffset={8}
                      >
                        <div className="border-b border-stone-200 p-2 dark:border-stone-700">
                          <Input
                            placeholder="Szukaj dziecka lub rodzica…"
                            value={childSearch}
                            onChange={(e) => setChildSearch(e.target.value)}
                            className="min-h-11 rounded-xl text-base"
                          />
                        </div>
                        <ul className="max-h-[min(45dvh,16rem)] overflow-y-auto overscroll-contain p-2 sm:max-h-60">
                          {availableChildren.length === 0 ? (
                            <li className="py-4 text-center text-sm text-text-light dark:text-stone-400">
                              {childSearch
                                ? "Brak wyników."
                                : "Wszyscy zapisani lub brak dzieci w systemie."}
                            </li>
                          ) : (
                            availableChildren.map((c) => (
                              <li key={c._id}>
                                <button
                                  type="button"
                                  className="flex min-h-12 w-full touch-manipulation items-center justify-between gap-2 rounded-lg px-3 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800"
                                  onClick={() => handleAddEnrollment(c._id)}
                                >
                                  <span className="font-medium text-text-main dark:text-white">
                                    {c.firstName} {c.lastName}
                                  </span>
                                  {c.parentName && (
                                    <span className="truncate text-xs text-text-light dark:text-stone-400">
                                      {c.parentName}
                                    </span>
                                  )}
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      </PopoverContent>
                    </Popover>
                  </CardContent>
                </Card>
              </aside>
            )}
          </>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl">
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-text-main dark:text-white">
          Grafik
        </h1>
        <Button
          type="button"
          className="min-h-11 w-full touch-manipulation sm:w-auto"
          onClick={openCreateClass}
        >
          <span className="material-symbols-outlined mr-2 text-xl">add</span>
          Dodaj nową grupę
        </Button>
      </div>

      {classesList !== undefined && classesList.length === 0 && (
        <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
          Brak grup w grafiku. Użyj przycisku „Dodaj nową grupę”, aby utworzyć pierwszą
          grupę. Potem ustal terminy w edycji grupy.
        </p>
      )}

      <div className="min-h-[50vh] w-full min-w-0 rounded-2xl border-0 bg-background-light py-4 shadow-none dark:bg-background-dark max-md:px-0 sm:py-6 md:mx-0 md:bg-transparent md:px-0 md:py-0 md:min-h-0">
        <Suspense
          fallback={
            <p className="py-16 text-center text-text-light dark:text-stone-400">
              Ładowanie grafiku…
            </p>
          }
        >
          <ScheduleView
            mode="admin"
            signInRedirectPath="/admin/grafik"
            onAdminSelectClass={(id, dayOfWeek, startTime, endTime) => {
              setIsCreating(false);
              if (
                typeof dayOfWeek === "number" &&
                typeof startTime === "string" &&
                typeof endTime === "string"
              ) {
                setPendingSlotFromTable({ dayOfWeek, startTime, endTime });
              }
              setSelectedClassId(id);
            }}
          />
        </Suspense>
      </div>

      {useDrawerForEditor ? (
        <Drawer
          open={panelOpen}
          onOpenChange={(open) => {
            if (!open) closePanel();
          }}
          shouldScaleBackground
        >
          <DrawerContent
            className={cn(
              "mt-0 flex h-[92dvh] max-h-[92dvh] w-full max-w-[100vw] flex-col gap-0 overflow-x-hidden rounded-t-2xl border-0 p-0 shadow-none",
              "pb-[max(env(safe-area-inset-bottom,0px),0.75rem)]"
            )}
          >
            {panelOpen && (
              <>
                <DrawerHeader className="shrink-0 space-y-0 border-b border-stone-200 px-3 pb-3 pt-4 text-left dark:border-stone-700 sm:px-6 sm:pb-4 sm:pt-6">
                  {isCreating
                    ? renderCreateTitleAndActions(DrawerTitle)
                    : renderTitleAndActions(DrawerTitle)}
                </DrawerHeader>
                {classEditorScrollArea}
              </>
            )}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={panelOpen}
          onOpenChange={(open) => {
            if (!open) closePanel();
          }}
        >
          <DialogContent
            className={cn(
              "flex w-full max-w-6xl flex-col gap-0 overflow-hidden p-0",
              "left-1/2 top-1/2 max-h-[90vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border"
            )}
          >
            {panelOpen && (
              <>
                <DialogHeader className="shrink-0 border-b border-stone-200 p-4 pb-3 dark:border-stone-700 sm:p-6 sm:pb-4">
                  {isCreating
                    ? renderCreateTitleAndActions(DialogTitle)
                    : renderTitleAndActions(DialogTitle)}
                </DialogHeader>
                {classEditorScrollArea}
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function AdminGrafikPage() {
  return (
    <Suspense
      fallback={
        <div className="text-text-light dark:text-stone-400">Ładowanie…</div>
      }
    >
      <AdminGrafikPageInner />
    </Suspense>
  );
}
