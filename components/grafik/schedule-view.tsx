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
            "inline-flex min-w-0 w-full max-w-full items-center gap-3 rounded-2xl border border-stone-200/90 bg-white px-3 py-2.5 pr-3 shadow-xs transition-colors sm:w-auto sm:max-w-[min(100%,18rem)] sm:rounded-full",
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

  const anyClassFocused = activeClassId != null;

  const card = (
    <div
      onMouseEnter={() => onHoverClassId?.(slot.classId)}
      onMouseLeave={() => onHoverClassId?.(null)}
      className={cn(
        "group/card relative flex w-full min-h-34 flex-col overflow-hidden rounded-xl border text-left will-change-transform",
        "transition-[border-color,box-shadow,opacity,transform,background-color,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isClassFocused &&
          "animate-class-focus z-10 scale-[1.01] border-primary/80 bg-orange-50/40 dark:border-primary/50 dark:bg-primary/12",
        isClassFocused && isEnrolled && !onAdminEdit && "bg-primary/12 dark:bg-primary/20",
        !isClassFocused &&
          hasOtherClassFocused &&
          "scale-[0.99] opacity-55 saturate-75",
        !isClassFocused &&
          !anyClassFocused &&
          "hover:-translate-y-px hover:shadow-card motion-reduce:hover:translate-y-0",
        !isClassFocused &&
          isEnrolled &&
          !onAdminEdit &&
          "border-primary/50 bg-primary/10 dark:border-primary/40 dark:bg-primary/15",
        !isClassFocused &&
          !(isEnrolled && !onAdminEdit) &&
          "border-stone-200/90 bg-white dark:border-stone-700 dark:bg-[#2a2015]",
        !isClassFocused &&
          !hasOtherClassFocused &&
          !(isEnrolled && !onAdminEdit) &&
          "hover:border-stone-300 dark:hover:border-stone-600",
        isInactive && !isClassFocused && "opacity-55 saturate-65",
        isInactive && isClassFocused && "opacity-100 saturate-100"
      )}
    >
      <span
        className={cn(
          "absolute inset-y-2 left-0 w-0.5 origin-center rounded-full bg-primary transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isClassFocused || (isEnrolled && !onAdminEdit)
            ? "scale-y-100"
            : "scale-y-0"
        )}
        aria-hidden
      />
      <button
        type="button"
        onClick={handlePrimaryOpen}
        onFocus={() => onHoverClassId?.(slot.classId)}
        onBlur={() => onHoverClassId?.(null)}
        className="flex flex-1 flex-col px-3 pb-2.5 pt-3 text-left outline-hidden focus-visible:bg-stone-50/80 dark:focus-visible:bg-stone-800/40"
      >
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <span
            className="min-w-0 max-w-[58%] truncate text-[10px] font-bold uppercase tracking-[0.12em] text-primary"
            title={c?.discipline}
          >
            {c?.discipline ?? "—"}
          </span>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
            {duration ? (
              <span className="rounded-md bg-stone-900/90 px-1.5 py-0.5 text-[10px] font-bold tabular-nums tracking-wide text-white dark:bg-stone-100 dark:text-stone-900">
                {duration}
              </span>
            ) : null}
            {isNew ? (
              <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                Nowe
              </span>
            ) : null}
            {isEnrolled ? (
              <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary dark:bg-primary/25">
                Zapisany
              </span>
            ) : null}
            {isInactive ? (
              <span className="rounded-md bg-stone-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                Nieaktywna
              </span>
            ) : null}
          </div>
        </div>
        <span className="block truncate text-sm font-bold leading-snug text-text-main dark:text-white">
          {c?.name ?? "—"}
        </span>
        <div className="mt-1.5 flex min-h-0 items-center gap-1">
          <span className="material-symbols-outlined shrink-0 text-[16px] text-stone-400" aria-hidden>
            location_on
          </span>
          <span className="min-w-0 truncate text-[11px] font-medium text-stone-500 dark:text-stone-400">
            {locationName}
          </span>
        </div>
      </button>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-stone-100 px-3 py-2 dark:border-stone-800">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span
            className={cn("size-1.5 shrink-0 rounded-full", availabilityDotClass)}
            aria-hidden
          />
          <span
            className={cn(
              "min-w-0 truncate text-[11px] font-medium",
              isFull
                ? "font-semibold text-amber-800 dark:text-amber-200"
                : "text-stone-500 dark:text-stone-400"
            )}
          >
            {slotsLine}
          </span>
        </div>
        {!onAdminEdit && (
          <Button
            type="button"
            size="sm"
            variant={isEnrolled ? "outline" : "default"}
            className={cn(
              "h-7 shrink-0 rounded-lg px-2.5 text-[11px] font-bold",
              !isEnrolled && "bg-primary hover:bg-primary-hover"
            )}
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

  const detailRows = [
    { icon: "person", label: "Trener", value: coachName },
    duration
      ? { icon: "schedule", label: "Godziny", value: duration }
      : null,
    c?.ageGroup
      ? { icon: "child_care", label: "Grupa wiekowa", value: c.ageGroup }
      : null,
    {
      icon: "event_seat",
      label: "Miejsca",
      value:
        maxCap !== undefined
          ? isFull
            ? `Brak wolnych miejsc (${enrolledCount}/${maxCap})`
            : `Wolne: ${remaining} / ${maxCap}`
          : "Bez limitu",
    },
    { icon: "location_on", label: "Lokalizacja", value: locationName },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  const detailsMeta = (
    <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200/80 bg-stone-50/70 dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-950/30">
      {detailRows.map((row) => (
        <li key={row.label} className="flex items-start gap-3 px-3.5 py-2.5">
          <span
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            aria-hidden
          >
            <span className="material-symbols-outlined text-[18px]">
              {row.icon}
            </span>
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
              {row.label}
            </p>
            <p className="text-sm font-semibold text-text-main dark:text-stone-100">
              {row.value}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );

  const detailsActions = (
    <div className="space-y-3">
      {!isLoggedIn && (
        <Link
          href={`/sign-in?redirect=${encodeURIComponent(signInRedirectPath)}`}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden>
            login
          </span>
          Zaloguj się, aby zapisać
        </Link>
      )}

      {isLoggedIn && isEnrolled && subscription && (
        <div className="space-y-3 rounded-xl border border-stone-200/80 bg-primary/5 p-3.5 dark:border-stone-800 dark:bg-primary/10">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                subscription.status === "pending_payment"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                  : "bg-primary/15 text-primary"
              )}
            >
              {subscription.status === "pending_payment"
                ? "Oczekuje na płatność"
                : "Zapisany"}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-xl font-semibold"
            onClick={handleCancel}
          >
            Wypisz z zajęć
          </Button>
        </div>
      )}

      {isLoggedIn && !isEnrolled && !hasChildren && (
        <div className="space-y-3 rounded-xl border border-stone-200/80 bg-orange-50/70 p-3.5 dark:border-stone-800 dark:bg-primary/10">
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            Dodaj profil dziecka, aby zapisać je na te zajęcia.
          </p>
          <Link
            href="/dashboard/dzieci"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          >
            Moje dzieci
          </Link>
        </div>
      )}

      {isLoggedIn && !isEnrolled && hasChildren && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label
              htmlFor={`enroll-child-${slot._id}`}
              className="block text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400"
            >
              Wybierz dziecko
            </label>
            <select
              id={`enroll-child-${slot._id}`}
              className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium text-text-main outline-hidden transition-colors focus:border-primary dark:border-stone-700 dark:bg-stone-950/50 dark:text-stone-100"
              value={selectedChildId ?? ""}
              onChange={(e) =>
                setSelectedChildId((e.target.value as Id<"children">) || null)
              }
            >
              <option value="">Wybierz…</option>
              {children.map((ch) => (
                <option key={ch._id} value={ch._id}>
                  {ch.firstName} {ch.lastName}
                </option>
              ))}
            </select>
          </div>
          {enrollError ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden>
                error
              </span>
              <span>{enrollError}</span>
            </div>
          ) : null}
          <Button
            type="button"
            className="h-11 w-full rounded-xl bg-primary text-sm font-bold hover:bg-primary-hover"
            disabled={!selectedChildId || enrollPending || isFull}
            onClick={handleEnroll}
          >
            {enrollPending
              ? "Zapisywanie…"
              : isFull
                ? "Brak miejsc"
                : "Zapisz na zajęcia"}
          </Button>
        </div>
      )}
    </div>
  );

  const detailsBody = (
    <div className="overflow-hidden">
      <div className="border-b border-stone-100 px-5 py-4 dark:border-stone-800">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
          {c?.discipline ?? "Zajęcia"}
        </p>
        <h3 className="mt-1 text-lg font-black tracking-tight text-text-main dark:text-white">
          {c?.name ?? "—"}
        </h3>
        {isNew ? (
          <span className="mt-2 inline-flex rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Nowe
          </span>
        ) : null}
      </div>
      <div className="space-y-4 px-5 py-4">
        {detailsMeta}
        {detailsActions}
      </div>
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
          <DrawerContent className="border-stone-200 bg-[#FDFBF7] dark:border-stone-800 dark:bg-[#2a2015]">
            <DrawerHeader className="border-b border-stone-200/80 px-5 pb-4 text-left dark:border-stone-800">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                {c?.discipline ?? "Zajęcia"}
              </p>
              <DrawerTitle className="mt-1 text-xl font-black tracking-tight text-text-main dark:text-white">
                {c?.name ?? "—"}
              </DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[min(75vh,32rem)] overflow-y-auto overscroll-contain px-5 py-4 pb-8">
              <div className="space-y-4">
                {detailsMeta}
                {detailsActions}
              </div>
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
        sideOffset={10}
        collisionPadding={16}
        className="w-[22rem] overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-0 text-popover-foreground shadow-card-hover dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark-hover"
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
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-amber-200/90 bg-amber-50 py-1 pl-3 pr-0.5 text-sm shadow-xs dark:border-amber-900/50 dark:bg-amber-950/35"
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
              className="mr-1.5 shrink-0 rounded-lg px-1 py-2 text-sm font-bold text-primary underline underline-offset-4 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                "w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark",
                isAdminMode &&
                  "border-0 bg-transparent shadow-none dark:bg-transparent"
              )}
            >
              {mobileDayTimes.length === 0 ? (
                <p className="p-8 text-center text-sm font-medium text-stone-500 dark:text-stone-400">
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
                          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-[18px]" aria-hidden>
                              schedule
                            </span>
                          </span>
                          <span className="text-base font-bold tabular-nums text-text-main dark:text-white">
                            {time}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2.5">
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

          <div className="hidden overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card dark:border-stone-800 dark:bg-[#2a2015] dark:shadow-card-dark lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0">
                <colgroup>
                  <col className="w-[5.5rem]" />
                  {visibleDays.map((d) => (
                    <col key={d.key} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 border-b border-stone-200/90 bg-stone-50 px-2 py-3.5 text-center align-middle dark:border-stone-700 dark:bg-[#241c12]">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                        Godz.
                      </span>
                    </th>
                    {visibleDays.map((d) => (
                      <th
                        key={d.key}
                        className="border-b border-stone-200/90 bg-stone-50 px-2.5 py-3.5 text-center align-middle dark:border-stone-700 dark:bg-[#241c12]"
                      >
                        <span className="text-sm font-bold tracking-tight text-text-main dark:text-white">
                          {d.label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {times.map((time, rowIndex) => (
                    <tr key={time}>
                      <td
                        className={cn(
                          "sticky left-0 z-10 px-2 py-3 text-center align-middle",
                          "bg-white dark:bg-[#2a2015]",
                          rowIndex < times.length - 1 &&
                            "border-b border-stone-200/70 dark:border-stone-700/80"
                        )}
                      >
                        <span className="inline-flex h-8 min-w-[3.5rem] items-center justify-center rounded-lg bg-stone-100 px-2 text-xs font-bold tabular-nums text-text-main dark:bg-stone-900/80 dark:text-stone-100">
                          {time}
                        </span>
                      </td>
                      {visibleDays.map((d) => {
                        const key = `${d.key}-${time}`;
                        const cellSlots = (byKey[key] ?? []).filter((slot) =>
                          matchesFilters(slot, discipline, ageGroup, locationId)
                        );
                        return (
                          <td
                            key={d.key}
                            className={cn(
                              "min-w-0 px-2 py-3 align-top",
                              rowIndex < times.length - 1 &&
                                "border-b border-stone-200/70 dark:border-stone-700/80"
                            )}
                          >
                            {cellSlots.length > 0 ? (
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
                            ) : (
                              <div className="min-h-8" aria-hidden />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!isAdminMode &&
        isLoggedIn &&
        !hasChildren &&
        schedule !== undefined &&
        schedule.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-stone-200/80 bg-orange-50/60 p-4 dark:border-stone-800 dark:bg-primary/10">
          <p className="text-sm font-medium text-text-main dark:text-stone-300">
            Aby zapisać dziecko na zajęcia, dodaj je w panelu.
          </p>
          <Link
            href="/dashboard/dzieci"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-primary px-6 font-bold text-primary transition-colors hover:bg-primary/10"
          >
            Dodaj dziecko w Moje dzieci
          </Link>
        </div>
      )}
    </div>
  );
}
