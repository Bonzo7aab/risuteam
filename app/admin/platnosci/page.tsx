"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getNocowankaPrice } from "@/lib/nocowanki";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const OVERDUE_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const EXPAND_SPECIAL_CASE_CLASS_COUNT = 8;

type CampsPaymentRow = {
  id: string;
  source: "camp" | "nocowanka";
  registrationId: Id<"registrations"> | Id<"nocowankaRegistrations">;
  studentName: string;
  parentName: string;
  amount: number;
  amountPaid?: number;
  date: number;
  eventName: string;
  eventType: "camp" | "nocowanka";
  eventKey: string;
  eventOpen: boolean;
  paymentStatus: "paid" | "partial" | "unpaid";
  slug?: string;
};

type ClassPaymentRow = {
  id: string;
  source: "class";
  registrationId: Id<"subscriptions">;
  subscriptionId: Id<"subscriptions">;
  userId: Id<"users">;
  childId?: Id<"children">;
  studentName: string;
  parentName: string;
  amount: number;
  amountPaid?: number;
  date: number;
  eventName: string;
  classType?: string;
  eventType: "class";
  eventKey: string;
  eventOpen: boolean;
  paymentStatus: "paid" | "partial" | "unpaid";
  sessionsPerWeek: number;
  parentEmail?: string | null;
};

type PaymentRow = CampsPaymentRow | ClassPaymentRow;
type DisplayStatus = "paid" | "pending" | "overdue";
type SortDirection = "asc" | "desc";
type StatusSortKey = "paid" | "partial" | "pending" | "overdue";

type GroupedClassRow = {
  groupKey: string;
  parentName: string;
  studentName: string;
  classCount: number;
  weeklySessionsTotal: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  overdueCount: number;
  worstStatusKey: StatusSortKey;
  latestStart: number;
  earliestStart: number;
  latestPaidAt?: number;
  classTypes: string[];
  eventKeys: string[];
  statusKeys: StatusSortKey[];
  subscriptions: ClassPaymentRow[];
};

function formatPln(amount: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDisplayStatus(row: PaymentRow): DisplayStatus {
  if (row.paymentStatus === "paid") return "paid";
  return row.date < Date.now() - OVERDUE_DAYS_MS ? "overdue" : "pending";
}

function getPaymentStatusLabel(status: "paid" | "partial" | "unpaid"): string {
  if (status === "paid") return "Opłacone";
  if (status === "partial") return "Częściowo opłacone";
  return "Nieopłacone";
}

function getStatusSortKey(row: PaymentRow): StatusSortKey {
  const display = getDisplayStatus(row);
  if (display === "paid") return "paid";
  if (row.paymentStatus === "partial") return "partial";
  return display === "overdue" ? "overdue" : "pending";
}

function getPaidValue(row: PaymentRow): number {
  if (row.paymentStatus === "paid") return row.amount;
  if (row.paymentStatus === "partial") return row.amountPaid ?? 0;
  return 0;
}

function getDueValue(row: PaymentRow): number {
  return Math.max(0, row.amount - getPaidValue(row));
}

function PaymentStatusBadge({ row }: { row: PaymentRow }) {
  const displayStatus = getDisplayStatus(row);
  const className = cn(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
    displayStatus === "paid" &&
      "bg-green-100 text-green-800 dark:bg-green-900/35 dark:text-green-200",
    row.paymentStatus === "partial" &&
      displayStatus !== "overdue" &&
      "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-200",
    (row.paymentStatus === "unpaid" || displayStatus === "overdue") &&
      "bg-red-100 text-red-800 dark:bg-red-900/35 dark:text-red-200"
  );
  const content = (
    <>
      {getPaymentStatusLabel(row.paymentStatus)}
      {displayStatus === "overdue" ? " (po terminie)" : ""}
    </>
  );
  return <span className={className}>{content}</span>;
}

const STATUS_PRIORITY: StatusSortKey[] = ["overdue", "pending", "partial", "paid"];

function getWorstStatusKey(keys: StatusSortKey[]): StatusSortKey {
  for (const candidate of STATUS_PRIORITY) {
    if (keys.includes(candidate)) return candidate;
  }
  return "paid";
}

function getStatusKeyLabel(key: StatusSortKey): string {
  if (key === "paid") return "Opłacone";
  if (key === "partial") return "Częściowo opłacone";
  if (key === "overdue") return "Po terminie";
  return "Oczekujące";
}

function GroupedStatusBadge({ statusKey }: { statusKey: StatusSortKey }) {
  const className = cn(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
    statusKey === "paid" &&
      "bg-green-100 text-green-800 dark:bg-green-900/35 dark:text-green-200",
    statusKey === "partial" &&
      "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-200",
    statusKey === "pending" &&
      "bg-stone-200 text-stone-700 dark:bg-stone-700/40 dark:text-stone-200",
    statusKey === "overdue" &&
      "bg-red-100 text-red-800 dark:bg-red-900/35 dark:text-red-200"
  );
  return <span className={className}>{getStatusKeyLabel(statusKey)}</span>;
}

function getGroupLastPaymentDate(group: GroupedClassRow): number {
  return group.latestPaidAt ?? group.latestStart;
}

export default function AdminPlatnosciPage() {
  const campsRowsRaw = useQuery(api.payments.listPaymentRowsForAdmin);
  const classRowsRaw = useQuery(api.payments.listClassPaymentRowsForAdmin);
  const classesList = useQuery(api.classes.listForAdmin);
  const setPaymentStatus = useMutation(api.payments.setRegistrationPaymentStatus);
  const setClassSubscriptionsPaymentStatus = useMutation(
    api.payments.setClassSubscriptionsPaymentStatusForAdmin
  );
  const sendClassPaymentReminderEmail = useAction(
    api.payments.sendClassPaymentReminderEmail
  );

  const [paymentScope, setPaymentScope] = useState<"camps" | "classes">("camps");
  const [openEventType, setOpenEventType] = useState<"camp" | "nocowanka">("camp");
  const [closedEventKey, setClosedEventKey] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [updatingRowId, setUpdatingRowId] = useState<string | null>(null);
  const [partialDialogRow, setPartialDialogRow] = useState<CampsPaymentRow | null>(null);
  const [partialAmount, setPartialAmount] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [selectedOpenCampKeys, setSelectedOpenCampKeys] = useState<string[]>([]);
  const [selectedOpenSleepoverKeys, setSelectedOpenSleepoverKeys] = useState<string[]>([]);
  const [selectedClassTypes, setSelectedClassTypes] = useState<string[]>([]);
  const [statusSortSelection, setStatusSortSelection] = useState<Record<StatusSortKey, boolean>>({
    paid: false,
    partial: false,
    pending: false,
    overdue: false,
  });
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(new Set());
  const [reminderTargetGroup, setReminderTargetGroup] =
    useState<GroupedClassRow | null>(null);
  const [reminderSending, setReminderSending] = useState(false);
  /** `group:${groupKey}` or `sub:${ClassPaymentRow.id}` */
  const [classPaymentUpdating, setClassPaymentUpdating] = useState<string | null>(
    null
  );

  const campsRows = useMemo<CampsPaymentRow[]>(() => {
    if (!campsRowsRaw) return [];
    return campsRowsRaw.map((r) => ({
      ...r,
      amount:
        r.source === "nocowanka" && r.slug ? getNocowankaPrice(r.slug) : r.amount,
    }));
  }, [campsRowsRaw]);

  const classRows = useMemo<ClassPaymentRow[]>(
    () =>
      classRowsRaw
        ? classRowsRaw.map((r) => ({
            ...r,
            paymentStatus: r.paymentStatus as "paid" | "partial" | "unpaid",
            sessionsPerWeek: r.sessionsPerWeek ?? 1,
          }))
        : [],
    [classRowsRaw]
  );

  const groupedClassRows = useMemo<GroupedClassRow[]>(() => {
    const groups = new Map<string, GroupedClassRow>();
    for (const row of classRows) {
      const key = `${row.userId}::${row.childId ?? "none"}`;
      const statusKey = getStatusSortKey(row);
      let group = groups.get(key);
      if (!group) {
        group = {
          groupKey: key,
          parentName: row.parentName,
          studentName: row.studentName,
          classCount: 0,
          weeklySessionsTotal: 0,
          paidCount: 0,
          partialCount: 0,
          unpaidCount: 0,
          overdueCount: 0,
          worstStatusKey: "paid",
          latestStart: row.date,
          earliestStart: row.date,
          latestPaidAt: undefined,
          classTypes: [],
          eventKeys: [],
          statusKeys: [],
          subscriptions: [],
        };
        groups.set(key, group);
      }
      group.classCount += 1;
      group.weeklySessionsTotal += row.sessionsPerWeek;
      group.subscriptions.push(row);
      if (statusKey === "paid") group.paidCount += 1;
      else if (statusKey === "partial") group.partialCount += 1;
      else if (statusKey === "overdue") group.overdueCount += 1;
      else group.unpaidCount += 1;
      if (statusKey === "paid") {
        group.latestPaidAt =
          group.latestPaidAt === undefined
            ? row.date
            : Math.max(group.latestPaidAt, row.date);
      }
      if (!group.statusKeys.includes(statusKey)) group.statusKeys.push(statusKey);
      const classType = row.classType?.trim() || "Inne";
      if (!group.classTypes.includes(classType)) group.classTypes.push(classType);
      if (!group.eventKeys.includes(row.eventKey)) group.eventKeys.push(row.eventKey);
      if (row.date > group.latestStart) group.latestStart = row.date;
      if (row.date < group.earliestStart) group.earliestStart = row.date;
    }
    for (const group of groups.values()) {
      group.worstStatusKey = getWorstStatusKey(group.statusKeys);
      group.subscriptions.sort((a, b) => b.date - a.date);
      group.classTypes.sort();
    }
    return Array.from(groups.values());
  }, [classRows]);

  const revenueThisMonth = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
    return campsRows
      .filter((r) => r.date >= start && r.date <= end)
      .reduce((acc, row) => acc + getPaidValue(row), 0);
  }, [campsRows]);

  const openCampEvents = useMemo(
    () =>
      Array.from(
        new Set(
          campsRows
            .filter((r) => r.eventType === "camp" && r.eventOpen)
            .map((r) => `${r.eventKey}::${r.eventName}`)
        )
      ),
    [campsRows]
  );
  const openSleepoverEvents = useMemo(
    () =>
      Array.from(
        new Set(
          campsRows
            .filter((r) => r.eventType === "nocowanka" && r.eventOpen)
            .map((r) => `${r.eventKey}::${r.eventName}`)
        )
      ),
    [campsRows]
  );
  const closedEvents = useMemo(
    () =>
      Array.from(
        new Set(
          campsRows
            .filter((r) => !r.eventOpen)
            .map((r) => `${r.eventKey}::${r.eventName}`)
        )
      ),
    [campsRows]
  );

  /** Every discipline used by a class in grafik (filter chips always shown). */
  const allDisciplineTypes = useMemo(() => {
    if (!classesList) return [];
    const set = new Set<string>();
    for (const c of classesList) {
      set.add(c.discipline?.trim() ? c.discipline.trim() : "Inne");
    }
    return Array.from(set).sort();
  }, [classesList]);

  const disciplinesWithEnrollments = useMemo(() => {
    const set = new Set<string>();
    for (const r of classRows) {
      set.add(r.classType?.trim() || "Inne");
    }
    return set;
  }, [classRows]);

  useEffect(() => {
    if (openCampEvents.length && selectedOpenCampKeys.length === 0) {
      setSelectedOpenCampKeys(openCampEvents.map((entry) => entry.split("::")[0]));
    }
  }, [openCampEvents, selectedOpenCampKeys.length]);

  useEffect(() => {
    if (openSleepoverEvents.length && selectedOpenSleepoverKeys.length === 0) {
      setSelectedOpenSleepoverKeys(openSleepoverEvents.map((entry) => entry.split("::")[0]));
    }
  }, [openSleepoverEvents, selectedOpenSleepoverKeys.length]);

  /** Default: only disciplines that have at least one active zapis; empty disciplines stay unchecked. */
  useEffect(() => {
    if (classesList === undefined || classRowsRaw === undefined) return;
    if (selectedClassTypes.length > 0) return;
    const next = allDisciplineTypes.filter((d) => disciplinesWithEnrollments.has(d));
    setSelectedClassTypes(next);
  }, [
    classesList,
    classRowsRaw,
    allDisciplineTypes,
    disciplinesWithEnrollments,
    selectedClassTypes.length,
  ]);

  const scopedCampRows = useMemo(() => {
    if (paymentScope !== "camps") return [] as CampsPaymentRow[];
    if (closedEventKey !== "all") {
      return campsRows.filter((r) => !r.eventOpen && r.eventKey === closedEventKey);
    }
    return campsRows.filter((r) => {
      if (!r.eventOpen || r.eventType !== openEventType) return false;
      if (openEventType === "camp") return selectedOpenCampKeys.includes(r.eventKey);
      return selectedOpenSleepoverKeys.includes(r.eventKey);
    });
  }, [
    paymentScope,
    campsRows,
    closedEventKey,
    openEventType,
    selectedOpenCampKeys,
    selectedOpenSleepoverKeys,
  ]);

  const filteredCampRows = useMemo<CampsPaymentRow[]>(() => {
    if (paymentScope !== "camps") return [];
    let list = [...scopedCampRows];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.parentName.toLowerCase().includes(q)
      );
    }
    const selectedStatuses = (Object.keys(statusSortSelection) as StatusSortKey[]).filter(
      (k) => statusSortSelection[k]
    );
    if (selectedStatuses.length > 0) {
      list = list.filter((r) => selectedStatuses.includes(getStatusSortKey(r)));
    }
    if (dateFrom) {
      const startTs = new Date(dateFrom).setHours(0, 0, 0, 0);
      list = list.filter((r) => r.date >= startTs);
    }
    if (dateTo) {
      const endTs = new Date(dateTo).setHours(23, 59, 59, 999);
      list = list.filter((r) => r.date <= endTs);
    }
    return list.sort((a, b) =>
      sortDirection === "asc" ? a.date - b.date : b.date - a.date
    );
  }, [
    paymentScope,
    scopedCampRows,
    search,
    dateFrom,
    dateTo,
    sortDirection,
    statusSortSelection,
  ]);

  const filteredClassGroups = useMemo<GroupedClassRow[]>(() => {
    if (paymentScope !== "classes") return [];
    let list = [...groupedClassRows];
    if (
      selectedClassTypes.length > 0 &&
      selectedClassTypes.length !== allDisciplineTypes.length
    ) {
      list = list.filter((g) =>
        g.classTypes.some((t) => selectedClassTypes.includes(t))
      );
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.studentName.toLowerCase().includes(q) ||
          g.parentName.toLowerCase().includes(q)
      );
    }
    const selectedStatuses = (Object.keys(statusSortSelection) as StatusSortKey[]).filter(
      (k) => statusSortSelection[k]
    );
    if (selectedStatuses.length > 0) {
      list = list.filter((g) =>
        g.statusKeys.some((k) => selectedStatuses.includes(k))
      );
    }
    if (dateFrom) {
      const startTs = new Date(dateFrom).setHours(0, 0, 0, 0);
      list = list.filter((g) => getGroupLastPaymentDate(g) >= startTs);
    }
    if (dateTo) {
      const endTs = new Date(dateTo).setHours(23, 59, 59, 999);
      list = list.filter((g) => getGroupLastPaymentDate(g) <= endTs);
    }
    return list.sort((a, b) =>
      sortDirection === "asc"
        ? getGroupLastPaymentDate(a) - getGroupLastPaymentDate(b)
        : getGroupLastPaymentDate(b) - getGroupLastPaymentDate(a)
    );
  }, [
    paymentScope,
    groupedClassRows,
    selectedClassTypes,
    allDisciplineTypes.length,
    search,
    dateFrom,
    dateTo,
    sortDirection,
    statusSortSelection,
  ]);

  const totalRowsCount =
    paymentScope === "camps" ? filteredCampRows.length : filteredClassGroups.length;

  const stats = useMemo(() => {
    let paidCount = 0;
    let unpaidCount = 0;
    let overdueCount = 0;
    if (paymentScope === "camps") {
      for (const row of filteredCampRows) {
        if (row.paymentStatus === "paid") paidCount++;
        else unpaidCount++;
        if (getDisplayStatus(row) === "overdue") overdueCount++;
      }
    } else {
      for (const group of filteredClassGroups) {
        paidCount += group.paidCount;
        unpaidCount += group.unpaidCount + group.overdueCount + group.partialCount;
        overdueCount += group.overdueCount;
      }
    }
    return { paidCount, unpaidCount, overdueCount };
  }, [paymentScope, filteredCampRows, filteredClassGroups]);

  const totalPages = Math.max(1, Math.ceil(totalRowsCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * PAGE_SIZE;
  const pageCampRows = filteredCampRows.slice(start, start + PAGE_SIZE);
  const pageClassGroups = filteredClassGroups.slice(start, start + PAGE_SIZE);

  const markClassSubscriptions = async (
    subscriptionIds: Id<"subscriptions">[],
    markPaid: boolean,
    updatingKey: string
  ) => {
    if (subscriptionIds.length === 0) return;
    setError(null);
    setClassPaymentUpdating(updatingKey);
    try {
      await setClassSubscriptionsPaymentStatus({
        subscriptionIds,
        markPaid,
      });
      setInfo(
        markPaid
          ? "Zapisano jako opłacone."
          : "Zapisano jako nieopłacone (oczekuje na płatność)."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wystąpił błąd.");
    } finally {
      setClassPaymentUpdating(null);
    }
  };

  const confirmSendClassReminder = async () => {
    if (!reminderTargetGroup) return;
    const userId = reminderTargetGroup.subscriptions[0]?.userId;
    if (!userId) {
      setError("Brak powiązania z kontem opiekuna.");
      return;
    }
    setError(null);
    setReminderSending(true);
    try {
      await sendClassPaymentReminderEmail({
        userId,
        studentName: reminderTargetGroup.studentName,
      });
      setReminderTargetGroup(null);
      setInfo(
        `Wysłano przypomnienie e-mail do: ${reminderTargetGroup.parentName}.`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wystąpił błąd.");
    } finally {
      setReminderSending(false);
    }
  };

  const setStatus = async (
    row: CampsPaymentRow,
    status: "paid" | "partial" | "unpaid",
    amountPaid?: number
  ) => {
    setError(null);
    setUpdatingRowId(row.id);
    try {
      await setPaymentStatus({
        source: row.source,
        registrationId: row.registrationId,
        paymentStatus: status,
        amountPaid,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wystąpił błąd.");
    } finally {
      setUpdatingRowId(null);
    }
  };

  const onSavePartial = async () => {
    if (!partialDialogRow) return;
    const parsed = parseFloat(partialAmount.replace(",", "."));
    if (Number.isNaN(parsed) || parsed < 0 || parsed > partialDialogRow.amount) {
      setError("Wpisz prawidłową kwotę częściowej wpłaty.");
      return;
    }
    await setStatus(partialDialogRow, "partial", parsed);
    setPartialDialogRow(null);
  };

  if (
    campsRowsRaw === undefined ||
    classRowsRaw === undefined ||
    classesList === undefined
  ) {
    return <div className="text-text-light dark:text-stone-400">Ładowanie…</div>;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <h1 className="text-2xl font-bold text-text-main dark:text-white">Zarządzanie płatnościami</h1>

      <div className="inline-flex rounded-lg border border-stone-200 bg-white p-1 dark:border-stone-700 dark:bg-stone-900/70">
        <button
          type="button"
          onClick={() => {
            setPaymentScope("camps");
            setPage(0);
          }}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium",
            paymentScope === "camps"
              ? "bg-primary text-primary-foreground"
              : "text-text-main dark:text-stone-300"
          )}
        >
          Obozy i nocowanki
        </button>
        <button
          type="button"
          onClick={() => {
            setPaymentScope("classes");
            setPage(0);
          }}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium",
            paymentScope === "classes"
              ? "bg-primary text-primary-foreground"
              : "text-text-main dark:text-stone-300"
          )}
        >
          Zajęcia
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-stone-500">Przychód (miesiąc)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-text-main dark:text-white">{formatPln(revenueThisMonth)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wide text-stone-500">Status płatności</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-8">
            <div><p className="text-xs text-amber-700">Nieopłacone</p><p className="text-2xl font-black text-amber-600">{stats.unpaidCount}</p></div>
            <div><p className="text-xs text-green-700">Opłacone</p><p className="text-2xl font-black text-green-600">{stats.paidCount}</p></div>
          </CardContent>
        </Card>
      </div>

      {paymentScope === "camps" && (
        <section className="rounded-xl border border-stone-200 bg-stone-100 p-3 dark:border-stone-700 dark:bg-stone-800/60">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={openEventType === "camp" && closedEventKey === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setOpenEventType("camp");
                setClosedEventKey("all");
                setPage(0);
              }}
            >
              Otwarte obozy ({openCampEvents.length})
            </Button>
            <Button
              type="button"
              variant={openEventType === "nocowanka" && closedEventKey === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setOpenEventType("nocowanka");
                setClosedEventKey("all");
                setPage(0);
              }}
            >
              Otwarte nocowanki ({openSleepoverEvents.length})
            </Button>
            <select
              value={closedEventKey}
              onChange={(e) => {
                setClosedEventKey(e.target.value);
                setPage(0);
              }}
              className="h-9 rounded-md border border-stone-300 bg-white px-3 text-sm dark:border-stone-600 dark:bg-stone-900"
            >
              <option value="all">Zamknięte: brak</option>
              {closedEvents.map((entry) => {
                const [key, name] = entry.split("::");
                return <option key={key} value={key}>Zamknięte: {name}</option>;
              })}
            </select>
          </div>
          {closedEventKey === "all" && openEventType === "camp" && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {openCampEvents.map((entry) => {
                const [key, name] = entry.split("::");
                const selected = selectedOpenCampKeys.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-stone-300 bg-white text-stone-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200"
                    )}
                    onClick={() =>
                      setSelectedOpenCampKeys((prev) =>
                        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                      )
                    }
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}
          {closedEventKey === "all" && openEventType === "nocowanka" && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {openSleepoverEvents.map((entry) => {
                const [key, name] = entry.split("::");
                const selected = selectedOpenSleepoverKeys.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-stone-300 bg-white text-stone-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200"
                    )}
                    onClick={() =>
                      setSelectedOpenSleepoverKeys((prev) =>
                        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                      )
                    }
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section className="rounded-xl border border-stone-200 bg-stone-100 p-3 dark:border-stone-700 dark:bg-stone-800/60">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Szukaj ucznia lub rodzica…"
            className="min-w-[16rem] flex-1"
          />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(0);
            }}
            className="w-[10.5rem]"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(0);
            }}
            className="w-[10.5rem]"
          />
          <Button
            className="ml-auto bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
            onClick={() => {
              setSearch("");
              setDateFrom("");
              setDateTo("");
              setStatusSortSelection({
                paid: false,
                partial: false,
                pending: false,
                overdue: false,
              });
              setPage(0);
            }}
          >
            Wyczyść filtry
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["overdue", "Po terminie"],
                ["pending", "Oczekujące"],
                ["partial", "Częściowo opłacone"],
                ["paid", "Opłacone"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs dark:border-stone-600 dark:bg-stone-900">
                <Checkbox
                  checked={statusSortSelection[key]}
                  onCheckedChange={(checked) =>
                                    setStatusSortSelection((prev) => {
                                      const next = { ...prev, [key]: checked === true };
                                      return next;
                                    })
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        {paymentScope === "classes" && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {allDisciplineTypes.map((type) => {
              const selected = selectedClassTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-stone-300 bg-white text-stone-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200"
                  )}
                  onClick={() =>
                    setSelectedClassTypes((prev) =>
                      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                    )
                  }
                >
                  {type}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      {info && <div className="rounded-lg bg-blue-500/10 p-3 text-sm text-blue-700 dark:text-blue-300">{info}</div>}

      <Card className="overflow-hidden border-stone-200 dark:border-stone-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {paymentScope === "camps" ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/80">
                    <th className="px-4 py-3 text-left font-bold">Uczeń / rodzic</th>
                    <th className="px-4 py-3 text-left font-bold">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1"
                        onClick={() => {
                          setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
                        }}
                      >
                        Data
                        <span className="material-symbols-outlined text-base">swap_vert</span>
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-bold">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-bold">Kwota</th>
                    <th className="px-4 py-3 text-left font-bold">Opłacone</th>
                    <th className="px-4 py-3 text-left font-bold">Do zapłaty</th>
                    <th className="px-4 py-3 text-left font-bold">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {pageCampRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-text-light dark:text-stone-400">Brak wyników.</td>
                    </tr>
                  ) : (
                    pageCampRows.map((row) => (
                      <tr key={row.id} className="border-b border-stone-100 dark:border-stone-800">
                        <td className="px-4 py-3">
                          <p className="font-medium text-text-main dark:text-white">{row.studentName}</p>
                          <p className="text-xs text-text-light dark:text-stone-400">{row.parentName}</p>
                          <p className="text-xs text-text-light dark:text-stone-500">{row.eventName}</p>
                        </td>
                        <td className="px-4 py-3">{formatDate(row.date)}</td>
                        <td className="px-4 py-3">
                          <PaymentStatusBadge row={row} />
                        </td>
                        <td className="px-4 py-3">{formatPln(row.amount)}</td>
                        <td className="px-4 py-3">{formatPln(getPaidValue(row))}</td>
                        <td className="px-4 py-3">{formatPln(getDueValue(row))}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              title="Opłacone"
                              onClick={() => setStatus(row, "paid")}
                              disabled={updatingRowId === row.id}
                            >
                              <span className="material-symbols-outlined text-base">check_circle</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              title="Częściowo opłacone"
                              onClick={() => {
                                setPartialDialogRow(row);
                                setPartialAmount(row.paymentStatus === "partial" ? String(row.amountPaid ?? "") : "");
                              }}
                              disabled={updatingRowId === row.id}
                            >
                              <span className="material-symbols-outlined text-base">payments</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              title="Nieopłacone"
                              onClick={() => setStatus(row, "unpaid")}
                              disabled={updatingRowId === row.id}
                            >
                              <span className="material-symbols-outlined text-base">money_off</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/80">
                    <th className="w-10 px-2 py-3"></th>
                    <th className="px-4 py-3 text-left font-bold">Rodzic</th>
                    <th className="px-4 py-3 text-left font-bold">Dziecko</th>
                    <th className="px-4 py-3 text-left font-bold">Zajęć w tygodniu</th>
                    <th className="px-4 py-3 text-left font-bold">Status</th>
                    <th className="px-4 py-3 text-left font-bold">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1"
                        onClick={() => {
                          setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
                        }}
                      >
                        Ostatnia płatność
                        <span className="material-symbols-outlined text-base">swap_vert</span>
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-bold">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {pageClassGroups.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-text-light dark:text-stone-400">Brak wyników.</td>
                    </tr>
                  ) : (
                    pageClassGroups.map((group) => {
                      const isExpanded = expandedGroupKeys.has(group.groupKey);
                      const canExpand =
                        group.classCount > EXPAND_SPECIAL_CASE_CLASS_COUNT ||
                        group.weeklySessionsTotal > 2;
                      const toggleExpand = () =>
                        setExpandedGroupKeys((prev) => {
                          const next = new Set(prev);
                          if (next.has(group.groupKey)) next.delete(group.groupKey);
                          else next.add(group.groupKey);
                          return next;
                        });
                      return (
                        <Fragment key={group.groupKey}>
                          <tr
                            className={cn(
                              canExpand &&
                                "cursor-pointer transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40",
                              "border-b border-stone-100 dark:border-stone-800",
                              isExpanded && "bg-stone-50/80 dark:bg-stone-800/40"
                            )}
                            onClick={canExpand ? toggleExpand : undefined}
                          >
                            <td className="px-2 py-3 text-center align-middle">
                              {canExpand ? (
                                <button
                                  type="button"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-200/70 dark:text-stone-300 dark:hover:bg-stone-700/60"
                                  aria-label={isExpanded ? "Zwiń" : "Rozwiń"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand();
                                  }}
                                >
                                  <span className="material-symbols-outlined text-base">
                                    {isExpanded ? "expand_more" : "chevron_right"}
                                  </span>
                                </button>
                              ) : (
                                <span className="text-xs text-stone-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">{group.parentName}</td>
                            <td className="px-4 py-3">{group.studentName}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-text-main dark:text-white">
                                {group.weeklySessionsTotal}
                              </p>
                              <p className="text-xs text-text-light dark:text-stone-400">
                                {group.classCount === 1
                                  ? "1 zapis"
                                  : `${group.classCount} zapisów`}
                                {" · "}
                                {group.paidCount} opłaconych
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <GroupedStatusBadge statusKey={group.worstStatusKey} />
                            </td>
                            <td className="px-4 py-3">
                              {group.latestPaidAt ? formatDate(group.latestPaidAt) : "Brak wpłaty"}
                            </td>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  title="Opłacone (wszystkie zapisy w wierszu)"
                                  disabled={
                                    classPaymentUpdating === `group:${group.groupKey}`
                                  }
                                  onClick={() =>
                                    markClassSubscriptions(
                                      group.subscriptions.map((s) => s.subscriptionId),
                                      true,
                                      `group:${group.groupKey}`
                                    )
                                  }
                                >
                                  <span className="material-symbols-outlined text-base">
                                    check_circle
                                  </span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  title="Nieopłacone (wszystkie zapisy w wierszu)"
                                  disabled={
                                    classPaymentUpdating === `group:${group.groupKey}`
                                  }
                                  onClick={() =>
                                    markClassSubscriptions(
                                      group.subscriptions.map((s) => s.subscriptionId),
                                      false,
                                      `group:${group.groupKey}`
                                    )
                                  }
                                >
                                  <span className="material-symbols-outlined text-base">
                                    money_off
                                  </span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 shrink-0 border-sky-300 text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:border-sky-700 dark:text-sky-400 dark:hover:bg-sky-950/50 dark:hover:text-sky-300"
                                  title="Wyślij przypomnienie e-mail"
                                  type="button"
                                  disabled={
                                    classPaymentUpdating === `group:${group.groupKey}`
                                  }
                                  onClick={() => setReminderTargetGroup(group)}
                                >
                                  <span className="material-symbols-outlined text-base">
                                    mail
                                  </span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {canExpand && isExpanded && (
                            <tr className="border-b border-stone-100 bg-stone-50/60 dark:border-stone-800 dark:bg-stone-800/30">
                              <td className="px-2 py-3"></td>
                              <td colSpan={6} className="px-4 py-3">
                                <div className="overflow-x-auto rounded-md border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900/60">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-stone-200 bg-stone-100/80 dark:border-stone-700 dark:bg-stone-800/60">
                                        <th className="px-3 py-2 text-left font-semibold">Typ zajęć</th>
                                        <th className="px-3 py-2 text-left font-semibold">W tygodniu</th>
                                        <th className="px-3 py-2 text-left font-semibold">Grupa</th>
                                        <th className="px-3 py-2 text-left font-semibold">Status</th>
                                        <th className="px-3 py-2 text-left font-semibold">Start</th>
                                        <th className="px-3 py-2 text-left font-semibold">Akcje</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {group.subscriptions.map((sub) => (
                                        <tr
                                          key={sub.id}
                                          className="border-b border-stone-100 last:border-0 dark:border-stone-800"
                                        >
                                          <td className="px-3 py-2">{sub.classType ?? "Inne"}</td>
                                          <td className="px-3 py-2">{sub.sessionsPerWeek}</td>
                                          <td className="px-3 py-2">{sub.eventName}</td>
                                          <td className="px-3 py-2">
                                            <PaymentStatusBadge row={sub} />
                                          </td>
                                          <td className="px-3 py-2">{formatDate(sub.date)}</td>
                                          <td className="px-3 py-2">
                                            <div className="flex items-center gap-1">
                                              <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                title="Opłacone"
                                                disabled={
                                                  classPaymentUpdating === `sub:${sub.id}`
                                                }
                                                onClick={() =>
                                                  markClassSubscriptions(
                                                    [sub.subscriptionId],
                                                    true,
                                                    `sub:${sub.id}`
                                                  )
                                                }
                                              >
                                                <span className="material-symbols-outlined text-base">
                                                  check_circle
                                                </span>
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                title="Nieopłacone"
                                                disabled={
                                                  classPaymentUpdating === `sub:${sub.id}`
                                                }
                                                onClick={() =>
                                                  markClassSubscriptions(
                                                    [sub.subscriptionId],
                                                    false,
                                                    `sub:${sub.id}`
                                                  )
                                                }
                                              >
                                                <span className="material-symbols-outlined text-base">
                                                  money_off
                                                </span>
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {totalRowsCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-light dark:text-stone-400">
            Pokazano {start + 1}–{Math.min(start + PAGE_SIZE, totalRowsCount)} z {totalRowsCount}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Poprzednia</Button>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>Następna</Button>
          </div>
        </div>
      )}

      <Dialog open={!!partialDialogRow} onOpenChange={(open) => !open && setPartialDialogRow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Częściowo opłacone</DialogTitle>
            <DialogDescription>
              {partialDialogRow ? `${partialDialogRow.studentName} · ${formatPln(partialDialogRow.amount)}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="partial-amount">Kwota opłacona (PLN)</Label>
            <Input id="partial-amount" value={partialAmount} onChange={(e) => setPartialAmount(e.target.value)} inputMode="decimal" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPartialDialogRow(null)}>Anuluj</Button>
            <Button onClick={onSavePartial} disabled={!partialDialogRow || updatingRowId === partialDialogRow.id}>
              Zapisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={reminderTargetGroup !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReminderTargetGroup(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Wysłać przypomnienie e-mail?</DialogTitle>
            <DialogDescription>
              Wiadomość o płatności za zajęcia zostanie wysłana na adres e-mail zapisany przy koncie
              opiekuna w systemie.
            </DialogDescription>
          </DialogHeader>
          {reminderTargetGroup && (
            <div className="space-y-2 text-sm text-text-light dark:text-stone-400">
              <p>
                <span className="font-medium text-text-main dark:text-stone-200">
                  {reminderTargetGroup.parentName}
                </span>
                {" · "}
                <span className="font-medium text-text-main dark:text-stone-200">
                  {reminderTargetGroup.studentName}
                </span>
              </p>
              <p>
                E-mail:{" "}
                <span className="font-mono text-text-main dark:text-stone-200">
                  {reminderTargetGroup.subscriptions[0]?.parentEmail?.trim() ||
                    "— (brak w profilu)"}
                </span>
              </p>
              {!reminderTargetGroup.subscriptions[0]?.parentEmail?.trim() && (
                <p className="text-amber-700 dark:text-amber-300">
                  Uzupełnij adres e-mail użytkownika w panelu Użytkownicy, aby móc wysłać wiadomość.
                </p>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReminderTargetGroup(null)}
              disabled={reminderSending}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              className="bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500"
              disabled={
                reminderSending ||
                !reminderTargetGroup?.subscriptions[0]?.parentEmail?.trim()
              }
              onClick={() => void confirmSendClassReminder()}
            >
              {reminderSending ? "Wysyłanie…" : "Wyślij e-mail"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
