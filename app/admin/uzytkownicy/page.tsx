"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

const ROLE_OPTIONS = [
  { value: "user", label: "Użytkownik" },
  { value: "admin", label: "Admin" },
] as const;

type RoleFilter = "all" | "admin" | "user";
type VerifiedFilter = "all" | "verified" | "unverified";
type SortKey = "name" | "email" | "children" | "created";
type SortDirection = "asc" | "desc";

type AdminUser = {
  _id: Id<"users">;
  _creationTime: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  emailVerificationTime?: number;
  onboardingCompletedAt?: number;
  isAnonymous?: boolean;
  childrenCount: number;
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function roleLabel(role?: string): string {
  return role === "admin" ? "Admin" : "Użytkownik";
}

function isAdminRole(role?: string): boolean {
  return role === "admin";
}

function SortHeader({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-bold"
      onClick={onClick}
    >
      {label}
      <span
        className={cn(
          "material-symbols-outlined text-base",
          active ? "text-primary" : "text-stone-400"
        )}
      >
        {active ? (direction === "asc" ? "arrow_upward" : "arrow_downward") : "swap_vert"}
      </span>
    </button>
  );
}

export default function AdminUzytkownicyPage() {
  const users = useQuery(api.users.listForAdmin);
  const updateUser = useMutation(api.users.updateForAdmin);
  const removeUser = useMutation(api.users.removeForAdmin);
  const currentUser = useQuery(api.authHelpers.getCurrentUser);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(0);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("user");
  const [saving, setSaving] = useState(false);
  const [userPendingDelete, setUserPendingDelete] = useState<AdminUser | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (!users) return { total: 0, admins: 0, verified: 0, withChildren: 0 };
    return {
      total: users.length,
      admins: users.filter((u) => isAdminRole(u.role)).length,
      verified: users.filter((u) => u.emailVerificationTime != null).length,
      withChildren: users.filter((u) => u.childrenCount > 0).length,
    };
  }, [users]);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    let rows = users.filter((u) => {
      if (roleFilter === "admin" && !isAdminRole(u.role)) return false;
      if (roleFilter === "user" && isAdminRole(u.role)) return false;
      if (verifiedFilter === "verified" && u.emailVerificationTime == null) return false;
      if (verifiedFilter === "unverified" && u.emailVerificationTime != null) return false;
      if (!q) return true;
      const haystack = [u.name, u.email, u.phone, roleLabel(u.role)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    const dir = sortDirection === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      if (sortKey === "name") {
        return dir * (a.name ?? "").localeCompare(b.name ?? "", "pl");
      }
      if (sortKey === "email") {
        return dir * (a.email ?? "").localeCompare(b.email ?? "", "pl");
      }
      if (sortKey === "children") {
        return dir * (a.childrenCount - b.childrenCount);
      }
      return dir * (a._creationTime - b._creationTime);
    });

    return rows;
  }, [users, search, roleFilter, verifiedFilter, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "created" ? "desc" : "asc");
    }
    setPage(0);
  };

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setFormName(u.name ?? "");
    setFormRole(u.role === "admin" ? "admin" : "user");
    setError(null);
  };

  const closeEdit = () => {
    setEditingUser(null);
    setFormName("");
    setFormRole("user");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await updateUser({
        id: editingUser._id,
        name: formName.trim() || undefined,
        role: formRole || undefined,
      });
      setSuccess("Zapisano zmiany.");
      closeEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!userPendingDelete) return;
    const id = userPendingDelete._id;
    setError(null);
    setSuccess(null);
    setDeleting(true);
    try {
      await removeUser({ id });
      setSuccess("Użytkownik usunięty.");
      setUserPendingDelete(null);
      if (editingUser?._id === id) closeEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
      setUserPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setVerifiedFilter("all");
    setPage(0);
  };

  const hasActiveFilters =
    search.trim() !== "" || roleFilter !== "all" || verifiedFilter !== "all";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-white">
            Użytkownicy
          </h1>
          <p className="mt-1 text-sm text-text-light dark:text-stone-400">
            Zarządzaj kontami, rolami i weryfikacją e-mail.
          </p>
        </div>
        {users !== undefined && (
          <p className="text-sm text-text-light dark:text-stone-400">
            {filtered.length === stats.total
              ? `${stats.total} kont`
              : `${filtered.length} z ${stats.total} kont`}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Wszyscy", stats.total, "group"],
            ["Administratorzy", stats.admins, "shield_person"],
            ["Zweryfikowani", stats.verified, "mark_email_read"],
            ["Z dziećmi", stats.withChildren, "child_care"],
          ] as const
        ).map(([label, value, icon]) => (
          <div
            key={label}
            className="rounded-xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900/60"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-text-light dark:text-stone-400">
              <span className="material-symbols-outlined text-base">{icon}</span>
              {label}
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-text-main dark:text-white">
              {users === undefined ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-stone-200 bg-stone-100 p-3 dark:border-stone-700 dark:bg-stone-800/60">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Szukaj po imieniu, e-mailu lub telefonie…"
            className="min-w-[16rem] flex-1 bg-white dark:bg-stone-900"
          />
          <Button
            variant="outline"
            className="bg-white dark:bg-stone-900"
            disabled={!hasActiveFilters}
            onClick={clearFilters}
          >
            Wyczyść filtry
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(
            [
              ["all", "Wszystkie role"],
              ["admin", "Admin"],
              ["user", "Użytkownik"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                roleFilter === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-stone-300 bg-white text-stone-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200"
              )}
              onClick={() => {
                setRoleFilter(value);
                setPage(0);
              }}
            >
              {label}
            </button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-stone-300 sm:inline-block dark:bg-stone-600" />
          {(
            [
              ["all", "Wszystkie e-maile"],
              ["verified", "Zweryfikowane"],
              ["unverified", "Niezweryfikowane"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                verifiedFilter === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-stone-300 bg-white text-stone-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200"
              )}
              onClick={() => {
                setVerifiedFilter(value);
                setPage(0);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
          {success}
        </div>
      )}

      <Card className="overflow-hidden border-stone-200 dark:border-stone-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/80">
                  <th className="px-4 py-3 text-left">
                    <SortHeader
                      label="Użytkownik"
                      active={sortKey === "name"}
                      direction={sortDirection}
                      onClick={() => toggleSort("name")}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader
                      label="E-mail"
                      active={sortKey === "email"}
                      direction={sortDirection}
                      onClick={() => toggleSort("email")}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Telefon</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader
                      label="Dzieci"
                      active={sortKey === "children"}
                      direction={sortDirection}
                      onClick={() => toggleSort("children")}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader
                      label="Dołączył"
                      active={sortKey === "created"}
                      direction={sortDirection}
                      onClick={() => toggleSort("created")}
                    />
                  </th>
                  <th className="px-4 py-3 text-right font-bold">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {users === undefined ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-text-light dark:text-stone-400"
                    >
                      Ładowanie…
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-text-light dark:text-stone-400"
                    >
                      Brak wyników.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((u) => {
                    const isSelf = currentUser?._id === u._id;
                    const verified = u.emailVerificationTime != null;
                    return (
                      <tr
                        key={u._id}
                        className="border-b border-stone-100 transition-colors hover:bg-stone-50/80 dark:border-stone-800 dark:hover:bg-stone-800/40"
                      >
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-text-main dark:text-white">
                              {u.name?.trim() || (
                                <span className="italic text-text-light dark:text-stone-400">
                                  Brak imienia
                                </span>
                              )}
                              {isSelf && (
                                <span className="ml-1.5 text-xs font-normal text-text-light dark:text-stone-500">
                                  (Ty)
                                </span>
                              )}
                            </p>
                            {u.isAnonymous && (
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                Konto anonimowe
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="max-w-[16rem] truncate text-text-main dark:text-stone-200">
                            {u.email ?? "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-text-light dark:text-stone-400">
                          {u.phone ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                              verified
                                ? "bg-green-100 text-green-800 dark:bg-green-900/35 dark:text-green-200"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/35 dark:text-amber-200"
                            )}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {verified ? "verified" : "pending"}
                            </span>
                            {verified ? "Zweryfikowany" : "Oczekuje"}
                          </span>
                        </td>
                        <td className="px-4 py-3 tabular-nums text-text-main dark:text-stone-200">
                          {u.childrenCount}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-text-light dark:text-stone-400">
                          {formatDate(u._creationTime)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              title="Edytuj"
                              onClick={() => openEdit(u)}
                            >
                              <span className="material-symbols-outlined text-base">
                                edit
                              </span>
                            </Button>
                            {!isSelf && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                title="Usuń"
                                disabled={deleting}
                                onClick={() => setUserPendingDelete(u)}
                              >
                                <span className="material-symbols-outlined text-base">
                                  delete
                                </span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-light dark:text-stone-400">
            Pokazano {currentPage * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE + PAGE_SIZE, filtered.length)} z{" "}
            {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Poprzednia
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Następna
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={userPendingDelete != null}
        onOpenChange={(open) => {
          if (!open && !deleting) setUserPendingDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Usunąć użytkownika?</DialogTitle>
            <DialogDescription>
              {userPendingDelete
                ? `Konto „${userPendingDelete.name?.trim() || userPendingDelete.email || "użytkownik"}” zostanie trwale usunięte wraz z powiązanymi dziećmi i subskrypcjami.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setUserPendingDelete(null)}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting ? "Usuwanie…" : "Usuń użytkownika"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edycja użytkownika</DialogTitle>
            <DialogDescription>
              {editingUser?.email ?? "Zmień imię i rolę konta."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="user-name">Imię / nazwa</Label>
              <Input
                id="user-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="mt-1"
                placeholder="np. Jan Kowalski"
              />
            </div>
            <div>
              <Label>Rola</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormRole(r.value)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      formRole === r.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-stone-300 bg-white text-stone-700 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-text-light dark:text-stone-500">
                E-mail jest ustawiany przy rejestracji i nie można go zmieniać z
                poziomu panelu.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEdit}>
                Anuluj
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Zapisywanie…" : "Zapisz"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
