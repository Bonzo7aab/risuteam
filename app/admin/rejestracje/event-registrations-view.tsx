"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export type ParticipantRow = {
  _id: string;
  childName: string;
  childSurname: string;
  childDob?: string;
  paymentStatus?: "paid" | "partial" | "unpaid";
  amountPaid?: number;
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

function ActionTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" className="border-stone-200 bg-stone-900 text-white dark:border-stone-700 dark:bg-stone-100 dark:text-stone-900">
        {label}
      </TooltipContent>
    </Tooltip>
  );
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

function formatPln(amount: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(amount);
}

function paidAmountFor(
  status: "paid" | "partial" | "unpaid" | undefined,
  amountDue: number,
  amountPaid?: number,
): number {
  if ((status ?? "unpaid") === "paid") return amountDue;
  if ((status ?? "unpaid") === "partial") return amountPaid ?? 0;
  return 0;
}

function hasMedicalAnswers(participant: {
  dietary?: string;
  allergies?: string;
  medicalNotes?: string;
}): boolean {
  return Boolean(
    participant.dietary?.trim() ||
      participant.allergies?.trim() ||
      participant.medicalNotes?.trim(),
  );
}

function getEffectiveMedicalStatus(
  participant: Pick<
    ParticipantRow,
    "medicalFormStatus" | "dietary" | "allergies" | "medicalNotes"
  >,
): "complete" | "pending" {
  if (participant.medicalFormStatus === "complete") return "complete";
  if (participant.medicalFormStatus === "pending") {
    return hasMedicalAnswers(participant) ? "complete" : "pending";
  }
  return hasMedicalAnswers(participant) ? "complete" : "pending";
}

function getMedicalLabel(status: "complete" | "pending" | undefined): string {
  return (status ?? "pending") === "complete" ? "Uzupełniony" : "Oczekuje";
}

function paymentPillClass(payment: "paid" | "partial" | "unpaid") {
  return cn(
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
    payment === "paid" &&
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/25",
    payment === "partial" &&
      "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/25",
    payment === "unpaid" &&
      "bg-rose-50 text-rose-700 ring-1 ring-rose-200/80 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/25",
  );
}

function paymentActionButtonClass(selected: boolean) {
  return cn(
    "h-auto flex-col gap-1 py-3 shadow-none",
    selected
      ? "border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary dark:bg-primary/15 dark:hover:bg-primary/20"
      : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-white/12 dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10",
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
  /** Enables inline payment actions for camp or nocowanka registrations */
  paymentSource?: "camp" | "nocowanka";
  /** Event due amount in PLN (used in payment dialog) */
  eventAmount?: number;
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
  /** Public event page path or absolute URL used in reminder CTA */
  eventPublicHref?: string;
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
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft dark:border-white/12 dark:bg-surface-dark">
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
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-white/12 dark:bg-surface-dark">
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
  paymentSource,
  eventAmount = 0,
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
  eventPublicHref,
}: EventRegistrationsViewProps) {
  const setPaymentStatus = useMutation(api.payments.setRegistrationPaymentStatus);
  const sendParentMessage = useAction(api.adminEmails.sendParentMessage);
  const sendParentRemindersBulk = useAction(
    api.adminEmails.sendParentRemindersBulk,
  );
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [medicalFilter, setMedicalFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [viewingParticipant, setViewingParticipant] = useState<ParticipantRow | null>(null);
  const [medicalParticipant, setMedicalParticipant] = useState<ParticipantRow | null>(null);
  const [paymentParticipantId, setPaymentParticipantId] = useState<string | null>(null);
  const [messageParticipant, setMessageParticipant] = useState<ParticipantRow | null>(null);
  const [messageMode, setMessageMode] = useState<
    "choose" | "reminder" | "payment" | "custom"
  >("choose");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messageInfo, setMessageInfo] = useState<string | null>(null);
  const [bulkRemindOpen, setBulkRemindOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<"choose" | "reminder" | "payment">(
    "choose",
  );
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkInfo, setBulkInfo] = useState<string | null>(null);
  const [partialAmount, setPartialAmount] = useState("");
  const [showPartialInput, setShowPartialInput] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<"paid" | "partial" | "unpaid">(
    "unpaid",
  );
  const [paymentUpdating, setPaymentUpdating] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const paymentParticipant = useMemo(
    () =>
      paymentParticipantId
        ? participants.find((p) => p._id === paymentParticipantId) ?? null
        : null,
    [participants, paymentParticipantId],
  );

  useEffect(() => {
    if (!paymentParticipantId) {
      setShowPartialInput(false);
      setPartialAmount("");
      setPaymentError(null);
      setPaymentIntent("unpaid");
      return;
    }
    const participant = participants.find((p) => p._id === paymentParticipantId);
    const status = participant?.paymentStatus ?? "unpaid";
    setPaymentIntent(status);
    if (status === "partial") {
      setShowPartialInput(true);
      setPartialAmount(String(participant?.amountPaid ?? ""));
    } else {
      setShowPartialInput(false);
      setPartialAmount("");
    }
    setPaymentError(null);
    // Only re-init when opening a different registration, not on live payment updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentParticipantId]);

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
        (p) => getEffectiveMedicalStatus(p) === medicalFilter,
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
        getMedicalLabel(getEffectiveMedicalStatus(p)),
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
        getMedicalLabel(getEffectiveMedicalStatus(p)),
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

  const openPaymentDialog = (participant: ParticipantRow) => {
    if (!paymentSource) return;
    setPaymentParticipantId(participant._id);
  };

  const absoluteEventUrl = useMemo(() => {
    if (!eventPublicHref?.trim()) return undefined;
    if (/^https?:\/\//i.test(eventPublicHref)) return eventPublicHref.trim();
    if (typeof window === "undefined") return eventPublicHref.trim();
    return `${window.location.origin}${eventPublicHref.startsWith("/") ? "" : "/"}${eventPublicHref}`;
  }, [eventPublicHref]);

  const openMessageDialog = (participant: ParticipantRow) => {
    setMessageParticipant(participant);
    setMessageMode("choose");
    setCustomSubject(`Wiadomość: ${eventTitle}`);
    setCustomBody("");
    setMessageError(null);
    setMessageInfo(null);
  };

  const closeMessageDialog = () => {
    setMessageParticipant(null);
    setMessageMode("choose");
    setMessageError(null);
    setMessageSending(false);
  };

  const childFullName = (p: ParticipantRow) =>
    `${p.childName} ${p.childSurname}`.trim();

  const messageAmountDue = eventAmount;
  const messageAmountPaid = messageParticipant
    ? paidAmountFor(
        messageParticipant.paymentStatus,
        eventAmount,
        messageParticipant.amountPaid,
      )
    : 0;
  const messageAmountMissing = Math.max(
    0,
    messageAmountDue - messageAmountPaid,
  );

  const sendSingularMessage = async () => {
    if (!messageParticipant) return;
    const to = messageParticipant.parentEmail?.trim();
    if (!to) {
      setMessageError("Brak adresu e-mail opiekuna.");
      return;
    }
    if (messageMode === "choose") return;
    setMessageSending(true);
    setMessageError(null);
    setMessageInfo(null);
    try {
      if (messageMode === "reminder") {
        await sendParentMessage({
          to,
          parentName: messageParticipant.parentName,
          childName: childFullName(messageParticipant),
          eventTitle,
          eventUrl: absoluteEventUrl,
          mode: "reminder",
        });
        setMessageInfo(`Wysłano przypomnienie na ${to}.`);
      } else if (messageMode === "payment") {
        await sendParentMessage({
          to,
          parentName: messageParticipant.parentName,
          childName: childFullName(messageParticipant),
          eventTitle,
          eventUrl: absoluteEventUrl,
          mode: "payment",
          amountDuePln: messageAmountDue,
          amountPaidPln: messageAmountPaid,
          amountMissingPln: messageAmountMissing,
        });
        setMessageInfo(`Wysłano przypomnienie o płatności na ${to}.`);
      } else {
        await sendParentMessage({
          to,
          parentName: messageParticipant.parentName,
          childName: childFullName(messageParticipant),
          eventTitle,
          eventUrl: absoluteEventUrl,
          mode: "custom",
          subject: customSubject,
          body: customBody,
        });
        setMessageInfo(`Wysłano wiadomość na ${to}.`);
      }
      setMessageMode("choose");
    } catch (e) {
      setMessageError(
        e instanceof Error ? e.message : "Nie udało się wysłać wiadomości.",
      );
    } finally {
      setMessageSending(false);
    }
  };

  const bulkEventRecipients = useMemo(() => {
    const seen = new Set<string>();
    const list: {
      to: string;
      parentName?: string;
      childName?: string;
    }[] = [];
    for (const p of filtered) {
      const to = p.parentEmail?.trim().toLowerCase();
      if (!to || seen.has(to)) continue;
      seen.add(to);
      list.push({
        to,
        parentName: p.parentName,
        childName: childFullName(p),
      });
    }
    return list;
  }, [filtered]);

  const bulkPaymentRecipients = useMemo(() => {
    const list: {
      to: string;
      parentName?: string;
      childName?: string;
      amountDuePln: number;
      amountPaidPln: number;
      amountMissingPln: number;
    }[] = [];
    for (const p of participants) {
      const to = p.parentEmail?.trim().toLowerCase();
      if (!to) continue;
      const paid = paidAmountFor(p.paymentStatus, eventAmount, p.amountPaid);
      const missing = Math.max(0, eventAmount - paid);
      if (missing <= 0) continue;
      list.push({
        to,
        parentName: p.parentName,
        childName: childFullName(p),
        amountDuePln: eventAmount,
        amountPaidPln: paid,
        amountMissingPln: missing,
      });
    }
    return list;
  }, [participants, eventAmount]);

  const bulkPaymentTotalMissing = useMemo(
    () =>
      bulkPaymentRecipients.reduce(
        (sum, r) => sum + r.amountMissingPln,
        0,
      ),
    [bulkPaymentRecipients],
  );

  const openBulkDialog = (mode: "choose" | "reminder" | "payment" = "choose") => {
    setBulkMode(mode);
    setBulkError(null);
    setBulkInfo(null);
    setBulkRemindOpen(true);
  };

  const closeBulkDialog = () => {
    setBulkRemindOpen(false);
    setBulkMode("choose");
    setBulkError(null);
    setBulkSending(false);
  };

  const sendBulkReminders = async (mode: "reminder" | "payment") => {
    const recipients =
      mode === "payment" ? bulkPaymentRecipients : bulkEventRecipients;
    if (recipients.length === 0) return;
    setBulkSending(true);
    setBulkError(null);
    setBulkInfo(null);
    try {
      const result = await sendParentRemindersBulk({
        recipients,
        eventTitle,
        eventUrl: absoluteEventUrl,
        mode,
      });
      setBulkInfo(
        `Wysłano: ${result.sent}. Pominięto: ${result.skipped}. Błędy: ${result.failed}.`,
      );
      setBulkMode("choose");
    } catch (e) {
      setBulkError(
        e instanceof Error ? e.message : "Nie udało się wysłać przypomnień.",
      );
    } finally {
      setBulkSending(false);
    }
  };

  const savedPaymentStatus = paymentParticipant?.paymentStatus ?? "unpaid";
  const savedAmountPaid = paymentParticipant?.amountPaid ?? 0;

  const paymentDraftDirty = (() => {
    if (!paymentParticipant) return false;
    if (paymentIntent !== savedPaymentStatus) return true;
    if (paymentIntent === "partial") {
      const parsed = parseFloat(partialAmount.replace(",", "."));
      if (Number.isNaN(parsed)) return true;
      return parsed !== savedAmountPaid;
    }
    return false;
  })();

  const savePaymentStatus = async () => {
    if (!paymentParticipant || !paymentSource) return;
    setPaymentError(null);

    let amountPaid: number | undefined;
    if (paymentIntent === "partial") {
      const parsed = parseFloat(partialAmount.replace(",", "."));
      if (Number.isNaN(parsed) || parsed < 0 || parsed > eventAmount) {
        setPaymentError(
          eventAmount > 0
            ? `Wpisz kwotę od 0 do ${formatPln(eventAmount)}.`
            : "Wpisz prawidłową kwotę częściowej wpłaty.",
        );
        return;
      }
      amountPaid = parsed;
    }

    setPaymentUpdating(true);
    try {
      await setPaymentStatus({
        source: paymentSource,
        registrationId: paymentParticipant._id as
          | Id<"registrations">
          | Id<"nocowankaRegistrations">,
        paymentStatus: paymentIntent,
        amountPaid,
      });
      if (paymentIntent !== "partial") {
        setShowPartialInput(false);
      }
    } catch (e) {
      setPaymentError(
        e instanceof Error ? e.message : "Nie udało się zaktualizować płatności.",
      );
    } finally {
      setPaymentUpdating(false);
    }
  };

  const needsAttention = pendingPaymentsCount > 0 || missingMedicalFormsCount > 0;
  const hasHeaderActions = Boolean(
    formQuestionsHref || editCampHref || onToggleRegistrationOpen,
  );

  return (
    <TooltipProvider delayDuration={200}>
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
            onClick={() =>
              openBulkDialog(
                pendingPaymentsCount > 0 ? "payment" : "choose",
              )
            }
          >
            Wyślij przypomnienia
          </Button>
        </div>
      ) : null}

      {slotAboveStats}

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-white/12 dark:bg-surface-dark">
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
                    const medical = getEffectiveMedicalStatus(p);
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
                                <ActionTooltip label="Podgląd">
                                  <button
                                    type="button"
                                    className="touch-manipulation rounded-xl p-2 text-text-main hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                    aria-label="Podgląd"
                                    onClick={() => setViewingParticipant(p)}
                                  >
                                    <span className="material-symbols-outlined text-xl">
                                      visibility
                                    </span>
                                  </button>
                                </ActionTooltip>
                                <ActionTooltip label="Kwestionariusz medyczny">
                                  <button
                                    type="button"
                                    className="touch-manipulation rounded-xl p-2 text-text-main hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                    aria-label="Kwestionariusz medyczny"
                                    onClick={() => setMedicalParticipant(p)}
                                  >
                                    <span className="material-symbols-outlined text-xl">
                                      medical_information
                                    </span>
                                  </button>
                                </ActionTooltip>
                                {paymentSource ? (
                                  <ActionTooltip label="Płatności">
                                    <button
                                      type="button"
                                      className="touch-manipulation rounded-xl p-2 text-text-main hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                      aria-label="Płatności"
                                      onClick={() => openPaymentDialog(p)}
                                    >
                                      <span className="material-symbols-outlined text-xl">
                                        payments
                                      </span>
                                    </button>
                                  </ActionTooltip>
                                ) : null}
                                <ActionTooltip label="Wyślij wiadomość">
                                  <button
                                    type="button"
                                    className="touch-manipulation rounded-xl p-2 text-text-main hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                    aria-label="Wyślij wiadomość"
                                    onClick={() => openMessageDialog(p)}
                                  >
                                    <span className="material-symbols-outlined text-xl">
                                      mail
                                    </span>
                                  </button>
                                </ActionTooltip>
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
                        const medical = getEffectiveMedicalStatus(p);
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
                              <button
                                type="button"
                                className="flex items-center gap-1.5 rounded-lg text-left transition-colors hover:text-primary"
                                onClick={() => setMedicalParticipant(p)}
                              >
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
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <ActionTooltip label="Podgląd">
                                  <button
                                    type="button"
                                    className="rounded-lg p-2 text-text-main hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                    aria-label="Podgląd"
                                    onClick={() => setViewingParticipant(p)}
                                  >
                                    <span className="material-symbols-outlined text-lg">
                                      visibility
                                    </span>
                                  </button>
                                </ActionTooltip>
                                <ActionTooltip label="Kwestionariusz medyczny">
                                  <button
                                    type="button"
                                    className="rounded-lg p-2 text-text-main hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                    aria-label="Kwestionariusz medyczny"
                                    onClick={() => setMedicalParticipant(p)}
                                  >
                                    <span className="material-symbols-outlined text-lg">
                                      medical_information
                                    </span>
                                  </button>
                                </ActionTooltip>
                                {paymentSource ? (
                                  <ActionTooltip label="Płatności">
                                    <button
                                      type="button"
                                      className="rounded-lg p-2 text-text-main hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                      aria-label="Płatności"
                                      onClick={() => openPaymentDialog(p)}
                                    >
                                      <span className="material-symbols-outlined text-lg">
                                        payments
                                      </span>
                                    </button>
                                  </ActionTooltip>
                                ) : null}
                                <ActionTooltip label="Wyślij wiadomość">
                                  <button
                                    type="button"
                                    className="rounded-lg p-2 text-text-main hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                    aria-label="Wyślij wiadomość"
                                    onClick={() => openMessageDialog(p)}
                                  >
                                    <span className="material-symbols-outlined text-lg">
                                      mail
                                    </span>
                                  </button>
                                </ActionTooltip>
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
        <DialogContent className="gap-0 overflow-hidden border-stone-200 bg-white p-0 text-card-foreground sm:max-w-xl dark:border-white/12 dark:bg-surface-dark">
          {viewingParticipant ? (
            <>
              <div className="border-b border-stone-200/80 bg-linear-to-br from-orange-50/70 via-white to-stone-50 px-6 pb-5 pt-6 dark:border-white/10 dark:from-primary/10 dark:via-surface-dark dark:to-surface-dark">
                <div className="flex items-start justify-between gap-3">
                  <DialogHeader className="space-y-0 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
                      Rejestracja
                    </p>
                    <DialogTitle className="mt-1 text-xl font-bold tracking-tight text-text-main dark:text-white">
                      {viewingParticipant.childName} {viewingParticipant.childSurname}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                      {viewingParticipant.parentName
                        ? `Opiekun: ${viewingParticipant.parentName}`
                        : "Szczegóły uczestnika i status rejestracji"}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-white"
                      aria-label="Zamknij"
                    >
                      <span className="material-symbols-outlined text-xl leading-none">
                        close
                      </span>
                    </Button>
                  </DialogClose>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <div
                    className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-base font-bold text-primary shadow-soft ring-1 ring-orange-200/70 dark:bg-white/10 dark:ring-primary/25"
                    aria-hidden
                  >
                    {getInitials(
                      viewingParticipant.childName,
                      viewingParticipant.childSurname,
                    )}
                  </div>
                  <div className="flex min-w-0 flex-wrap gap-2">
                    <span
                      className={paymentPillClass(
                        viewingParticipant.paymentStatus ?? "unpaid",
                      )}
                    >
                      {getPaymentLabel(viewingParticipant.paymentStatus)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="max-h-[min(70vh,560px)] space-y-6 overflow-y-auto bg-white px-6 py-5 dark:bg-surface-dark">
                <section className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className={cn(
                      "rounded-xl border px-3.5 py-3 text-left transition-colors hover:border-primary/40",
                      getEffectiveMedicalStatus(viewingParticipant) ===
                        "complete"
                        ? "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-400/20 dark:bg-emerald-500/10"
                        : "border-amber-200/80 bg-amber-50/70 dark:border-amber-400/20 dark:bg-amber-500/10",
                    )}
                    onClick={() => {
                      const participant = viewingParticipant;
                      setViewingParticipant(null);
                      setMedicalParticipant(participant);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "material-symbols-outlined text-lg",
                          getEffectiveMedicalStatus(viewingParticipant) ===
                            "complete"
                            ? "text-emerald-600 dark:text-emerald-300"
                            : "text-amber-600 dark:text-amber-300",
                        )}
                        aria-hidden
                      >
                        {getEffectiveMedicalStatus(viewingParticipant) ===
                        "complete"
                          ? "check_circle"
                          : "schedule"}
                      </span>
                      <p className="text-sm font-semibold text-text-main dark:text-white">
                        Formularz medyczny ·{" "}
                        {getMedicalLabel(
                          getEffectiveMedicalStatus(viewingParticipant),
                        )}
                      </p>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                      {getEffectiveMedicalStatus(viewingParticipant) ===
                      "complete"
                        ? "Kliknij, aby zobaczyć odpowiedzi kwestionariusza medycznego."
                        : "Brak uzupełnionego formularza — kliknij, aby sprawdzić dostępne dane."}
                    </p>
                  </button>
                  <div
                    className={cn(
                      "rounded-xl border px-3.5 py-3",
                      viewingParticipant.consent
                        ? "border-sky-200/80 bg-sky-50/70 dark:border-sky-400/20 dark:bg-sky-500/10"
                        : "border-stone-200 bg-stone-50 dark:border-white/12 dark:bg-white/5",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "material-symbols-outlined text-lg",
                          viewingParticipant.consent
                            ? "text-sky-600 dark:text-sky-300"
                            : "text-stone-500 dark:text-stone-400",
                        )}
                        aria-hidden
                      >
                        {viewingParticipant.consent
                          ? "verified_user"
                          : "privacy_tip"}
                      </span>
                      <p className="text-sm font-semibold text-text-main dark:text-white">
                        Zgoda opiekuna ·{" "}
                        {viewingParticipant.consent ? "Udzielona" : "Brak"}
                      </p>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                      {viewingParticipant.consent
                        ? "Rodzic/opiekun zaakceptował regulamin i warunki udziału dziecka w wydarzeniu."
                        : "Brak potwierdzonej zgody na udział — sprawdź rejestrację lub skontaktuj się z opiekunem."}
                    </p>
                  </div>
                </section>

                <section className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                      Dziecko
                    </h4>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="text-xs text-stone-500 dark:text-stone-400">
                          Data urodzenia
                        </dt>
                        <dd className="mt-0.5 font-medium text-text-main dark:text-white">
                          {viewingParticipant.childDob ?? "—"}
                          {computeAge(viewingParticipant.childDob) != null ? (
                            <span className="ml-1.5 font-normal text-stone-500 dark:text-stone-400">
                              · {computeAge(viewingParticipant.childDob)} lat
                            </span>
                          ) : null}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500 dark:text-stone-400">Dieta</dt>
                        <dd className="mt-0.5 text-text-main dark:text-stone-200">
                          {viewingParticipant.dietary?.trim() || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500 dark:text-stone-400">Alergie</dt>
                        <dd className="mt-0.5 text-text-main dark:text-stone-200">
                          {viewingParticipant.allergies?.trim() || "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                      Opiekun
                    </h4>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="text-xs text-stone-500 dark:text-stone-400">
                          Imię i nazwisko
                        </dt>
                        <dd className="mt-0.5 font-medium text-text-main dark:text-white">
                          {viewingParticipant.parentName?.trim() || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500 dark:text-stone-400">E-mail</dt>
                        <dd className="mt-0.5 break-all text-text-main dark:text-stone-200">
                          {viewingParticipant.parentEmail?.trim() || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500 dark:text-stone-400">Telefon</dt>
                        <dd className="mt-0.5 text-text-main dark:text-stone-200">
                          {viewingParticipant.parentPhone?.trim() || "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </section>

                {(viewingParticipant.medicalNotes?.trim() ||
                  (viewingParticipant.customAnswers &&
                    Object.keys(viewingParticipant.customAnswers).length > 0)) && (
                  <div className="h-px bg-stone-200 dark:bg-white/10" />
                )}

                {viewingParticipant.medicalNotes?.trim() ? (
                  <section>
                    <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                      Uwagi medyczne
                    </h4>
                    <p className="rounded-xl border border-amber-200/70 bg-amber-50 px-3.5 py-3 text-sm leading-relaxed text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
                      {viewingParticipant.medicalNotes}
                    </p>
                  </section>
                ) : null}

                {viewingParticipant.customAnswers &&
                Object.keys(viewingParticipant.customAnswers).length > 0 ? (
                  <section>
                    <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
                      Dodatkowe odpowiedzi
                    </h4>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(viewingParticipant.customAnswers).map(
                        ([questionId, value]) => (
                          <div
                            key={questionId}
                            className="rounded-xl border border-stone-200 bg-stone-50/80 px-3.5 py-3 dark:border-white/12 dark:bg-white/5"
                          >
                            <dt className="text-xs text-stone-500 dark:text-stone-400">
                              {customQuestionLabels?.[questionId] ?? questionId}
                            </dt>
                            <dd className="mt-1 text-sm font-medium text-text-main dark:text-stone-200">
                              {value || "—"}
                            </dd>
                          </div>
                        ),
                      )}
                    </dl>
                  </section>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-stone-200/80 bg-stone-50 px-6 py-4 dark:border-white/10 dark:bg-white/5">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5 bg-white dark:bg-transparent"
                  onClick={() => {
                    const participant = viewingParticipant;
                    setViewingParticipant(null);
                    setMedicalParticipant(participant);
                  }}
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden>
                    medical_information
                  </span>
                  Kwestionariusz
                </Button>
                {paymentSource ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5 bg-white dark:bg-transparent"
                    onClick={() => {
                      const participant = viewingParticipant;
                      setViewingParticipant(null);
                      openPaymentDialog(participant);
                    }}
                  >
                    <span className="material-symbols-outlined text-lg" aria-hidden>
                      payments
                    </span>
                    Płatności
                  </Button>
                ) : null}
                <Button type="button" onClick={() => setViewingParticipant(null)}>
                  Zamknij
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Kwestionariusz medyczny */}
      <Dialog
        open={!!medicalParticipant}
        onOpenChange={(open) => !open && setMedicalParticipant(null)}
      >
        <DialogContent className="gap-0 overflow-hidden border-stone-200 bg-white p-0 text-card-foreground sm:max-w-lg dark:border-white/12 dark:bg-surface-dark">
          {medicalParticipant ? (
            <>
              <div className="border-b border-stone-200/80 bg-linear-to-br from-emerald-50/80 via-white to-stone-50 px-6 pb-5 pt-6 dark:border-white/10 dark:from-emerald-500/10 dark:via-surface-dark dark:to-surface-dark">
                <div className="flex items-start justify-between gap-3">
                  <DialogHeader className="space-y-0 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
                      Kwestionariusz medyczny
                    </p>
                    <DialogTitle className="mt-1 text-xl font-bold tracking-tight text-text-main dark:text-white">
                      {medicalParticipant.childName}{" "}
                      {medicalParticipant.childSurname}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                      Odpowiedzi opiekuna z formularza rejestracji
                      {medicalParticipant.parentName
                        ? ` · ${medicalParticipant.parentName}`
                        : ""}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-white"
                      aria-label="Zamknij"
                    >
                      <span className="material-symbols-outlined text-xl leading-none">
                        close
                      </span>
                    </Button>
                  </DialogClose>
                </div>
                <div className="mt-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                      getEffectiveMedicalStatus(medicalParticipant) ===
                        "complete"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/25"
                        : "bg-amber-50 text-amber-700 ring-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/25",
                    )}
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden>
                      {getEffectiveMedicalStatus(medicalParticipant) ===
                      "complete"
                        ? "check_circle"
                        : "schedule"}
                    </span>
                    {getMedicalLabel(
                      getEffectiveMedicalStatus(medicalParticipant),
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-3 px-6 py-5">
                {(
                  [
                    {
                      question: "Dieta / nietolerancje",
                      answer: medicalParticipant.dietary,
                      hint: "Preferencje żywieniowe i nietolerancje zgłoszone przez opiekuna.",
                    },
                    {
                      question: "Alergie i leki",
                      answer: medicalParticipant.allergies,
                      hint: "Alergie oraz leki przyjmowane na stałe.",
                    },
                    {
                      question: "Uwagi medyczne",
                      answer: medicalParticipant.medicalNotes,
                      hint: "Dodatkowe informacje ważne dla kadry i bezpieczeństwa.",
                    },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.question}
                    className="rounded-xl border border-stone-200 bg-stone-50/80 px-4 py-3.5 dark:border-white/12 dark:bg-white/5"
                  >
                    <p className="text-sm font-semibold text-text-main dark:text-white">
                      {item.question}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                      {item.hint}
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-sm leading-relaxed",
                        item.answer?.trim()
                          ? "text-text-main dark:text-stone-200"
                          : "italic text-stone-400 dark:text-stone-500",
                      )}
                    >
                      {item.answer?.trim() || "Brak odpowiedzi"}
                    </p>
                  </div>
                ))}

                <div className="rounded-xl border border-stone-200 bg-white px-4 py-3.5 dark:border-white/12 dark:bg-transparent">
                  <p className="text-sm font-semibold text-text-main dark:text-white">
                    Zgoda opiekuna na udział
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    Akceptacja regulaminu i warunków udziału w wydarzeniu.
                  </p>
                  <p className="mt-2 text-sm font-medium text-text-main dark:text-stone-200">
                    {medicalParticipant.consent
                      ? "Udzielona"
                      : "Brak potwierdzenia w systemie"}
                  </p>
                </div>
              </div>

              <DialogFooter className="border-t border-stone-200/80 bg-stone-50 px-6 py-4 dark:border-white/10 dark:bg-white/5 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white dark:bg-transparent"
                  onClick={() => setMedicalParticipant(null)}
                >
                  Zamknij
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Płatności dialog */}
      <Dialog
        open={!!paymentParticipant}
        onOpenChange={(open) => {
          if (!open) setPaymentParticipantId(null);
        }}
      >
        <DialogContent className="gap-0 overflow-hidden border-stone-200 bg-white p-0 text-card-foreground sm:max-w-md dark:border-white/12 dark:bg-surface-dark">
          {paymentParticipant ? (
            <>
              <div className="border-b border-stone-200/80 bg-linear-to-br from-orange-50/70 via-white to-stone-50 px-6 pb-5 pt-6 dark:border-white/10 dark:from-primary/10 dark:via-surface-dark dark:to-surface-dark">
                <div className="flex items-start justify-between gap-3">
                  <DialogHeader className="space-y-0 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
                      Płatność
                    </p>
                    <DialogTitle className="mt-1 text-xl font-bold tracking-tight text-text-main dark:text-white">
                      {paymentParticipant.childName} {paymentParticipant.childSurname}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                      {eventTitle}
                      {paymentParticipant.parentName
                        ? ` · ${paymentParticipant.parentName}`
                        : ""}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-white"
                      aria-label="Zamknij"
                    >
                      <span className="material-symbols-outlined text-xl leading-none">
                        close
                      </span>
                    </Button>
                  </DialogClose>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 dark:border-white/12 dark:bg-white/5">
                    <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                      Kwota
                    </p>
                    <p className="mt-0.5 text-sm font-bold tabular-nums text-text-main dark:text-white">
                      {formatPln(eventAmount)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 dark:border-white/12 dark:bg-white/5">
                    <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                      Opłacone
                    </p>
                    <p className="mt-0.5 text-sm font-bold tabular-nums text-text-main dark:text-white">
                      {formatPln(
                        paidAmountFor(
                          paymentParticipant.paymentStatus,
                          eventAmount,
                          paymentParticipant.amountPaid,
                        ),
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 dark:border-white/12 dark:bg-white/5">
                    <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                      Do zapłaty
                    </p>
                    <p className="mt-0.5 text-sm font-bold tabular-nums text-text-main dark:text-white">
                      {formatPln(
                        Math.max(
                          0,
                          eventAmount -
                            paidAmountFor(
                              paymentParticipant.paymentStatus,
                              eventAmount,
                              paymentParticipant.amountPaid,
                            ),
                        ),
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <span
                    className={paymentPillClass(
                      paymentParticipant.paymentStatus ?? "unpaid",
                    )}
                  >
                    {getPaymentLabel(paymentParticipant.paymentStatus)}
                  </span>
                </div>
              </div>

              <div className="space-y-4 bg-white px-6 py-5 dark:bg-surface-dark">
                <div>
                  <p className="mb-2 text-sm font-medium text-text-main dark:text-stone-200">
                    Ustaw status
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      aria-pressed={paymentIntent === "paid"}
                      className={paymentActionButtonClass(paymentIntent === "paid")}
                      disabled={paymentUpdating}
                      onClick={() => {
                        setPaymentIntent("paid");
                        setShowPartialInput(false);
                        setPaymentError(null);
                      }}
                    >
                      <span className="material-symbols-outlined text-xl" aria-hidden>
                        check_circle
                      </span>
                      <span className="text-xs font-semibold">Opłacone</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      aria-pressed={paymentIntent === "partial"}
                      className={paymentActionButtonClass(paymentIntent === "partial")}
                      disabled={paymentUpdating}
                      onClick={() => {
                        setPaymentIntent("partial");
                        setShowPartialInput(true);
                        setPaymentError(null);
                        setPartialAmount(
                          String(
                            paymentParticipant.amountPaid &&
                              paymentParticipant.amountPaid > 0
                              ? paymentParticipant.amountPaid
                              : "",
                          ),
                        );
                      }}
                    >
                      <span className="material-symbols-outlined text-xl" aria-hidden>
                        payments
                      </span>
                      <span className="text-xs font-semibold">Częściowo</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      aria-pressed={paymentIntent === "unpaid"}
                      className={paymentActionButtonClass(paymentIntent === "unpaid")}
                      disabled={paymentUpdating}
                      onClick={() => {
                        setPaymentIntent("unpaid");
                        setShowPartialInput(false);
                        setPaymentError(null);
                      }}
                    >
                      <span className="material-symbols-outlined text-xl" aria-hidden>
                        money_off
                      </span>
                      <span className="text-xs font-semibold">Nieopłacone</span>
                    </Button>
                  </div>
                </div>

                {showPartialInput ? (
                  <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-white/12 dark:bg-white/5">
                    <Label htmlFor="partial-amount" className="text-sm">
                      Kwota częściowej wpłaty
                    </Label>
                    <Input
                      id="partial-amount"
                      inputMode="decimal"
                      placeholder="np. 500"
                      value={partialAmount}
                      onChange={(e) => {
                        setPartialAmount(e.target.value);
                        setPaymentError(null);
                      }}
                      className="bg-white dark:bg-white/5"
                    />
                  </div>
                ) : null}

                {paymentError ? (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
                    {paymentError}
                  </p>
                ) : null}
              </div>

              <DialogFooter className="border-t border-stone-200/80 bg-stone-50 px-6 py-4 dark:border-white/10 dark:bg-white/5 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white dark:bg-transparent"
                  onClick={() => setPaymentParticipantId(null)}
                >
                  Anuluj
                </Button>
                <Button
                  type="button"
                  disabled={paymentUpdating || !paymentDraftDirty}
                  onClick={savePaymentStatus}
                >
                  {paymentUpdating ? "Zapisywanie…" : "Zapisz"}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Wyślij wiadomość (singular) */}
      <Dialog
        open={!!messageParticipant}
        onOpenChange={(open) => {
          if (!open) closeMessageDialog();
        }}
      >
        <DialogContent className="gap-0 overflow-hidden border-stone-200 bg-white p-0 sm:max-w-md dark:border-white/12 dark:bg-surface-dark">
          {messageParticipant ? (
            <>
              <div className="border-b border-stone-200/80 px-6 pb-5 pt-6 dark:border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <DialogHeader className="space-y-0 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
                      Wiadomość
                    </p>
                    <DialogTitle className="mt-1 text-xl font-bold tracking-tight text-text-main dark:text-white">
                      {childFullName(messageParticipant)}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                      {messageParticipant.parentEmail?.trim() ||
                        "Brak adresu e-mail opiekuna"}
                      {messageParticipant.parentName
                        ? ` · ${messageParticipant.parentName}`
                        : ""}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-full"
                      aria-label="Zamknij"
                    >
                      <span className="material-symbols-outlined text-xl leading-none">
                        close
                      </span>
                    </Button>
                  </DialogClose>
                </div>
              </div>

              <div className="space-y-4 px-6 py-5">
                {!messageParticipant.parentEmail?.trim() ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
                    Uzupełnij e-mail opiekuna w rejestracji, aby wysłać wiadomość.
                  </p>
                ) : null}

                {messageMode === "choose" ? (
                  <div className="grid gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto justify-start gap-3 px-4 py-3"
                      disabled={!messageParticipant.parentEmail?.trim()}
                      onClick={() => {
                        setMessageMode("reminder");
                        setMessageError(null);
                        setMessageInfo(null);
                      }}
                    >
                      <span className="material-symbols-outlined text-xl text-primary" aria-hidden>
                        notifications
                      </span>
                      <span className="text-left">
                        <span className="block text-sm font-semibold">
                          Przypomnienie o wydarzeniu
                        </span>
                        <span className="block text-xs font-normal text-stone-500 dark:text-stone-400">
                          Profesjonalny szablon z danymi wydarzenia
                        </span>
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto justify-start gap-3 px-4 py-3"
                      disabled={
                        !messageParticipant.parentEmail?.trim() ||
                        messageAmountMissing <= 0
                      }
                      onClick={() => {
                        setMessageMode("payment");
                        setMessageError(null);
                        setMessageInfo(null);
                      }}
                    >
                      <span className="material-symbols-outlined text-xl text-primary" aria-hidden>
                        payments
                      </span>
                      <span className="text-left">
                        <span className="block text-sm font-semibold">
                          Przypomnienie o płatności
                        </span>
                        <span className="block text-xs font-normal text-stone-500 dark:text-stone-400">
                          {messageAmountMissing > 0
                            ? `Do zapłaty: ${formatPln(messageAmountMissing)}`
                            : "Brak zaległej kwoty"}
                        </span>
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto justify-start gap-3 px-4 py-3"
                      disabled={!messageParticipant.parentEmail?.trim()}
                      onClick={() => {
                        setMessageMode("custom");
                        setMessageError(null);
                        setMessageInfo(null);
                      }}
                    >
                      <span className="material-symbols-outlined text-xl text-primary" aria-hidden>
                        edit_note
                      </span>
                      <span className="text-left">
                        <span className="block text-sm font-semibold">
                          Wiadomość własna
                        </span>
                        <span className="block text-xs font-normal text-stone-500 dark:text-stone-400">
                          Własny temat i treść w tym samym szablonie
                        </span>
                      </span>
                    </Button>
                  </div>
                ) : null}

                {messageMode === "reminder" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-stone-600 dark:text-stone-300">
                      Wyślemy przypomnienie o wydarzeniu{" "}
                      <strong>{eventTitle}</strong> na adres{" "}
                      <strong>{messageParticipant.parentEmail}</strong>.
                    </p>
                  </div>
                ) : null}

                {messageMode === "payment" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-stone-600 dark:text-stone-300">
                      Wyślemy przypomnienie o płatności na{" "}
                      <strong>{messageParticipant.parentEmail}</strong>.
                    </p>
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 dark:border-rose-400/20 dark:bg-rose-500/10">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                        Do zapłaty
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-text-main dark:text-white">
                        {formatPln(messageAmountMissing)}
                      </p>
                      <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                        Kwota: {formatPln(messageAmountDue)} · Opłacono:{" "}
                        {formatPln(messageAmountPaid)}
                      </p>
                    </div>
                  </div>
                ) : null}

                {messageMode === "custom" ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="custom-subject">Temat</Label>
                      <Input
                        id="custom-subject"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        placeholder="Temat wiadomości"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="custom-body">Treść</Label>
                      <Textarea
                        id="custom-body"
                        rows={6}
                        value={customBody}
                        onChange={(e) => setCustomBody(e.target.value)}
                        placeholder="Napisz wiadomość do opiekuna…"
                      />
                    </div>
                  </div>
                ) : null}

                {messageError ? (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
                    {messageError}
                  </p>
                ) : null}
                {messageInfo ? (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                    {messageInfo}
                  </p>
                ) : null}
              </div>

              <DialogFooter className="border-t border-stone-200/80 bg-stone-50 px-6 py-4 dark:border-white/10 dark:bg-white/5 sm:justify-end">
                {messageMode === "choose" ? (
                  <Button type="button" variant="outline" onClick={closeMessageDialog}>
                    Zamknij
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={messageSending}
                      onClick={() => {
                        setMessageMode("choose");
                        setMessageError(null);
                      }}
                    >
                      Wstecz
                    </Button>
                    <Button
                      type="button"
                      disabled={
                        messageSending ||
                        !messageParticipant.parentEmail?.trim() ||
                        (messageMode === "payment" &&
                          messageAmountMissing <= 0) ||
                        (messageMode === "custom" &&
                          (!customSubject.trim() || !customBody.trim()))
                      }
                      onClick={sendSingularMessage}
                    >
                      {messageSending
                        ? "Wysyłanie…"
                        : messageMode === "payment"
                          ? "Wyślij przypomnienie"
                          : "Wyślij"}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Bulk reminders */}
      <Dialog
        open={bulkRemindOpen}
        onOpenChange={(open) => {
          if (!open) closeBulkDialog();
        }}
      >
        <DialogContent className="gap-0 overflow-hidden border-stone-200 bg-white p-0 sm:max-w-lg dark:border-white/12 dark:bg-surface-dark">
          <div className="border-b border-stone-200/80 px-6 pb-5 pt-6 dark:border-white/10">
            <div className="flex items-start justify-between gap-3">
              <DialogHeader className="space-y-0 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
                  Wiadomość zbiorcza
                </p>
                <DialogTitle className="mt-1 text-xl font-bold tracking-tight text-text-main dark:text-white">
                  {bulkMode === "choose"
                    ? "Wiadomość do rodziców"
                    : bulkMode === "reminder"
                      ? "Przypomnienie o wydarzeniu"
                      : "Przypomnienie o płatności"}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  {eventTitle}
                </DialogDescription>
              </DialogHeader>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full"
                  aria-label="Zamknij"
                >
                  <span className="material-symbols-outlined text-xl leading-none">
                    close
                  </span>
                </Button>
              </DialogClose>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            {bulkMode === "choose" ? (
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto justify-start gap-3 px-4 py-3"
                  disabled={bulkEventRecipients.length === 0}
                  onClick={() => {
                    setBulkMode("reminder");
                    setBulkError(null);
                    setBulkInfo(null);
                  }}
                >
                  <span
                    className="material-symbols-outlined text-xl text-primary"
                    aria-hidden
                  >
                    notifications
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-semibold">
                      Przypomnienie o wydarzeniu
                    </span>
                    <span className="block text-xs font-normal text-stone-500 dark:text-stone-400">
                      {bulkEventRecipients.length > 0
                        ? `${bulkEventRecipients.length} ${
                            bulkEventRecipients.length === 1
                              ? "adresat"
                              : "adresatów"
                          } z przefiltrowanej listy`
                        : "Brak adresów na przefiltrowanej liście"}
                    </span>
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto justify-start gap-3 px-4 py-3"
                  disabled={bulkPaymentRecipients.length === 0}
                  onClick={() => {
                    setBulkMode("payment");
                    setBulkError(null);
                    setBulkInfo(null);
                  }}
                >
                  <span
                    className="material-symbols-outlined text-xl text-primary"
                    aria-hidden
                  >
                    payments
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-semibold">
                      Przypomnienie o płatności
                    </span>
                    <span className="block text-xs font-normal text-stone-500 dark:text-stone-400">
                      {bulkPaymentRecipients.length > 0
                        ? `${bulkPaymentRecipients.length} ${
                            bulkPaymentRecipients.length === 1
                              ? "zaległa rejestracja"
                              : "zaległych rejestracji"
                          } · ${formatPln(bulkPaymentTotalMissing)}`
                        : "Brak zaległych płatności"}
                    </span>
                  </span>
                </Button>
              </div>
            ) : null}

            {bulkMode === "reminder" ? (
              <div className="space-y-3">
                <p className="text-sm text-stone-600 dark:text-stone-300">
                  Przypomnienie o wydarzeniu trafi do poniższych opiekunów
                  {filtered.length !== bulkEventRecipients.length
                    ? " (duplikaty e-mail pominięte)"
                    : null}
                  .
                </p>
                <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-white/10">
                  <div className="flex items-center justify-between gap-2 border-b border-stone-200 bg-stone-50 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                      Lista adresatów
                    </p>
                    <p className="text-xs font-semibold tabular-nums text-stone-700 dark:text-stone-200">
                      {bulkEventRecipients.length}
                    </p>
                  </div>
                  <ul className="max-h-64 divide-y divide-stone-100 overflow-y-auto dark:divide-white/10">
                    {bulkEventRecipients.map((r) => (
                      <li
                        key={`${r.to}-${r.childName ?? ""}`}
                        className="flex flex-col gap-0.5 px-3.5 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-main dark:text-white">
                            {r.parentName?.trim() || "Opiekun"}
                          </p>
                          {r.childName ? (
                            <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                              Uczestnik: {r.childName}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 truncate text-xs font-medium text-stone-600 dark:text-stone-300 sm:text-right">
                          {r.to}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {bulkMode === "payment" ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 dark:border-rose-400/20 dark:bg-rose-500/10">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                        Do odzyskania
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-text-main dark:text-white">
                        {formatPln(bulkPaymentTotalMissing)}
                      </p>
                    </div>
                    <p className="pb-0.5 text-xs text-stone-600 dark:text-stone-400">
                      {bulkPaymentRecipients.length}{" "}
                      {bulkPaymentRecipients.length === 1
                        ? "wiadomość"
                        : "wiadomości"}
                    </p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-white/10">
                  <div className="flex items-center justify-between gap-2 border-b border-stone-200 bg-stone-50 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                      Lista adresatów
                    </p>
                    <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                      Kwota
                    </p>
                  </div>
                  <ul className="max-h-64 divide-y divide-stone-100 overflow-y-auto dark:divide-white/10">
                    {bulkPaymentRecipients.map((r, index) => (
                      <li
                        key={`${r.to}-${r.childName ?? ""}-${index}`}
                        className="flex items-start justify-between gap-3 px-3.5 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-main dark:text-white">
                            {r.parentName?.trim() || "Opiekun"}
                          </p>
                          {r.childName ? (
                            <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                              Uczestnik: {r.childName}
                            </p>
                          ) : null}
                          <p className="mt-0.5 truncate text-xs font-medium text-stone-600 dark:text-stone-300">
                            {r.to}
                          </p>
                        </div>
                        <p className="shrink-0 pt-0.5 text-sm font-bold tabular-nums text-rose-700 dark:text-rose-300">
                          {formatPln(r.amountMissingPln)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {bulkError ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
                {bulkError}
              </p>
            ) : null}
            {bulkInfo ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                {bulkInfo}
              </p>
            ) : null}
          </div>

          <DialogFooter className="border-t border-stone-200/80 bg-stone-50 px-6 py-4 dark:border-white/10 dark:bg-white/5 sm:justify-end">
            {bulkMode === "choose" ? (
              <Button type="button" variant="outline" onClick={closeBulkDialog}>
                Zamknij
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={bulkSending}
                  onClick={() => {
                    setBulkMode("choose");
                    setBulkError(null);
                  }}
                >
                  Wstecz
                </Button>
                <Button
                  type="button"
                  disabled={
                    bulkSending ||
                    (bulkMode === "reminder"
                      ? bulkEventRecipients.length === 0
                      : bulkPaymentRecipients.length === 0)
                  }
                  onClick={() => sendBulkReminders(bulkMode)}
                >
                  {bulkSending
                    ? "Wysyłanie…"
                    : bulkMode === "payment"
                      ? "Wyślij przypomnienia o płatności"
                      : "Wyślij przypomnienia"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
