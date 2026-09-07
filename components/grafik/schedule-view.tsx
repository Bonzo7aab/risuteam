"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const LOCATION_ALL = "__all__" as const;
const FILTER_ALL = "Wszystkie";
/** Classes created within this window show a NOWE badge (client-side only). */
const NEW_CLASS_THRESHOLD_MS = 14 * 24 * 60 * 60 * 1000;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DAYS: { key: (typeof DAY_KEYS)[number]; label: string }[] = [
  { key: "mon", label: "Pon" },
  { key: "tue", label: "Wt" },
  { key: "wed", label: "Śr" },
  { key: "thu", label: "Czw" },
  { key: "fri", label: "Pt" },
  { key: "sat", label: "Sb" },
  { key: "sun", label: "Nd" },
];

const WEEKEND_DAY_KEYS = new Set<(typeof DAY_KEYS)[number]>(["sat", "sun"]);

const DAY_LONG_LABEL: Record<(typeof DAY_KEYS)[number], string> = {
  mon: "Poniedziałek",
  tue: "Wtorek",
  wed: "Środa",
  thu: "Czwartek",
  fri: "Piątek",
  sat: "Sobota",
  sun: "Niedziela",
};

function pickDefaultDayKey(
  days: { key: (typeof DAY_KEYS)[number] }[]
): (typeof DAY_KEYS)[number] {
  const keys = new Set(days.map((d) => d.key));
  const today = DAY_KEYS[new Date().getDay()];
  if (keys.has(today)) return today;
  return days[0]?.key ?? "mon";
}

export interface ScheduleSlot {
  _id: Id<"timeSlots">;
  classId: Id<"classes">;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enrolledCount: number;
  class?: {
    _id: Id<"classes">;
    name: string;
    discipline: string;
    ageGroup?: string;
    maxCapacity?: number;
    isActive?: boolean;
    _creationTime: number;
  };
  location?: { _id: Id<"locations">; name: string };
  coach?: { name: string };
}

function buildGrid(slots: ScheduleSlot[]) {
  const byKey: Record<string, ScheduleSlot[]> = {};
  for (const slot of slots) {
    const dayKey = DAY_KEYS[slot.dayOfWeek] ?? "mon";
    const key = `${dayKey}-${slot.startTime}`;
    if (!byKey[key]) byKey[key] = [];
    byKey[key].push(slot);
  }
  const times = [...new Set(slots.map((s) => s.startTime))].sort();
  return { byKey, times };
}

function matchesFilters(
  slot: ScheduleSlot,
  discipline: string,
  ageGroup: string,
  locationId: Id<"locations"> | null
): boolean {
  if (!slot.class) return false;
  if (discipline !== FILTER_ALL && slot.class.discipline !== discipline)
    return false;
  const slotAge = slot.class.ageGroup ?? "";
  if (ageGroup !== FILTER_ALL && slotAge !== ageGroup) return false;
  if (locationId !== null && slot.location?._id !== locationId) return false;
  return true;
}

function CompactFilterPopover({
  filterLabel,
  valueDisplay,
  iconName,
  iconWrapperClassName,
  options,
  selectedValue,
  onSelect,
}: {
  filterLabel: string;
  valueDisplay: string;
  iconName: string;
  iconWrapperClassName: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex min-w-0 w-full max-w-full items-center gap-3 rounded-2xl border border-stone-200/90 bg-white px-3 py-2.5 pr-3 shadow-sm transition-colors sm:w-auto sm:max-w-[min(100%,18rem)] sm:rounded-full",
            "hover:border-stone-300 hover:bg-stone-50/80",
            "dark:border-stone-600 dark:bg-stone-900 dark:hover:border-stone-500 dark:hover:bg-stone-800/80"
          )}
        >
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              iconWrapperClassName
            )}
          >
            <span className="material-symbols-outlined text-[22px] leading-none">
              {iconName}
            </span>
          </span>
          <div className="min-w-0 flex-1 text-left">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-900/55 dark:text-stone-500">
              {filterLabel}
            </span>
            <span className="block truncate text-sm font-bold text-text-main dark:text-stone-100">
              {valueDisplay}
            </span>
          </div>
          <span className="material-symbols-outlined shrink-0 text-lg text-amber-900/45 dark:text-stone-500">
            expand_more
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(100vw-2rem,16rem)] p-1.5 rounded-xl border border-stone-200 dark:border-stone-600"
      >
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-left text-sm font-medium text-text-main transition-colors",
                "hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800",
                selectedValue === opt.value &&
                  "bg-primary/15 text-primary dark:bg-primary/25"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ChildDoc {
  _id: Id<"children">;
  firstName: string;
  lastName: string;
}

function ClassCard({
  slot,
  isEnrolled,
  subscription,
  isLoggedIn,
  hasChildren,
  children,
  onEnroll,
  onCancel,
  signInRedirectPath,
  detailsVariant = "popover",
  onAdminEdit,
  activeClassId,
  onHoverClassId,
}: {
  slot: ScheduleSlot;
  isEnrolled: boolean;
  subscription: { _id: Id<"subscriptions">; status: string } | undefined;
  isLoggedIn: boolean;
  hasChildren: boolean;
  children: ChildDoc[];
  onEnroll: (args: { classId: Id<"classes">; childId: Id<"children"> }) => Promise<Id<"subscriptions">>;
  onCancel: (args: { subscriptionId: Id<"subscriptions"> }) => Promise<null>;
  signInRedirectPath: string;
  detailsVariant?: "popover" | "drawer";
  /** Panel admina: klik otwiera edycję grupy zamiast zapisów. */
  onAdminEdit?: (
    classId: Id<"classes">,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ) => void;
  /** Hover/focus synchronization across all occurrences of same class. */
  activeClassId?: Id<"classes"> | null;
  onHoverClassId?: (classId: Id<"classes"> | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [enrollPending, setEnrollPending] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<Id<"children"> | null>(null);

  useEffect(() => {
    if (
      !open ||
      !isLoggedIn ||
      isEnrolled ||
      !hasChildren ||
      children.length !== 1
    ) {
      return;
    }
    setSelectedChildId(children[0]._id);
  }, [open, isLoggedIn, isEnrolled, hasChildren, children]);

  const c = slot.class;
  const coachName = slot.coach?.name ?? "—";
  const locationName = slot.location?.name ?? "—";
  const duration = slot.startTime && slot.endTime ? `${slot.startTime}–${slot.endTime}` : "";
  /** Active + pending_payment subscriptions from Convex (same as enrollment checks). */
  const enrolledCount = slot.enrolledCount ?? 0;
  const maxCap = c?.maxCapacity;
  const remaining =
    maxCap !== undefined ? Math.max(0, maxCap - enrolledCount) : undefined;
  const isFull = maxCap !== undefined && remaining === 0;
  const isNew =
    c !== undefined &&
    typeof c._creationTime === "number" &&
    Date.now() - c._creationTime < NEW_CLASS_THRESHOLD_MS;
  const isInactive = c?.isActive === false;
  const isClassFocused = activeClassId !== null && activeClassId === slot.classId;
  const hasOtherClassFocused =
    activeClassId !== null && activeClassId !== slot.classId;

  const handleEnroll = async () => {
    if (!selectedChildId || !c) return;
    setEnrollError(null);
    setEnrollPending(true);
    try {
      await onEnroll({ classId: slot.classId, childId: selectedChildId });
    } catch (e) {
      setEnrollError(e instanceof Error ? e.message : "Nie udało się zapisać.");
    } finally {
      setEnrollPending(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    try {
      await onCancel({ subscriptionId: subscription._id });
    } catch {
      // ignore
    }
  };

  const openDetails = () => setOpen(true);

  const handlePrimaryOpen = () => {
    if (onAdminEdit) {
      onAdminEdit(slot.classId, slot.dayOfWeek, slot.startTime, slot.endTime);
    }
    else openDetails();
  };

  const availabilityDotClass =
    maxCap === undefined
      ? "bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]"
      : isFull || remaining === 0
        ? "bg-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]"
        : (remaining ?? 0) > 5
          ? "bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]"
          : "bg-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.5)]";

  const slotsLine =
    maxCap !== undefined
      ? isFull
        ? `Pełny (${enrolledCount}/${maxCap})`
        : `${remaining}/${maxCap} miejsc`
      : "Miejsca: bez limitu";

  const card = (
    <div
      onMouseEnter={() => onHoverClassId?.(slot.classId)}
      onMouseLeave={() => onHoverClassId?.(null)}
      className={cn(
        "flex w-full min-h-[8.5rem] flex-col overflow-hidden rounded-xl border-2 text-left transition-all",
        hasOtherClassFocused && "opacity-50",
        isClassFocused && "ring-2 ring-primary/70 ring-offset-2 ring-offset-background",
        isInactive && !isClassFocused && "opacity-55 saturate-65",
        isInactive && isClassFocused && "opacity-100 saturate-100",
        onAdminEdit
          ? cn(
              "bg-orange-50/50 dark:bg-orange-900/20 hover:border-primary hover:shadow-glow",
              isInactive
                ? "border-stone-400 dark:border-stone-500"
                : "border-primary/35"
            )
          : isEnrolled
            ? "border-primary bg-primary/15 dark:bg-primary/20"
            : "border-primary/30 bg-orange-50/50 dark:bg-orange-900/20 hover:border-primary hover:shadow-glow"
      )}
    >
      <button
        type="button"
        onClick={handlePrimaryOpen}
        onFocus={() => onHoverClassId?.(slot.classId)}
        onBlur={() => onHoverClassId?.(null)}
        className="flex flex-1 flex-col px-2.5 pt-2.5 pb-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <span
            className="min-w-0 max-w-[55%] truncate rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary shadow-sm ring-1 ring-primary/20 dark:bg-stone-900/95 dark:ring-primary/30"
            title={c?.discipline}
          >
            {c?.discipline ?? "—"}
          </span>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {duration && (
              <span className="rounded bg-stone-900 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-white shadow-sm dark:bg-stone-200 dark:text-stone-900">
                {duration}
              </span>
            )}
            {isNew && (
              <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
                NOWE
              </span>
            )}
            {isEnrolled && (
              <span className="text-[10px] font-bold text-primary bg-primary/20 dark:bg-primary/30 px-1.5 py-0.5 rounded">
                Zapisany
              </span>
            )}
            {isInactive && (
              <span className="rounded bg-stone-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm dark:bg-stone-500">
                NIEAKTYWNA
              </span>
            )}
          </div>
        </div>
        <span className="font-bold text-sm text-text-main dark:text-white block truncate">
          {c?.name ?? "—"}
        </span>
        <div className="mt-2 flex min-h-0 items-center gap-1">
          <span className="material-symbols-outlined text-sm text-primary shrink-0">
            location_on
          </span>
          <span className="min-w-0 truncate text-[11px] font-medium text-text-light dark:text-stone-400">
            {locationName}
          </span>
        </div>
      </button>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-stone-200/90 px-2.5 py-2 dark:border-stone-700/80">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              availabilityDotClass
            )}
            aria-hidden
          />
          <span
            className={cn(
              "min-w-0 truncate text-[11px] font-medium",
              isFull
                ? "font-bold text-amber-800 dark:text-amber-200"
                : "text-text-light dark:text-stone-400"
            )}
          >
            {slotsLine}
          </span>
        </div>
        {!onAdminEdit && (
          <Button
            type="button"
            size="sm"
            className="h-8 shrink-0 px-3 text-xs font-bold"
            onClick={(e) => {
              e.stopPropagation();
              handlePrimaryOpen();
            }}
          >
            {isEnrolled ? "Szczegóły" : "Zapisz"}
          </Button>
        )}
      </div>
    </div>
  );

  const detailsHeading = (
    <div>
      <h3 className="font-bold text-lg text-text-main dark:text-white">
        {c?.name ?? "—"}
      </h3>
      <span className="inline-block px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
        {c?.discipline ?? "—"}
      </span>
    </div>
  );

  const detailsRest = (
    <>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2 text-text-main dark:text-stone-300">
          <span className="material-symbols-outlined text-lg text-primary">
            person
          </span>
          {coachName}
        </li>
        {duration && (
          <li className="flex items-center gap-2 text-text-main dark:text-stone-300">
            <span className="material-symbols-outlined text-lg text-primary">
              schedule
            </span>
            {duration}
          </li>
        )}
        {c?.ageGroup && (
          <li className="flex items-center gap-2 text-text-main dark:text-stone-300">
            <span className="material-symbols-outlined text-lg text-primary">
              group
            </span>
            {c.ageGroup}
          </li>
        )}
        <li className="flex items-center gap-2 text-text-main dark:text-stone-300">
          <span className="material-symbols-outlined text-lg text-primary">
            event_seat
          </span>
          <span>
            {maxCap !== undefined
              ? isFull
                ? `Brak wolnych miejsc — ${enrolledCount} / ${maxCap}`
                : `Wolne: ${remaining} / ${maxCap}`
              : "Miejsca bez limitu (brak limitu w bazie)"}
          </span>
        </li>
        <li className="flex items-center gap-2 text-text-main dark:text-stone-300">
          <span className="material-symbols-outlined text-lg text-primary">
            location_on
          </span>
          {locationName}
        </li>
      </ul>

      {!isLoggedIn && (
        <Link
          href={`/sign-in?redirect=${encodeURIComponent(signInRedirectPath)}`}
          className="flex items-center justify-center gap-2 w-full rounded-xl h-11 font-bold bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <span className="material-symbols-outlined">login</span>
          Zaloguj się, aby zapisać
        </Link>
      )}

      {isLoggedIn && isEnrolled && subscription && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">
            {subscription.status === "pending_payment"
              ? "Oczekuje na płatność"
              : "Zapisany"}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleCancel}
          >
            Wypisz
          </Button>
        </div>
      )}

      {isLoggedIn && !isEnrolled && hasChildren && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-light dark:text-stone-500 block">
            Wybierz dziecko
          </label>
          <select
            className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm"
            value={selectedChildId ?? ""}
            onChange={(e) =>
              setSelectedChildId((e.target.value as Id<"children">) || null)
            }
          >
            <option value="">—</option>
            {children.map((ch) => (
              <option key={ch._id} value={ch._id}>
                {ch.firstName} {ch.lastName}
              </option>
            ))}
          </select>
          {enrollError && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {enrollError}
            </p>
          )}
          <Button
            type="button"
            className="w-full"
            disabled={!selectedChildId || enrollPending}
            onClick={handleEnroll}
          >
            {enrollPending ? "Zapisywanie…" : "Zapisz się"}
          </Button>
        </div>
      )}
    </>
  );

  const detailsBody = (
    <div className="p-4 space-y-4">
      {detailsHeading}
      {detailsRest}
    </div>
  );

  if (onAdminEdit) {
    return <>{card}</>;
  }

  if (detailsVariant === "drawer") {
    return (
      <>
        {card}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
            <DrawerHeader className="border-b border-stone-200 text-left dark:border-stone-700">
              <DrawerTitle className="text-xl font-black text-text-main dark:text-white">
                {c?.name ?? "—"}
              </DrawerTitle>
              <p className="text-sm font-bold text-primary">{c?.discipline ?? "—"}</p>
            </DrawerHeader>
            <div className="max-h-[min(75vh,32rem)] overflow-y-auto overscroll-contain pb-6">
              <div className="space-y-4 p-4">{detailsRest}</div>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>{card}</PopoverAnchor>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        collisionPadding={16}
        className="w-80 p-0 rounded-2xl border-2 border-stone-200 dark:border-stone-700 shadow-xl"
      >
        {detailsBody}
      </PopoverContent>
    </Popover>
  );
}

export interface ScheduleViewProps {
  /** Path to redirect to after sign-in (e.g. /grafik) */
  signInRedirectPath: string;
  mode?: "public" | "admin";
  onAdminSelectClass?: (
    classId: Id<"classes">,
    dayOfWeek?: number,
    startTime?: string,
    endTime?: string
  ) => void;
  /** Override hero copy (defaults by mode). */
  pageTitle?: string;
  pageDescription?: string;
}

function decodeDisciplineParam(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  try {
    return decodeURIComponent(t);
  } catch {
    return t;
  }
}

type ActiveFilterId = "discipline" | "age" | "location";

type ActiveFilterChip = {
  id: ActiveFilterId;
  prefix: string;
  value: string;
};

function GrafikActiveFilterBeans({
  chips,
  onRemove,
  className,
}: {
  chips: ActiveFilterChip[];
  onRemove: (id: ActiveFilterId) => void;
  className?: string;
}) {
  if (chips.length === 0) return null;
  return (
    <div
      role="list"
      aria-label="Aktywne filtry"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {chips.map((c) => (
        <div
          key={c.id}
          role="listitem"
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-amber-200/90 bg-amber-50 py-1 pl-3 pr-0.5 text-sm shadow-sm dark:border-amber-900/50 dark:bg-amber-950/35"
        >
          <span className="min-w-0 truncate">
            <span className="font-medium text-amber-900/70 dark:text-amber-200/80">
              {c.prefix}
            </span>
            <span className="mx-1 text-amber-800/40 dark:text-amber-200/40">
              ·
            </span>
            <span className="font-bold text-text-main dark:text-amber-50">
              {c.value}
            </span>
          </span>
          <button
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-amber-900/60 transition-colors hover:bg-amber-900/10 hover:text-amber-900 dark:text-amber-200/70 dark:hover:bg-amber-100/10 dark:hover:text-amber-100"
            aria-label={`Usuń filtr: ${c.prefix} ${c.value}`}
            onClick={() => onRemove(c.id)}
          >
            <span className="material-symbols-outlined text-[18px] leading-none">
              close
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}

export function ScheduleView({
  signInRedirectPath,
  mode = "public",
  onAdminSelectClass,
  pageTitle,
  pageDescription,
}: ScheduleViewProps) {
  const isAdminMode = mode === "admin";
  const searchParams = useSearchParams();
  const urlDisciplineRaw =
    searchParams.get("dyscyplina") ?? searchParams.get("discipline") ?? "";
  const lastAppliedUrlDiscipline = useRef<string | null>(null);

  const [discipline, setDiscipline] = useState(FILTER_ALL);
  const [ageGroup, setAgeGroup] = useState(FILTER_ALL);
  const [locationId, setLocationId] = useState<Id<"locations"> | null>(null);
  const [showWeekend, setShowWeekend] = useState(false);
  const [mobileTableDayKey, setMobileTableDayKey] =
    useState<(typeof DAY_KEYS)[number]>("mon");
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false);
  const [activeClassId, setActiveClassId] = useState<Id<"classes"> | null>(null);

  const schedulePublic = useQuery(
    api.classes.getSchedule,
    isAdminMode ? "skip" : {}
  );
  const scheduleAdmin = useQuery(
    api.classes.listTimeSlotsForAdmin,
    isAdminMode ? {} : "skip"
  );
  const schedule = isAdminMode ? scheduleAdmin : schedulePublic;

  const currentUser = useQuery(
    api.authHelpers.getCurrentUser,
    isAdminMode ? "skip" : {}
  );
  const mySubscriptions = useQuery(
    api.subscriptions.listMySubscriptions,
    !isAdminMode && currentUser ? {} : "skip"
  );
  const myChildren = useQuery(
    api.children.listMyChildren,
    !isAdminMode && currentUser ? {} : "skip"
  );
  const enrollInClass = useMutation(api.subscriptions.enrollInClass);
  const cancelEnrollment = useMutation(api.subscriptions.cancelEnrollment);

  const { byKey, times } = useMemo(() => {
    if (!schedule)
      return { byKey: {} as Record<string, ScheduleSlot[]>, times: [] as string[] };
    return buildGrid(schedule);
  }, [schedule]);

  const enrolledClassIds = useMemo(() => {
    if (!mySubscriptions) return new Set<string>();
    return new Set(
      mySubscriptions
        .filter((s) => s.status === "pending_payment" || s.status === "active")
        .map((s) => s.classId)
    );
  }, [mySubscriptions]);

  const locations = useMemo(() => {
    if (!schedule) return [];
    const seen = new Set<Id<"locations">>();
    const list: { _id: Id<"locations">; name: string }[] = [];
    for (const slot of schedule) {
      const loc = slot.location;
      if (loc && !seen.has(loc._id)) {
        seen.add(loc._id);
        list.push({ _id: loc._id, name: loc.name });
      }
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [schedule]);

  const disciplineOptions = useMemo(() => {
    if (!schedule?.length) return [FILTER_ALL];
    const seen = new Set<string>();
    for (const slot of schedule) {
      const d = slot.class?.discipline;
      if (d) seen.add(d);
    }
    return [FILTER_ALL, ...[...seen].sort((a, b) => a.localeCompare(b, "pl"))];
  }, [schedule]);

  /** Deep links e.g. /grafik?dyscyplina=Judo — sync from URL without clobbering manual filter changes on Convex refetch. */
  useEffect(() => {
    if (!schedule) return;
    const decoded = decodeDisciplineParam(urlDisciplineRaw);
    if (!decoded) {
      lastAppliedUrlDiscipline.current = null;
      return;
    }
    if (lastAppliedUrlDiscipline.current === decoded) return;
    lastAppliedUrlDiscipline.current = decoded;
    if (disciplineOptions.includes(decoded) && decoded !== FILTER_ALL) {
      setDiscipline(decoded);
    }
  }, [schedule, disciplineOptions, urlDisciplineRaw]);

  const ageGroupOptions = useMemo(() => {
    if (!schedule?.length) return [FILTER_ALL];
    const seen = new Set<string>();
    for (const slot of schedule) {
      const a = slot.class?.ageGroup?.trim();
      if (a) seen.add(a);
    }
    return [FILTER_ALL, ...[...seen].sort((a, b) => a.localeCompare(b, "pl"))];
  }, [schedule]);

  useEffect(() => {
    if (!schedule) return;
    if (discipline !== FILTER_ALL && !disciplineOptions.includes(discipline)) {
      setDiscipline(FILTER_ALL);
    }
  }, [schedule, discipline, disciplineOptions]);

  useEffect(() => {
    if (!schedule) return;
    if (ageGroup !== FILTER_ALL && !ageGroupOptions.includes(ageGroup)) {
      setAgeGroup(FILTER_ALL);
    }
  }, [schedule, ageGroup, ageGroupOptions]);

  const locationSelectValue = locationId ?? LOCATION_ALL;
  const locationOptions = useMemo(
    () => [
      { value: LOCATION_ALL, label: FILTER_ALL },
      ...locations.map((loc) => ({ value: loc._id, label: loc.name })),
    ],
    [locations]
  );

  const disciplineDisplay =
    discipline === FILTER_ALL ? FILTER_ALL : discipline;
  const ageDisplay = ageGroup === FILTER_ALL ? FILTER_ALL : ageGroup;
  const locationDisplay =
    locationId === null
      ? FILTER_ALL
      : locations.find((l) => l._id === locationId)?.name ?? FILTER_ALL;

  const activeFilterChips = useMemo((): ActiveFilterChip[] => {
    const out: ActiveFilterChip[] = [];
    if (discipline !== FILTER_ALL) {
      out.push({
        id: "discipline",
        prefix: "Dyscyplina",
        value: discipline,
      });
    }
    if (ageGroup !== FILTER_ALL) {
      out.push({
        id: "age",
        prefix: "Grupa wiekowa",
        value: ageGroup,
      });
    }
    if (locationId !== null) {
      const name = locations.find((l) => l._id === locationId)?.name;
      if (name) {
        out.push({
          id: "location",
          prefix: "Lokalizacja",
          value: name,
        });
      }
    }
    return out;
  }, [discipline, ageGroup, locationId, locations]);

  const removeActiveFilter = useCallback((id: ActiveFilterId) => {
    if (id === "discipline") setDiscipline(FILTER_ALL);
    else if (id === "age") setAgeGroup(FILTER_ALL);
    else setLocationId(null);
  }, []);

  const isLoggedIn =
    !isAdminMode && currentUser !== undefined && currentUser !== null;
  const hasChildren = !isAdminMode && (myChildren?.length ?? 0) > 0;

  const headingTitle = pageTitle ?? "Grafik zajęć";
  const headingDescription =
    pageDescription ??
    "Wybierz dyscyplinę i grupę wiekową. Kliknij na zajęcia, aby zobaczyć szczegóły i zapisać się.";

  const visibleDays = useMemo(
    () =>
      showWeekend
        ? DAYS
        : DAYS.filter((d) => !WEEKEND_DAY_KEYS.has(d.key)),
    [showWeekend]
  );

  useEffect(() => {
    setMobileTableDayKey(pickDefaultDayKey(DAYS));
  }, []);

  const mobileDayTimes = useMemo(() => {
    if (!schedule?.length) return [];
    const result: string[] = [];
    for (const t of times) {
      const key = `${mobileTableDayKey}-${t}`;
      const cellSlots = (byKey[key] ?? []).filter((slot) =>
        matchesFilters(slot, discipline, ageGroup, locationId)
      );
      if (cellSlots.length > 0) result.push(t);
    }
    return result;
  }, [
    schedule,
    times,
    byKey,
    mobileTableDayKey,
    discipline,
    ageGroup,
    locationId,
  ]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl">
      {!isAdminMode && (
        <div className="mb-8 w-full min-w-0 sm:mb-10">
          <h1 className="mb-3 text-3xl font-black tracking-tight text-text-main dark:text-white sm:mb-4 sm:text-4xl md:text-5xl">
            {headingTitle}
          </h1>
          <p className="max-w-2xl text-base text-text-light dark:text-stone-400 sm:text-lg">
            {headingDescription}
          </p>
        </div>
      )}

      <div
        className={cn(
          "mb-8 rounded-2xl border border-stone-200 bg-white p-3 shadow-soft dark:border-stone-700 dark:bg-stone-900/80 sm:mb-10 sm:p-4",
          isAdminMode &&
            "max-lg:border-0 max-lg:bg-transparent max-lg:shadow-none dark:max-lg:bg-transparent"
        )}
      >
        {/* Desktop: wszystkie filtry od razu */}
        <div className="hidden flex-col gap-3 lg:flex lg:flex-row lg:flex-wrap lg:items-stretch lg:gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:flex-wrap lg:gap-3">
            <CompactFilterPopover
              filterLabel="Dyscyplina"
              valueDisplay={disciplineDisplay}
              iconName="sports_martial_arts"
              iconWrapperClassName="bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300"
              options={disciplineOptions.map((d) => ({ value: d, label: d }))}
              selectedValue={discipline}
              onSelect={setDiscipline}
            />
            <CompactFilterPopover
              filterLabel="Grupa wiekowa"
              valueDisplay={ageDisplay}
              iconName="child_care"
              iconWrapperClassName="bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
              options={ageGroupOptions.map((a) => ({ value: a, label: a }))}
              selectedValue={ageGroup}
              onSelect={setAgeGroup}
            />
            <CompactFilterPopover
              filterLabel="Lokalizacja"
              valueDisplay={locationDisplay}
              iconName="location_on"
              iconWrapperClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
              options={locationOptions}
              selectedValue={locationSelectValue}
              onSelect={(v) =>
                setLocationId(
                  v === LOCATION_ALL ? null : (v as Id<"locations">)
                )
              }
            />
          </div>
          <div className="flex w-full shrink-0 items-center justify-end gap-3 lg:ml-auto lg:w-auto">
            <span
              id="grafik-weekend-label"
              className="text-sm font-medium text-text-main dark:text-stone-300"
            >
              Pokaż weekend
            </span>
            <Switch
              checked={showWeekend}
              onCheckedChange={setShowWeekend}
              aria-labelledby="grafik-weekend-label"
            />
          </div>
        </div>

        {activeFilterChips.length > 0 ? (
          <div className="mt-3 hidden border-t border-stone-200 pt-3 dark:border-stone-700 lg:block">
            <GrafikActiveFilterBeans
              chips={activeFilterChips}
              onRemove={removeActiveFilter}
            />
          </div>
        ) : null}

        {/* Mobile: dzień + Więcej, reszta po rozwinięciu (bez weekendu — zawsze pełny tydzień) */}
        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex w-full items-end justify-between gap-3">
            <div className="w-1/2 min-w-0 shrink-0">
              <label
                htmlFor="grafik-day-select"
                className="mb-1.5 ml-2 block text-[10px] font-bold uppercase tracking-wider text-amber-900/55 dark:text-stone-500"
              >
                Dzień
              </label>
              <Select
                value={mobileTableDayKey}
                onValueChange={(v) =>
                  setMobileTableDayKey(v as (typeof DAY_KEYS)[number])
                }
              >
                <SelectTrigger
                  id="grafik-day-select"
                  className="h-11 w-full rounded-xl border-stone-200 bg-white text-sm font-bold dark:border-stone-600 dark:bg-stone-900"
                >
                  <SelectValue placeholder="Wybierz dzień" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {DAYS.map((d) => (
                    <SelectItem
                      key={d.key}
                      value={d.key}
                      className="rounded-lg py-2.5 text-base"
                    >
                      {DAY_LONG_LABEL[d.key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button
              type="button"
              id="grafik-filters-more"
              aria-expanded={mobileFiltersExpanded}
              aria-controls="grafik-extra-filters"
              onClick={() => setMobileFiltersExpanded((v) => !v)}
              className="mr-1.5 shrink-0 rounded-lg px-1 py-2 text-sm font-bold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {mobileFiltersExpanded ? "Mniej" : "Więcej"}
            </button>
          </div>

          <GrafikActiveFilterBeans
            className="lg:hidden"
            chips={activeFilterChips}
            onRemove={removeActiveFilter}
          />

          <div
            id="grafik-extra-filters"
            className={cn(
              "flex flex-col gap-3 border-t border-stone-200 pt-3 dark:border-stone-600",
              !mobileFiltersExpanded && "hidden"
            )}
          >
            <CompactFilterPopover
              filterLabel="Dyscyplina"
              valueDisplay={disciplineDisplay}
              iconName="sports_martial_arts"
              iconWrapperClassName="bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300"
              options={disciplineOptions.map((d) => ({ value: d, label: d }))}
              selectedValue={discipline}
              onSelect={setDiscipline}
            />
            <CompactFilterPopover
              filterLabel="Grupa wiekowa"
              valueDisplay={ageDisplay}
              iconName="child_care"
              iconWrapperClassName="bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
              options={ageGroupOptions.map((a) => ({
                value: a,
                label: a,
              }))}
              selectedValue={ageGroup}
              onSelect={setAgeGroup}
            />
            <CompactFilterPopover
              filterLabel="Lokalizacja"
              valueDisplay={locationDisplay}
              iconName="location_on"
              iconWrapperClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
              options={locationOptions}
              selectedValue={locationSelectValue}
              onSelect={(v) =>
                setLocationId(
                  v === LOCATION_ALL ? null : (v as Id<"locations">)
                )
              }
            />
          </div>
        </div>
      </div>

      {schedule === undefined ? (
        <p className="text-text-light dark:text-stone-400">Ładowanie grafiku…</p>
      ) : !schedule.length ? (
        <p className="text-text-light dark:text-stone-400">Brak zajęć w grafiku.</p>
      ) : (
        <>
          <div className="w-full min-w-0 lg:hidden">
            <div
              className={cn(
                "w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-stone-700 dark:bg-stone-900/80",
                isAdminMode &&
                  "border-0 bg-transparent shadow-none dark:bg-transparent"
              )}
            >
              {mobileDayTimes.length === 0 ? (
                <p className="p-8 text-center text-sm font-medium text-text-light dark:text-stone-400">
                  Brak zajęć w wybranym dniu przy aktualnych filtrach.
                </p>
              ) : (
                <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                  {mobileDayTimes.map((time) => {
                    const key = `${mobileTableDayKey}-${time}`;
                    const cellSlots = (byKey[key] ?? []).filter((slot) =>
                      matchesFilters(slot, discipline, ageGroup, locationId)
                    );
                    return (
                      <li key={time} className="p-3 sm:p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-xl text-primary">
                            schedule
                          </span>
                          <span className="text-base font-black text-text-main dark:text-white">
                            {time}
                          </span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {cellSlots.map((slot) => (
                            <ClassCard
                              key={`${slot._id}-${slot.classId}`}
                              slot={slot}
                              isEnrolled={enrolledClassIds.has(slot.classId)}
                              subscription={
                                mySubscriptions?.find(
                                  (s) =>
                                    s.classId === slot.classId &&
                                    (s.status === "pending_payment" ||
                                      s.status === "active")
                                )
                              }
                              isLoggedIn={isLoggedIn}
                              hasChildren={hasChildren}
                              children={myChildren ?? []}
                              onEnroll={enrollInClass}
                              onCancel={cancelEnrollment}
                              signInRedirectPath={signInRedirectPath}
                              detailsVariant="drawer"
                              activeClassId={activeClassId}
                              onHoverClassId={setActiveClassId}
                              onAdminEdit={
                                isAdminMode && onAdminSelectClass
                                  ? onAdminSelectClass
                                  : undefined
                              }
                            />
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/80 shadow-soft lg:block">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr>
                  <th className="w-24 border-r border-stone-200/90 bg-stone-100 p-4 text-left text-xs font-bold text-text-light dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-400 uppercase">
                    Godzina
                  </th>
                  {visibleDays.map((d) => (
                    <th
                      key={d.key}
                      className="p-4 text-center text-sm font-bold text-text-main dark:text-white"
                    >
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {times.map((time) => (
                  <tr
                    key={time}
                    className="border-t border-stone-100 dark:border-stone-800"
                  >
                    <td className="border-r border-stone-200/90 bg-stone-100 p-4 text-sm font-bold text-text-main dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-300">
                      {time}
                    </td>
                    {visibleDays.map((d) => {
                      const key = `${d.key}-${time}`;
                      const cellSlots = (byKey[key] ?? []).filter((slot) =>
                        matchesFilters(slot, discipline, ageGroup, locationId)
                      );
                      return (
                        <td
                          key={d.key}
                          className="p-2 align-top min-w-[120px]"
                        >
                          <div className="flex flex-col gap-2">
                            {cellSlots.map((slot) => (
                              <ClassCard
                                key={`${slot._id}-${slot.classId}`}
                                slot={slot}
                                isEnrolled={enrolledClassIds.has(
                                  slot.classId
                                )}
                                subscription={
                                  mySubscriptions?.find(
                                    (s) =>
                                      s.classId === slot.classId &&
                                      (s.status === "pending_payment" ||
                                        s.status === "active")
                                  )
                                }
                                isLoggedIn={isLoggedIn}
                                hasChildren={hasChildren}
                                children={myChildren ?? []}
                                onEnroll={enrollInClass}
                                onCancel={cancelEnrollment}
                                signInRedirectPath={signInRedirectPath}
                                activeClassId={activeClassId}
                                onHoverClassId={setActiveClassId}
                                onAdminEdit={
                                  isAdminMode && onAdminSelectClass
                                    ? onAdminSelectClass
                                    : undefined
                                }
                              />
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!isAdminMode &&
        isLoggedIn &&
        !hasChildren &&
        schedule !== undefined &&
        schedule.length > 0 && (
        <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-orange-50/50 dark:bg-orange-900/20 border-stone-200 dark:border-stone-700 p-4 flex flex-wrap items-center justify-center gap-3">
          <p className="text-sm font-medium text-text-main dark:text-stone-300">
            Aby zapisać dziecko na zajęcia, dodaj je w panelu.
          </p>
          <Link
            href="/dashboard/dzieci"
            className="inline-flex items-center justify-center gap-2 rounded-xl h-11 px-6 font-bold border-2 border-primary text-primary hover:bg-primary/10"
          >
            Dodaj dziecko w Moje dzieci
          </Link>
        </div>
      )}
    </div>
  );
}
