"use client";

import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Menu,
  MenuTrigger,
  MenuPanel,
  MenuItem,
  MenuSeparator,
} from "@/components/animate-ui/components/base/menu";
import { cn } from "@/lib/utils";

type AccountUser = {
  name?: string;
  email?: string;
  role?: string;
} | null;

function getInitials(user: AccountUser): string {
  if (!user) return "?";
  if (user.name?.trim()) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase().slice(0, 2);
    }
    return user.name.slice(0, 2).toUpperCase();
  }
  if (user.email?.trim()) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return "?";
}

const panelClass =
  "risu-card min-w-64 overflow-hidden rounded-2xl border-0 p-1.5 shadow-card ring-1 ring-black/5 dark:bg-[#2a2015] dark:shadow-card-dark dark:ring-white/10";

const itemClass =
  "cursor-pointer gap-3 rounded-xl px-2.5 py-2";

export function AccountMenu({
  isAuthenticated,
  currentUser,
}: {
  isAuthenticated: boolean;
  currentUser: AccountUser;
}) {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const isAdmin = currentUser?.role === "admin";
  const displayName =
    currentUser?.name?.trim() || currentUser?.email || "Konto";
  const initials = getInitials(currentUser);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <Menu>
      <MenuTrigger
        className={cn(
          "group inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl py-0 pl-1 pr-1.5",
          "text-stone-600 transition-colors duration-200",
          "hover:bg-stone-100/90 hover:text-text-main",
          "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "aria-expanded:bg-primary/10 aria-expanded:text-primary",
          "dark:text-stone-300 dark:hover:bg-white/[0.07] dark:hover:text-white",
        )}
        aria-label="Konto"
      >
        {isAuthenticated && currentUser ? (
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {initials}
          </span>
        ) : (
          <span className="flex size-7 items-center justify-center rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            <span className="material-symbols-outlined text-[18px]" aria-hidden>
              person
            </span>
          </span>
        )}
        <span
          aria-hidden
          className="material-symbols-outlined inline-flex size-[18px] items-center justify-center text-[18px]! leading-none transition-transform duration-200 ease-out group-aria-expanded:rotate-180"
        >
          expand_more
        </span>
      </MenuTrigger>
      <MenuPanel
        align="end"
        sideOffset={10}
        className={panelClass}
        highlightClassName="rounded-xl bg-primary/10"
      >
        {isAuthenticated && currentUser ? (
          <>
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight text-stone-900 dark:text-white">
                  {displayName}
                </p>
                {currentUser.email && currentUser.name?.trim() ? (
                  <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                    {currentUser.email}
                  </p>
                ) : null}
                {isAdmin ? (
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                    Administrator
                  </p>
                ) : null}
              </div>
            </div>
            <MenuSeparator className="mx-1 bg-stone-200/80 dark:bg-stone-700/80" />
            <MenuItem
              onClick={() => router.push(isAdmin ? "/admin" : "/dashboard")}
              className={itemClass}
            >
              <span className="risu-icon-well size-9" aria-hidden>
                <span className="material-symbols-outlined text-[20px]">
                  {isAdmin ? "admin_panel_settings" : "dashboard"}
                </span>
              </span>
              <span className="text-sm font-semibold leading-tight">
                {isAdmin ? "Panel administratora" : "Panel rodzica"}
              </span>
            </MenuItem>
            <MenuSeparator className="mx-1 bg-stone-200/80 dark:bg-stone-700/80" />
            <MenuItem
              variant="destructive"
              onClick={handleSignOut}
              className={itemClass}
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400"
                aria-hidden
              >
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
              </span>
              <span className="text-sm font-semibold leading-tight">
                Wyloguj się
              </span>
            </MenuItem>
          </>
        ) : (
          <>
            <p className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400 dark:text-stone-500">
              Konto
            </p>
            <MenuItem
              onClick={() => router.push("/sign-in")}
              className={itemClass}
            >
              <span className="risu-icon-well size-9" aria-hidden>
                <span className="material-symbols-outlined text-[20px]">
                  login
                </span>
              </span>
              <span className="text-sm font-semibold leading-tight">
                Zaloguj się
              </span>
            </MenuItem>
            <MenuItem
              onClick={() => router.push("/sign-up")}
              className={itemClass}
            >
              <span className="risu-icon-well size-9" aria-hidden>
                <span className="material-symbols-outlined text-[20px]">
                  person_add
                </span>
              </span>
              <span className="text-sm font-semibold leading-tight">
                Zarejestruj się
              </span>
            </MenuItem>
          </>
        )}
      </MenuPanel>
    </Menu>
  );
}
