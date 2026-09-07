"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Users,
  Baby,
  CalendarDays,
  Tent,
  Calendar,
  Plus,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminMobileMenuCards } from "@/components/admin/admin-mobile-menu-cards";

function getInitials(name: string, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email?.trim()) return email.slice(0, 2).toUpperCase();
  return "?";
}

function formatRegistrationDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) {
    return `Dzisiaj, ${d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function registrationStatusLabel(
  status?: string
): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  const s = status?.toLowerCase() ?? "";
  if (s === "new") return { label: "Nowa", variant: "secondary" };
  if (s === "confirmed") return { label: "Potwierdzona", variant: "default" };
  if (s) return { label: status!, variant: "outline" };
  return { label: "—", variant: "outline" };
}

function durationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export default function AdminPulpitPage() {
  const asOfTimestamp = useMemo(() => Date.now(), []);
  const dayOfWeek = useMemo(() => new Date().getDay(), []);

  const stats = useQuery(
    api.dashboard.getDashboardStats,
    { asOfTimestamp }
  );
  const trends = useQuery(
    api.dashboard.getRegistrationTrends,
    { months: 6, asOfTimestamp }
  );
  const todaysSchedule = useQuery(
    api.dashboard.getTodaysScheduleForAdmin,
    { dayOfWeek }
  );
  const allRegistrations = useQuery(api.registrations.listCampRegistrationsForAdmin);
  const recentRegistrations = (allRegistrations ?? []).slice(0, 5);

  const chartColor = "hsl(var(--chart-1))";

  return (
    <div className="flex flex-col gap-8">
      <div className="mb-2 md:hidden">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Panel administratora
        </p>
        <AdminMobileMenuCards />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Użytkownicy
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.membersCount != null
                ? stats.membersCount.toLocaleString("pl-PL")
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Zarejestrowani w systemie
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dzieci
            </CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.childrenCount != null
                ? stats.childrenCount.toLocaleString("pl-PL")
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dzieci w systemie
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Zajęcia
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeClassesCount != null
                ? stats.activeClassesCount
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktywne grupy
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Obozy
            </CardTitle>
            <Tent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeCampsCount != null
                ? stats.activeCampsCount
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktywne obozy w ofercie
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wydarzenia
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.eventsCount != null ? stats.eventsCount : "—"}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              +{stats?.eventsNewThisWeek ?? 0} nowe w tym tyg.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trendy Rejestracji */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Trendy Rejestracji</CardTitle>
              <CardDescription>Liczba nowych członków miesięcznie</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              Ostatnie 6 miesięcy
              <span className="material-symbols-outlined ml-1 text-sm">expand_more</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              {trends && trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: "var(--radius)" }}
                      formatter={(value) => [value ?? 0, "Rejestracje"]}
                      labelFormatter={(label) => `Miesiąc: ${label}`}
                    />
                    <Bar dataKey="count" fill={chartColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  Brak danych
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ostatnie Rejestracje */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Ostatnie Rejestracje</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/rejestracje">Przejdź do rejestracji</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRegistrations.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  Brak rejestracji
                </p>
              ) : (
                recentRegistrations.map((r) => {
                  const { label, variant } = registrationStatusLabel(r.status);
                  const name = `${r.parentName}`.trim() || "—";
                  const registrationDetailsHref =
                    r.camp?.slug != null && r.camp.slug !== ""
                      ? `/admin/rejestracje/oboz/${encodeURIComponent(r.camp.slug)}`
                      : "/admin/rejestracje";
                  return (
                    <div
                      key={r._id}
                      className="flex items-center justify-between gap-3 py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 rounded-full bg-stone-200 dark:bg-stone-700 items-center justify-center text-xs font-bold text-stone-600 dark:text-stone-300">
                          {getInitials(name, r.parentEmail)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {r.parentEmail}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground">
                        {formatRegistrationDate(r._creationTime)}
                      </div>
                      <Badge variant={variant} className="shrink-0">
                        {label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <span className="material-symbols-outlined text-lg">more_vert</span>
                            <span className="sr-only">Akcja</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={registrationDetailsHref}>Szczegóły</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Szybkie Akcje */}
        <Card>
          <CardHeader>
            <CardTitle>Szybkie Akcje</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/grafik" className="gap-2">
                <Plus className="h-4 w-4" />
                Dodaj nowe zajęcia
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/rejestracje" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                Rejestracje
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/wydarzenia" className="gap-2">
                <Calendar className="h-4 w-4" />
                Utwórz wydarzenie
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="#" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Wyślij wiadomość
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Dzisiejsze Zajęcia */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              Dzisiejsze Zajęcia
              <Badge variant="secondary">DZISIAJ</Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/grafik">Zobacz pełny grafik</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysSchedule && todaysSchedule.length > 0 ? (
                todaysSchedule.map((item, idx) => (
                  <div
                    key={item.slot._id ?? idx}
                    className="flex flex-col gap-1 py-3 border-b border-stone-100 dark:border-stone-800 last:border-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{item.class.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.slot.startTime} ·{" "}
                        {durationMinutes(item.slot.startTime, item.slot.endTime)} min
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Instruktor: {item.coach?.name ?? "—"}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3" />
                        {item.enrolledCount}
                        {item.maxCapacity != null ? `/${item.maxCapacity}` : ""}{" "}
                        uczestników
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4">
                  Brak zajęć na dziś
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Nadchodzące obozy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Nadchodzące obozy</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/wydarzenia">Zarządzaj wydarzeniami</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.upcomingCamps && stats.upcomingCamps.length > 0 ? (
                stats.upcomingCamps.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/admin/rejestracje/oboz/${encodeURIComponent(c.slug)}`}
                    className="flex flex-col gap-0.5 py-2 border-b border-stone-100 dark:border-stone-800 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-800/50 rounded-md -mx-2 px-2 transition-colors"
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.startDate).toLocaleDateString("pl-PL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {c.endDate
                        ? ` – ${new Date(c.endDate).toLocaleDateString("pl-PL", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}`
                        : ""}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4">
                  Brak nadchodzących obozów
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
