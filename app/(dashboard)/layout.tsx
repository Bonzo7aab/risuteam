import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import { DashboardOnboarding } from "@/components/dashboard-onboarding";
import { AppSidebar } from "@/components/app-sidebar";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { parentDashboardNavItems } from "@/lib/nav/parent-dashboard-nav";

export const dynamic = "force-dynamic";

function DashboardSidebarFooter() {
  return (
    <div className="space-y-3 border-t border-stone-100 dark:border-stone-800 pt-4">
      <SignOutButton className="w-full justify-center h-10 text-sm font-medium text-stone-500 hover:text-text-main dark:text-stone-400 border border-stone-200 dark:border-stone-700 bg-transparent hover:bg-stone-50 dark:hover:bg-stone-800/80" />
    </div>
  );
}

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGuard>
      <DashboardOnboarding />
      <div className="min-h-screen md:mt-10 bg-background-light dark:bg-background-dark flex">
        <AppSidebar
          items={[...parentDashboardNavItems]}
          parentBrand={{
            href: "/dashboard",
            title: "Risu Team",
            subtitle: "Panel Rodzica",
          }}
          footer={<DashboardSidebarFooter />}
        />
        <main className="flex-1 min-w-0 p-4 pb-[calc(env(safe-area-inset-bottom)+6.2rem)] sm:p-6 sm:pb-[calc(env(safe-area-inset-bottom)+6.2rem)] md:p-8 md:pb-8 lg:p-10 lg:pb-10">
          <div className="w-full max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </DashboardAuthGuard>
  );
}
