"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
  /** Optional content rendered above the Stats section (e.g. collapsible "Szczegóły obozu") */
  slotAboveStats?: React.ReactNode;
  /** When true, long description under the title is hidden below the `sm` breakpoint (e.g. camp admin on phones). */
  hideEventDescriptionOnMobile?: boolean;
};

export function EventRegistrationsView({
  eventTitle,
  eventDescription = "",
  newRegistrationHref,
  newRegistrationOnClick,
  formQuestionsHref,
  editCampHref,
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
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
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

  const filterFieldClass =
    "min-h-11 w-full rounded-lg border-stone-200/90 bg-white text-base sm:h-10 sm:min-h-0 sm:text-sm dark:border-stone-600 dark:bg-stone-900/90";

  return (
    <div className="w-full min-w-0 space-y-5 text-left sm:space-y-6">
      {/* Breadcrumb */}
      <nav className="min-w-0 text-xs text-text-light dark:text-stone-400 sm:text-sm">
        <Link
          href="/admin/rejestracje"
          className="hover:text-primary transition-colors"
        >
          Rejestracje
        </Link>
        <span className="mx-1.5 sm:mx-2">/</span>
        <span className="break-words text-text-main dark:text-white">
          {eventTitle}
        </span>
      </nav>

      {/* Header: with camp details slot — on phones: title → szczegóły → 3 actions in one row */}
      {slotAboveStats ? (
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:grid-rows-[auto_auto] sm:items-start sm:gap-4">
          <div className="max-sm:order-1 min-w-0 sm:col-start-1 sm:row-start-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl font-bold text-text-main dark:text-white sm:text-2xl">
                {eventTitle}
              </h1>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-xs",
                  isRegistrationOpen
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                    : "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400"
                )}
              >
                {isRegistrationOpen ? "Otwarta" : "Zamknięta"}
              </span>
            </div>
            {eventDescription ? (
              <p
                className={cn(
                  "mt-1 max-w-2xl text-sm text-text-light dark:text-stone-400 sm:text-base",
                  hideEventDescriptionOnMobile && "hidden sm:block"
                )}
              >
                {eventDescription}
              </p>
            ) : null}
          </div>
          <div className="max-sm:order-3 flex w-full min-w-0 shrink-0 flex-col gap-2 sm:col-start-2 sm:row-start-1 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            <div className="grid w-full max-sm:grid-cols-3 max-sm:gap-2 sm:flex sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end sm:gap-2">
              {formQuestionsHref && (
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-11 min-w-0 touch-manipulation px-2 text-xs sm:min-h-9 sm:min-w-[10rem] sm:px-3 sm:text-sm"
                  asChild
                >
                  <Link href={formQuestionsHref} className="truncate">
                    <span className="sm:hidden">Pytania</span>
                    <span className="hidden sm:inline">Pytania formularza</span>
                  </Link>
                </Button>
              )}
              {editCampHref && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="min-h-11 min-w-0 touch-manipulation px-2 text-xs sm:min-h-9 sm:min-w-[10rem] sm:px-3 sm:text-sm"
                  asChild
                >
                  <Link href={editCampHref} className="truncate">
                    <span className="sm:hidden">Edytuj</span>
                    <span className="hidden sm:inline">Edytuj obóz</span>
                  </Link>
                </Button>
              )}
              {onToggleRegistrationOpen && (
                <Button
                  variant={isRegistrationOpen ? "destructive" : "default"}
                  size="sm"
                  className="min-h-11 min-w-0 touch-manipulation px-2 text-xs sm:min-h-9 sm:min-w-[10rem] sm:px-3 sm:text-sm"
                  onClick={onToggleRegistrationOpen}
                >
                  <span className="truncate sm:max-w-none">
                    <span className="sm:hidden">
                      {isRegistrationOpen ? "Zamknij" : "Otwórz"}
                    </span>
                    <span className="hidden sm:inline">
                      {isRegistrationOpen
                        ? "Zamknij rejestrację"
                        : "Otwórz rejestrację"}
                    </span>
                  </span>
                </Button>
              )}
            </div>
            {newRegistrationOnClick ? (
              <Button
                type="button"
                size="sm"
                className="min-h-11 w-full touch-manipulation sm:min-h-9 sm:w-auto sm:min-w-[10rem]"
                onClick={newRegistrationOnClick}
              >
                + Nowa rejestracja
              </Button>
            ) : newRegistrationHref ? (
              <Button
                asChild
                size="sm"
                className="min-h-11 w-full touch-manipulation sm:min-h-9 sm:w-auto sm:min-w-[10rem]"
              >
                <Link href={newRegistrationHref}>+ Nowa rejestracja</Link>
              </Button>
            ) : null}
          </div>
          <div className="max-sm:order-2 min-w-0 sm:col-span-2 sm:row-start-2 sm:grid sm:grid-cols-3 sm:items-stretch sm:gap-3">
            <Card className="h-full overflow-hidden rounded-xl border-stone-200 dark:border-stone-700 sm:col-span-2">
              <CardContent className="flex h-full flex-col justify-between gap-3 py-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-amber-200/70 bg-amber-50/60 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                      Oczekujące płatności
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-text-main dark:text-stone-100">
                      {pendingPaymentsCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-red-200/70 bg-red-50/60 px-3 py-2 dark:border-red-900/50 dark:bg-red-950/20">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-red-800 dark:text-red-300">
                      Brakujące formularze
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-text-main dark:text-stone-100">
                      {missingMedicalFormsCount}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-text-main dark:text-stone-300">
                    {pendingPaymentsCount > 0 || missingMedicalFormsCount > 0
                      ? "Masz zaległe zadania wymagające przypomnienia."
                      : "Wszystkie płatności i formularze są w porządku."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11 w-full shrink-0 touch-manipulation sm:min-h-9 sm:w-auto"
                    disabled={
                      pendingPaymentsCount === 0 && missingMedicalFormsCount === 0
                    }
                  >
                    Wyślij wszystkie przypomnienia
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="min-w-0 sm:col-span-1 sm:h-full [&>*]:h-full">
              {slotAboveStats}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-xl font-bold text-text-main dark:text-white sm:text-2xl">
                  {eventTitle}
                </h1>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-xs",
                    isRegistrationOpen
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                      : "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400"
                  )}
                >
                  {isRegistrationOpen ? "Otwarta" : "Zamknięta"}
                </span>
              </div>
              {eventDescription ? (
                <p
                  className={cn(
                    "mt-1 max-w-2xl text-sm text-text-light dark:text-stone-400 sm:text-base",
                    hideEventDescriptionOnMobile && "hidden sm:block"
                  )}
                >
                  {eventDescription}
                </p>
              ) : null}
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
              {formQuestionsHref && (
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-11 w-full touch-manipulation sm:min-h-9 sm:w-auto sm:min-w-[10rem]"
                  asChild
                >
                  <Link href={formQuestionsHref}>Pytania formularza</Link>
                </Button>
              )}
              {editCampHref && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="min-h-11 w-full touch-manipulation sm:min-h-9 sm:w-auto sm:min-w-[10rem]"
                  asChild
                >
                  <Link href={editCampHref}>Edytuj obóz</Link>
                </Button>
              )}
              {onToggleRegistrationOpen && (
                <Button
                  variant={isRegistrationOpen ? "destructive" : "default"}
                  size="sm"
                  className="min-h-11 w-full touch-manipulation sm:min-h-9 sm:w-auto sm:min-w-[10rem]"
                  onClick={onToggleRegistrationOpen}
                >
                  {isRegistrationOpen
                    ? "Zamknij rejestrację"
                    : "Otwórz rejestrację"}
                </Button>
              )}
              {newRegistrationOnClick ? (
                <Button
                  type="button"
                  size="sm"
                  className="min-h-11 w-full touch-manipulation sm:min-h-9 sm:w-auto sm:min-w-[10rem]"
                  onClick={newRegistrationOnClick}
                >
                  + Nowa rejestracja
                </Button>
              ) : newRegistrationHref ? (
                <Button
                  asChild
                  size="sm"
                  className="min-h-11 w-full touch-manipulation sm:min-h-9 sm:w-auto sm:min-w-[10rem]"
                >
                  <Link href={newRegistrationHref}>+ Nowa rejestracja</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </>
      )}

      {!slotAboveStats ? (
        <Card className="overflow-hidden rounded-xl border-stone-200 dark:border-stone-700">
          <CardContent className="space-y-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text-main dark:text-stone-300">
                {pendingPaymentsCount > 0 || missingMedicalFormsCount > 0
                  ? `Oczekujące płatności: ${pendingPaymentsCount} • Brakujące formularze medyczne: ${missingMedicalFormsCount}.`
                  : "Wszystkie płatności i formularze są w porządku."}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="min-h-11 w-full shrink-0 touch-manipulation sm:min-h-9 sm:w-auto"
                disabled={
                  pendingPaymentsCount === 0 && missingMedicalFormsCount === 0
                }
              >
                Wyślij wszystkie przypomnienia
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Lista uczestników — podsumowanie + filtry przyklejone do tabeli */}
      <Card className="overflow-hidden border-stone-200 dark:border-stone-700">
        <CardContent className="space-y-0 p-0 sm:p-4 sm:space-y-4">
          <div
            className={cn(
              "sm:mb-4 sm:overflow-hidden sm:rounded-xl sm:border sm:border-stone-200/80 sm:dark:border-stone-700"
            )}
          >
            <section
              className="border-b border-stone-200/80 bg-stone-100 px-3 py-4 dark:border-stone-700 dark:bg-stone-800/75"
              aria-label="Podsumowanie rejestracji"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="grid min-w-0 flex-1 grid-cols-3 gap-x-2 sm:gap-x-6">
                  <div className="min-w-0">
                    <span className="sr-only">
                      Zarejestrowanych: {totalRegistered} z {maxParticipants}
                    </span>
                    <div className="h-3.5 sm:h-4" aria-hidden />
                    <p className="mt-1 text-xl font-black tabular-nums leading-none text-text-main dark:text-white sm:text-2xl">
                      {totalRegistered} / {maxParticipants}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-green-800/90 dark:text-green-200/90">
                      Opłacone
                    </p>
                    <p className="mt-1 text-xl font-black tabular-nums leading-none text-green-600 dark:text-green-400 sm:text-2xl">
                      {paidCount}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800/90 dark:text-amber-200/90">
                      Oczekujące
                    </p>
                    <p className="mt-1 text-xl font-black tabular-nums leading-none text-amber-600 dark:text-amber-400 sm:text-2xl">
                      {pendingCount}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0 self-center text-text-main hover:bg-stone-200/80 dark:text-stone-200 dark:hover:bg-stone-700/80"
                      aria-label="Więcej akcji listy"
                    >
                      <span className="material-symbols-outlined text-[22px] leading-none">
                        more_vert
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[16rem]">
                    <DropdownMenuItem
                      className="cursor-pointer gap-2"
                      onSelect={() => handleExportPdf()}
                    >
                      <span className="material-symbols-outlined text-lg text-red-600 dark:text-red-400">
                        picture_as_pdf
                      </span>
                      Eksportuj listę (PDF)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2"
                      onSelect={() => handleExportExcel()}
                    >
                      <span className="material-symbols-outlined text-lg text-emerald-600 dark:text-emerald-400">
                        table_chart
                      </span>
                      Eksportuj listę (Excel)
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="gap-2">
                      <span className="material-symbols-outlined text-lg opacity-70">
                        mail
                      </span>
                      Wiadomość do wszystkich rodziców
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </section>
            <section
              className="border-b border-stone-200/80 bg-stone-100 px-3 py-4 dark:border-stone-700 dark:bg-stone-800/75 sm:border-b-0"
              aria-label="Filtry listy uczestników"
            >
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Filtry
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center">
                <div className="flex min-w-0 gap-2 max-sm:w-full sm:flex-1">
                  <Input
                    placeholder="Szukaj uczestnika…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                    className={cn(
                      filterFieldClass,
                      "max-sm:flex-[2] max-sm:min-w-0 sm:w-full"
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-11 min-h-11 shrink-0 touch-manipulation px-3 text-sm sm:hidden"
                    onClick={() => setMoreFiltersOpen((o) => !o)}
                    aria-expanded={moreFiltersOpen}
                  >
                    {moreFiltersOpen ? "Mniej" : "Więcej"}
                  </Button>
                </div>
                <select
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setPage(0);
                  }}
                  className={cn(
                    filterFieldClass,
                    "px-3 py-2 sm:w-auto sm:min-w-[11rem]",
                    !moreFiltersOpen && "max-sm:hidden"
                  )}
                >
                  <option value="all">Wszystkie płatności</option>
                  <option value="paid">Opłacone</option>
                  <option value="partial">Częściowo</option>
                  <option value="unpaid">Nieopłacone</option>
                </select>
                <select
                  value={medicalFilter}
                  onChange={(e) => {
                    setMedicalFilter(e.target.value);
                    setPage(0);
                  }}
                  className={cn(
                    filterFieldClass,
                    "px-3 py-2 sm:w-auto sm:min-w-[11rem]",
                    !moreFiltersOpen && "max-sm:hidden"
                  )}
                >
                  <option value="all">Wszystkie formularze</option>
                  <option value="complete">Uzupełnione</option>
                  <option value="pending">Oczekujące</option>
                </select>
              </div>
            </section>
          </div>

          <div className="px-0 sm:px-0">
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
            <div className="hidden overflow-hidden rounded-lg border border-stone-200 dark:border-stone-700 lg:block">
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
                        Płatność
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-text-main dark:text-white">
                        Zgoda
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-text-main dark:text-white">
                        Formularz medyczny
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
                                <span className="font-medium text-text-main dark:text-white">
                                  {p.childName} {p.childSurname}
                                </span>
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
        </CardContent>
      </Card>

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
