"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export type ParticipantRow = {
  _id: string;
  childName: string;
  childSurname: string;
  childDob?: string;
  paymentStatus?: "paid" | "partial" | "unpaid";
  medicalFormStatus?: "complete" | "pending";
  consent?: boolean;
  parentEmail?: string;
  parentName?: string;
  parentPhone?: string;
  dietary?: string;
  allergies?: string;
  medicalNotes?: string;
  customAnswers?: Record<string, string>;
};

function computeAge(childDob: string | undefined): number | null {
  if (!childDob) return null;
  const d = new Date(childDob);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age >= 0 ? age : null;
}

function getInitials(childName: string, childSurname: string): string {
  const a = childName?.trim().charAt(0)?.toUpperCase() ?? "";
  const b = childSurname?.trim().charAt(0)?.toUpperCase() ?? "";
  return (a + b) || "—";
}

function getPaymentLabel(status: "paid" | "partial" | "unpaid" | undefined): string {
  switch (status ?? "unpaid") {
    case "paid": return "Opłacone";
    case "partial": return "Częściowo";
    default: return "Nieopłacone";
  }
}

function getMedicalLabel(status: "complete" | "pending" | undefined): string {
  return (status ?? "pending") === "complete" ? "Uzupełniony" : "Oczekuje";
}

function paymentPillClass(payment: "paid" | "partial" | "unpaid") {
  return cn(
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
    payment === "paid" &&
      "bg-green-100 text-green-800 dark:bg-green-900/35 dark:text-green-200",
    payment === "partial" &&
      "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-200",
    payment === "unpaid" &&
      "bg-red-100 text-red-800 dark:bg-red-900/35 dark:text-red-200"
  );
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type EventRegistrationsViewProps = {
  eventTitle: string;
  eventDescription?: string;
  newRegistrationHref?: string;
  newRegistrationOnClick?: () => void;
  /** Reserved for compatibility with existing callers. */
  campSlug?: string;
  /** When set, shows button linking to form questions management (camp or nocowanka pytania page) */
  formQuestionsHref?: string;
  /** When set, shows "Edytuj obóz" button linking to camp edit page */
  editCampHref?: string;
  /** Map question id -> label for displaying custom answers in Podgląd dziecka dialog */
  customQuestionLabels?: Record<string, string>;
  participants: ParticipantRow[];
  totalRegistered: number;
  maxParticipants: number;
  paidCount: number;
  pendingCount: number;
  isRegistrationOpen?: boolean;
  onToggleRegistrationOpen?: () => void;
  pendingPaymentsCount: number;
  missingMedicalFormsCount: number;
  /** Optional panel below KPIs (e.g. camp facts). */
  slotAboveStats?: React.ReactNode;
  /** Label for the edit event button. Defaults to "Edytuj obóz". */
  editEventLabel?: string;
  /** When true, long description under the title is hidden below the `sm` breakpoint (e.g. camp admin on phones). */
  hideEventDescriptionOnMobile?: boolean;
};

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft dark:border-stone-700 dark:bg-stone-900/80">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tabular-nums tracking-tight",
          tone === "good" && "text-emerald-600 dark:text-emerald-400",
          tone === "warn" && "text-amber-600 dark:text-amber-400",
          tone === "neutral" && "text-stone-900 dark:text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export type EventFact = {
  icon: string;
  label: string;
  value: string;
};

export function EventFactsSheet({
  title,
  href,
  hrefLabel,
  facts,
}: {
  title: string;
  href: string;
  hrefLabel: string;
  facts: EventFact[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-stone-700 dark:bg-stone-900/80">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3 sm:px-5 dark:border-stone-700">
        <h2 className="text-sm font-bold text-stone-900 dark:text-white">{title}</h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          {hrefLabel}
          <span className="material-symbols-outlined text-base" aria-hidden>
            open_in_new
          </span>
        </Link>
      </div>
      <dl
        className={cn(
          "grid grid-cols-2 overflow-hidden",
          facts.length <= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        )}
      >
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex items-start gap-3 border-b border-r border-stone-200/80 px-4 py-3.5 sm:px-5 dark:border-stone-800"
          >
            <span className="risu-icon-well size-9 shrink-0" aria-hidden>
              <span className="material-symbols-outlined text-[18px]">{fact.icon}</span>
            </span>
            <div className="min-w-0">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
                {fact.label}
              </dt>
              <dd className="mt-0.5 text-sm font-semibold text-stone-900 dark:text-white">
                {fact.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ColumnFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const active = value !== "all";
  const currentLabel = options.find((option) => option.value === value)?.label ?? label;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "-ml-1 inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 text-left font-bold transition-colors hover:bg-stone-200/70 hover:text-primary dark:hover:bg-stone-700",
            active ? "text-primary" : "text-text-main dark:text-white",
          )}
          aria-label={`Filtr: ${label}`}
        >
          {active ? currentLabel : label}
          <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden>
            expand_more
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} collisionPadding={12} className="min-w-44">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className="cursor-pointer"
            onSelect={() => onChange(option.value)}
          >
            {option.label}
            {value === option.value ? (
              <span className="material-symbols-outlined ml-auto text-base" aria-hidden>
                check
              </span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const headerActionClass =
  "inline-flex h-9 items-center gap-1.5 whitespace-nowrap px-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800 dark:focus-visible:bg-stone-800";

const PAYMENT_FILTERS = [
  { value: "all", label: "Wszystkie" },
  { value: "paid", label: "Opłacone" },
  { value: "partial", label: "Częściowo" },
  { value: "unpaid", label: "Nieopłacone" },
];

const MEDICAL_FILTERS = [
  { value: "all", label: "Wszystkie" },
  { value: "complete", label: "Uzupełnione" },
  { value: "pending", label: "Oczekujące" },
];

export function EventRegistrationsView({
  eventTitle,
  eventDescription = "",
  newRegistrationHref,
  newRegistrationOnClick,
  formQuestionsHref,
  editCampHref,
  editEventLabel = "Edytuj obóz",
  customQuestionLabels,
  participants,
  totalRegistered,
  maxParticipants,
  paidCount,
  pendingCount,
  isRegistrationOpen = true,
  onToggleRegistrationOpen,
  pendingPaymentsCount,
  missingMedicalFormsCount,
  slotAboveStats,
  hideEventDescriptionOnMobile = false,
}: EventRegistrationsViewProps) {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [medicalFilter, setMedicalFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [viewingParticipant, setViewingParticipant] = useState<ParticipantRow | null>(null);

  const filtered = useMemo(() => {
    let list = participants;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          `${p.childName} ${p.childSurname}`.toLowerCase().includes(q) ||
          p.parentEmail?.toLowerCase().includes(q)
      );
    }
    if (paymentFilter !== "all") {
      list = list.filter((p) => (p.paymentStatus ?? "unpaid") === paymentFilter);
    }
    if (medicalFilter !== "all") {
      list = list.filter(
        (p) => (p.medicalFormStatus ?? "pending") === medicalFilter
      );
    }
    return list;
  }, [participants, search, paymentFilter, medicalFilter]);

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, Math.max(0, totalPages - 1));
  const start = currentPage * PAGE_SIZE;
  const pageParticipants = filtered.slice(start, start + PAGE_SIZE);
  const displayStart = currentPage * PAGE_SIZE;
  const displayEnd = Math.min(displayStart + PAGE_SIZE, totalFiltered);

  const handleExportPdf = () => {
    const rows = filtered.map((p) => {
      const age = computeAge(p.childDob);
      return [
        `${p.childName} ${p.childSurname}`.trim(),
        age != null ? String(age) : "—",
        getPaymentLabel(p.paymentStatus),
        getMedicalLabel(p.medicalFormStatus),
        p.consent ? "Tak" : "Nie",
        p.parentEmail ?? "",
      ];
    });
    const headers = ["Uczestnik", "Wiek", "Płatność", "Formularz medyczny", "Zgoda", "E-mail rodzica"];
    const tableRows = rows.map(
      (row) =>
        `<tr>${row.map((cell) => `<td style="padding:6px 10px;border:1px solid #e5e7eb;">${escapeHtml(String(cell))}</td>`).join("")}</tr>`
    ).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lista uczestników – ${escapeHtml(eventTitle)}</title><style>body{font-family:system-ui,sans-serif;padding:20px;} table{border-collapse:collapse;width:100%;} th{text-align:left;padding:8px 10px;border:1px solid #e5e7eb;background:#f9fafb;} @media print{body{padding:0;}}</style></head><body><h1>${escapeHtml(eventTitle)}</h1><p>Lista uczestników (${filtered.length})</p><table><thead><tr>${headers.map((h) => `<th style="padding:8px 10px;border:1px solid #e5e7eb;">${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table></body></html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      requestAnimationFrame(() => {
        win.print();
        win.close();
      });
    }
  };

  const handleExportExcel = () => {
    const headers = ["Uczestnik", "Wiek", "Płatność", "Formularz medyczny", "Zgoda", "E-mail rodzica"];
    const rows = filtered.map((p) => {
      const age = computeAge(p.childDob);
      return [
        `${p.childName} ${p.childSurname}`.trim(),
        age != null ? String(age) : "—",
        getPaymentLabel(p.paymentStatus),
        getMedicalLabel(p.medicalFormStatus),
        p.consent ? "Tak" : "Nie",
        p.parentEmail ?? "",
      ];
    });
    const csvContent = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uczestnicy-${eventTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const needsAttention = pendingPaymentsCount > 0 || missingMedicalFormsCount > 0;
  const hasHeaderActions = Boolean(
    formQuestionsHref || editCampHref || onToggleRegistrationOpen,
  );

  return (
    <div className="w-full min-w-0 max-w-5xl space-y-6 text-left">
      <nav className="text-sm text-stone-500 dark:text-stone-400">
        <Link
          href="/admin/rejestracje"
          className="font-medium transition-colors hover:text-primary"
        >
          Rejestracje
        </Link>
        <span className="mx-2 text-stone-300 dark:text-stone-600">/</span>
        <span className="font-medium text-stone-900 dark:text-white">{eventTitle}</span>
      </nav>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white md:text-3xl">
              {eventTitle}
            </h1>
            <span
              className={cn(
                "inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                isRegistrationOpen
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400",
              )}
            >
              {isRegistrationOpen ? "Otwarta" : "Zamknięta"}
            </span>
          </div>
          {eventDescription ? (
            <p
              className={cn(
                "mt-2 max-w-2xl text-sm leading-relaxed text-stone-500 dark:text-stone-400",
                hideEventDescriptionOnMobile && "hidden sm:block",
              )}
            >
              {eventDescription}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {hasHeaderActions ? (
            <div className="inline-flex divide-x divide-stone-200 overflow-hidden rounded-lg border border-stone-200 dark:divide-stone-700 dark:border-stone-700">
              {formQuestionsHref ? (
                <Link
                  href={formQuestionsHref}
                  className={headerActionClass}
                  title="Pytania w formularzu"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden>
                    quiz
                  </span>
                  Pytania
                </Link>
              ) : null}
              {editCampHref ? (
                <Link
                  href={editCampHref}
                  className={headerActionClass}
                  title={editEventLabel}
                  aria-label={editEventLabel}
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden>
                    edit
                  </span>
                  Edytuj
                </Link>
              ) : null}
              {onToggleRegistrationOpen ? (
                <button
                  type="button"
                  onClick={onToggleRegistrationOpen}
                  className={cn(
                    headerActionClass,
                    isRegistrationOpen &&
                      "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40",
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden>
                    {isRegistrationOpen ? "lock" : "lock_open"}
                  </span>
                  {isRegistrationOpen ? "Zamknij" : "Otwórz"}
                </button>
              ) : null}
            </div>
          ) : null}
          {newRegistrationOnClick ? (
            <Button
              size="sm"
              className="h-9 rounded-lg px-3 text-sm font-semibold"
              onClick={newRegistrationOnClick}
            >
              Nowa rejestracja
            </Button>
          ) : newRegistrationHref ? (
            <Button size="sm" className="h-9 rounded-lg px-3 text-sm font-semibold" asChild>
              <Link href={newRegistrationHref}>Nowa rejestracja</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Zapisanych"
          value={`${totalRegistered} / ${maxParticipants}`}
        />
        <StatCard label="Opłacone" value={String(paidCount)} tone="good" />
        <StatCard label="Oczekujące" value={String(pendingCount)} tone="warn" />
        <StatCard
          label="Brak form."
          value={String(missingMedicalFormsCount)}
          tone={missingMedicalFormsCount > 0 ? "warn" : "good"}
        />
      </div>

      {needsAttention ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/40 dark:bg-amber-950/20">
          <p className="text-sm text-stone-800 dark:text-amber-100">
            {pendingPaymentsCount} {pendingPaymentsCount === 1 ? "oczekująca płatność" : "oczekujących płatności"}
            <span className="mx-1.5 text-stone-400">·</span>
            {missingMedicalFormsCount} {missingMedicalFormsCount === 1 ? "brakujący formularz" : "brakujących formularzy"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0 rounded-lg border-amber-300/80 bg-white text-sm font-semibold dark:border-amber-800 dark:bg-stone-900"
          >
            Wyślij przypomnienia
          </Button>
        </div>
      ) : null}

      {slotAboveStats}

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-stone-700 dark:bg-stone-900/80">
        <div className="flex flex-col gap-3 border-b border-stone-200 px-4 py-3 dark:border-stone-700 sm:flex-row sm:items-center sm:gap-3 sm:px-5">
          <div className="min-w-0 shrink-0">
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Uczestnicy
            </h2>
            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
              {totalFiltered} na liście
            </p>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:justify-end">
            <Input
              placeholder="Szukaj…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              aria-label="Szukaj uczestnika"
              className="h-9 min-h-9 w-full rounded-lg border-stone-200 bg-white text-sm dark:border-stone-600 dark:bg-stone-900 sm:max-w-56"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 rounded-lg px-3 text-sm font-semibold"
                  aria-label="Eksport listy"
                >
                  <span className="material-symbols-outlined mr-1.5 text-[18px]">
                    download
                  </span>
                  Eksport
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onSelect={() => handleExportPdf()}
                >
                  <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                  Lista PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onSelect={() => handleExportExcel()}
                >
                  <span className="material-symbols-outlined text-lg">table_chart</span>
                  Lista Excel
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="gap-2">
                  <span className="material-symbols-outlined text-lg">mail</span>
                  Wiadomość do rodziców
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-stone-200 px-4 py-2 lg:hidden dark:border-stone-700"
          aria-label="Filtry listy uczestników"
        >
          <ColumnFilter
            label="Płatność"
            value={paymentFilter}
            options={PAYMENT_FILTERS}
            onChange={(value) => {
              setPaymentFilter(value);
              setPage(0);
            }}
          />
          <ColumnFilter
            label="Formularz"
            value={medicalFilter}
            options={MEDICAL_FILTERS}
            onChange={(value) => {
              setMedicalFilter(value);
              setPage(0);
            }}
          />
        </div>

            {/* Mobile */}
            <div className="lg:hidden">
              {pageParticipants.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-text-light dark:text-stone-400">
                  {participants.length === 0
                    ? "Brak uczestników."
                    : "Brak wyników dla wybranych filtrów."}
                </div>
              ) : (
                <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                  {pageParticipants.map((p) => {
                    const age = computeAge(p.childDob);
                    const payment = p.paymentStatus ?? "unpaid";
                    const medical = p.medicalFormStatus ?? "pending";
                    return (
                      <li key={p._id} className="px-3 py-4 text-left sm:px-4">
                        <div className="flex gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-2xl text-sm font-bold",
                              "bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary-foreground"
                            )}
                            aria-hidden
                          >
                            {getInitials(p.childName, p.childSurname)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-bold leading-snug text-text-main dark:text-white">
                                  {p.childName} {p.childSurname}
                                </p>
                                <p className="text-sm text-text-light dark:text-stone-400">
                                  Wiek:{" "}
                                  <span className="font-medium text-text-main dark:text-stone-300">
                                    {age != null ? `${age} lat` : "—"}
                                  </span>
                                </p>
                              </div>
                              <span
                                className={cn(
                                  "shrink-0 self-start",
                                  paymentPillClass(payment)
                                )}
                              >
                                {payment === "paid"
                                  ? "Opłacone"
                                  : payment === "partial"
                                    ? "Częściowo"
                                    : "Nieopłacone"}
                              </span>
                            </div>
                            {p.parentEmail ? (
                              <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                                {p.parentEmail}
                              </p>
                            ) : null}

                            <div className="mt-2 flex min-w-0 items-center justify-between gap-2">
                              <p className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] leading-tight text-text-main dark:text-stone-200">
                                <span className="text-stone-500 dark:text-stone-400">
                                  Zgoda
                                </span>
                                <span className="font-medium text-text-main dark:text-white">
                                  {p.consent ? "Tak" : "Nie"}
                                </span>
                                <span
                                  className="text-stone-300 dark:text-stone-600"
                                  aria-hidden
                                >
                                  ·
                                </span>
                                <span className="text-stone-500 dark:text-stone-400">
                                  Formularz
                                </span>
                                <span className="font-medium text-text-main dark:text-white">
                                  {getMedicalLabel(medical)}
                                </span>
                              </p>
                              <div className="flex shrink-0 gap-0.5">
                                <button
                                  type="button"
                                  className="touch-manipulation rounded-xl p-2 text-text-main hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                  title="Podgląd"
                                  aria-label="Podgląd"
                                  onClick={() => setViewingParticipant(p)}
                                >
                                  <span className="material-symbols-outlined text-xl">
                                    visibility
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  className="touch-manipulation rounded-xl p-2 text-text-main hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                  title="Wyślij wiadomość"
                                  aria-label="Wyślij wiadomość"
                                >
                                  <span className="material-symbols-outlined text-xl">
                                    mail
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {totalFiltered > 0 ? (
                <div className="flex flex-col gap-3 border-t border-stone-200 px-3 py-4 text-sm dark:border-stone-700 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                  <p className="text-center text-text-light dark:text-stone-400 sm:text-left">
                    Pokazano{" "}
                    <span className="font-semibold text-text-main dark:text-stone-200">
                      {displayStart + 1}–{displayEnd}
                    </span>{" "}
                    z{" "}
                    <span className="font-semibold text-text-main dark:text-stone-200">
                      {totalFiltered}
                    </span>{" "}
                    uczestników
                  </p>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11 flex-1 touch-manipulation sm:min-h-9 sm:flex-none"
                      disabled={currentPage === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      Poprzednia
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11 flex-1 touch-manipulation sm:min-h-9 sm:flex-none"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                    >
                      Następna
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Desktop */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/80">
                      <th className="px-4 py-3 text-left font-bold text-text-main dark:text-white">
                        Uczestnik
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-text-main dark:text-white">
                        Wiek
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-text-main dark:text-white">
                        <ColumnFilter
                          label="Płatność"
                          value={paymentFilter}
                          options={PAYMENT_FILTERS}
                          onChange={(value) => {
                            setPaymentFilter(value);
                            setPage(0);
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-text-main dark:text-white">
                        Zgoda
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-text-main dark:text-white">
                        <ColumnFilter
                          label="Formularz medyczny"
                          value={medicalFilter}
                          options={MEDICAL_FILTERS}
                          onChange={(value) => {
                            setMedicalFilter(value);
                            setPage(0);
                          }}
                        />
                      </th>
                      <th className="w-24 px-4 py-3 text-left font-bold text-text-main dark:text-white">
                        Akcje
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageParticipants.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-text-light dark:text-stone-400"
                        >
                          {participants.length === 0
                            ? "Brak uczestników."
                            : "Brak wyników dla wybranych filtrów."}
                        </td>
                      </tr>
                    ) : (
                      pageParticipants.map((p) => {
                        const age = computeAge(p.childDob);
                        const payment = p.paymentStatus ?? "unpaid";
                        const medical = p.medicalFormStatus ?? "pending";
                        return (
                          <tr
                            key={p._id}
                            className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50/50 dark:hover:bg-stone-800/30"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                                    "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-foreground"
                                  )}
                                >
                                  {getInitials(p.childName, p.childSurname)}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-medium text-text-main dark:text-white">
                                    {p.childName} {p.childSurname}
                                  </span>
                                  {p.parentEmail ? (
                                    <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                                      {p.parentEmail}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-text-main dark:text-stone-300">
                              {age != null ? age : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span className={paymentPillClass(payment)}>
                                {payment === "paid"
                                  ? "Opłacone"
                                  : payment === "partial"
                                    ? "Częściowo"
                                    : "Nieopłacone"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-text-main dark:text-stone-300">
                              {p.consent ? "Tak" : "Nie"}
                            </td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1.5">
                                {medical === "complete" ? (
                                  <>
                                    <span
                                      className="material-symbols-outlined text-lg text-green-600 dark:text-green-400"
                                      aria-hidden
                                    >
                                      check_circle
                                    </span>
                                    <span className="text-text-main dark:text-stone-300">
                                      Uzupełniony
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span
                                      className="material-symbols-outlined text-lg text-amber-600 dark:text-amber-400"
                                      aria-hidden
                                    >
                                      schedule
                                    </span>
                                    <span className="text-text-main dark:text-stone-300">
                                      Oczekuje
                                    </span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  className="rounded-lg p-2 text-text-main hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                  title="Podgląd"
                                  aria-label="Podgląd"
                                  onClick={() => setViewingParticipant(p)}
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    visibility
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  className="rounded-lg p-2 text-text-main hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                  title="Wyślij wiadomość"
                                  aria-label="Wyślij wiadomość"
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    mail
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {totalFiltered > 0 ? (
                <div className="flex flex-col gap-3 border-t border-stone-200 bg-stone-50/80 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-800/40 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-center text-text-light dark:text-stone-400 sm:text-left">
                    Pokazano{" "}
                    <span className="font-semibold text-text-main dark:text-stone-200">
                      {displayStart + 1}–{displayEnd}
                    </span>{" "}
                    z{" "}
                    <span className="font-semibold text-text-main dark:text-stone-200">
                      {totalFiltered}
                    </span>{" "}
                    uczestników
                  </p>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11 flex-1 touch-manipulation sm:min-h-9 sm:flex-none"
                      disabled={currentPage === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      Poprzednia
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11 flex-1 touch-manipulation sm:min-h-9 sm:flex-none"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                    >
                      Następna
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
      </div>

      {/* Podgląd dziecka dialog */}
      <Dialog
        open={!!viewingParticipant}
        onOpenChange={(open) => !open && setViewingParticipant(null)}
      >
        <DialogContent className="sm:max-w-lg border-stone-200 dark:border-stone-700 bg-card text-card-foreground">
          <DialogHeader className="flex flex-row items-center justify-between gap-3 space-y-0 text-left">
            <DialogTitle className="text-xl font-bold text-text-main dark:text-white">
              Podgląd dziecka
            </DialogTitle>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full text-text-main hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                aria-label="Zamknij"
              >
                <span className="material-symbols-outlined text-xl leading-none">
                  close
                </span>
              </Button>
            </DialogClose>
          </DialogHeader>
          {viewingParticipant && (
            <div className="space-y-5 pt-1">
              {/* Participant header – matches table row style */}
              <div className="flex items-center gap-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 px-4 py-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm"
                  aria-hidden
                >
                  {getInitials(viewingParticipant.childName, viewingParticipant.childSurname)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-text-main dark:text-white truncate">
                    {viewingParticipant.childName} {viewingParticipant.childSurname}
                  </p>
                  {viewingParticipant.parentName && (
                    <p className="text-sm text-text-light dark:text-stone-400 truncate">
                      {viewingParticipant.parentName}
                    </p>
                  )}
                </div>
              </div>

              {/* Dane dziecka */}
              <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 p-4">
                <h4 className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide mb-3">
                  Dane dziecka
                </h4>
                <dl className="grid gap-3 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-light dark:text-stone-400 text-xs">Imię i nazwisko</dt>
                    <dd className="font-medium text-text-main dark:text-white">
                      {viewingParticipant.childName} {viewingParticipant.childSurname}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-light dark:text-stone-400 text-xs">Data urodzenia / wiek</dt>
                    <dd className="text-text-main dark:text-stone-300">
                      {viewingParticipant.childDob ?? "—"}
                      {computeAge(viewingParticipant.childDob) != null && (
                        <span className="ml-2 text-text-light dark:text-stone-400">
                          ({computeAge(viewingParticipant.childDob)} lat)
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-light dark:text-stone-400 text-xs">Dieta</dt>
                    <dd className="text-text-main dark:text-stone-300">{viewingParticipant.dietary ?? "—"}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-light dark:text-stone-400 text-xs">Alergie</dt>
                    <dd className="text-text-main dark:text-stone-300">{viewingParticipant.allergies ?? "—"}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-light dark:text-stone-400 text-xs">Uwagi medyczne</dt>
                    <dd className="text-text-main dark:text-stone-300">{viewingParticipant.medicalNotes ?? "—"}</dd>
                  </div>
                </dl>
              </div>

              {/* Kontakt do opiekuna */}
              <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 p-4">
                <h4 className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide mb-3">
                  Kontakt do opiekuna
                </h4>
                <dl className="grid gap-3 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-light dark:text-stone-400 text-xs">Imię i nazwisko</dt>
                    <dd className="text-text-main dark:text-stone-300">{viewingParticipant.parentName ?? "—"}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-light dark:text-stone-400 text-xs">E-mail</dt>
                    <dd className="text-text-main dark:text-stone-300 break-all">{viewingParticipant.parentEmail ?? "—"}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-light dark:text-stone-400 text-xs">Telefon</dt>
                    <dd className="text-text-main dark:text-stone-300">{viewingParticipant.parentPhone ?? "—"}</dd>
                  </div>
                </dl>
              </div>

              {/* Status */}
              <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 p-4">
                <h4 className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide mb-3">
                  Status
                </h4>
                <dl className="grid gap-3 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-light dark:text-stone-400 text-xs">Płatność</dt>
                    <dd className="text-text-main dark:text-stone-300">
                      {getPaymentLabel(viewingParticipant.paymentStatus)}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-light dark:text-stone-400 text-xs">Formularz medyczny</dt>
                    <dd className="text-text-main dark:text-stone-300">
                      {getMedicalLabel(viewingParticipant.medicalFormStatus)}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-text-light dark:text-stone-400 text-xs">Zgoda</dt>
                    <dd className="text-text-main dark:text-stone-300">
                      {viewingParticipant.consent ? "Tak" : "Nie"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Dodatkowe odpowiedzi (custom form questions) */}
              {viewingParticipant.customAnswers && Object.keys(viewingParticipant.customAnswers).length > 0 && (
                <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 p-4">
                  <h4 className="text-xs font-medium text-text-light dark:text-stone-400 uppercase tracking-wide mb-3">
                    Dodatkowe odpowiedzi
                  </h4>
                  <dl className="grid gap-3 text-sm">
                    {Object.entries(viewingParticipant.customAnswers).map(([questionId, value]) => (
                      <div key={questionId} className="flex flex-col gap-0.5">
                        <dt className="text-text-light dark:text-stone-400 text-xs">
                          {customQuestionLabels?.[questionId] ?? questionId}
                        </dt>
                        <dd className="text-text-main dark:text-stone-300">
                          {value || "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
