import { DashboardAuthGuard } from "@/components/dashboard-auth-guard";
import { DashboardOnboarding } from "@/components/dashboard-onboarding";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardSidebarFooter } from "@/components/dashboard/dashboard-sidebar-footer";
import { parentDashboardNavItems } from "@/lib/nav/parent-dashboard-nav";

export const dynamic = "force-dynamic";

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
