"use client";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { requestDashboardTour } from "@/components/dashboard-onboarding";

export function DashboardSidebarFooter() {
  return (
    <div className="space-y-2 border-t border-stone-100 pt-4 dark:border-stone-800">
      <button
        type="button"
        onClick={() => requestDashboardTour()}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border-0 bg-stone-100 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-200/80 hover:text-text-main dark:bg-stone-800/70 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden>
          menu_book
        </span>
        Przewodnik po panelu
      </button>
      <SignOutButton
        variant="ghost"
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border-0 bg-red-500/10 text-sm font-semibold text-red-600 shadow-none hover:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/20"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden>
          logout
        </span>
        Wyloguj się
      </SignOutButton>
    </div>
  );
}
