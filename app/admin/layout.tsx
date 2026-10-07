import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { AppSidebar } from "@/components/app-sidebar";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { adminNavItems } from "@/lib/nav/admin-nav";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen min-w-0 bg-background-light dark:bg-background-dark">
        <AppSidebar
          items={[...adminNavItems]}
          title="Panel Administratora"
          titleIcon="admin_panel_settings"
          footer={
            <SignOutButton
              variant="ghost"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-red-500/10 py-2.5 text-sm font-semibold text-red-600 shadow-none hover:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/20"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden>
                logout
              </span>
              Wyloguj się
            </SignOutButton>
          }
        />
        <main className="w-full min-w-0 flex-1 px-3 pt-6 pb-[calc(var(--risu-mobile-bottom-nav-h)+1.25rem)] sm:px-6 md:px-10 md:pb-10 md:pt-10">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
