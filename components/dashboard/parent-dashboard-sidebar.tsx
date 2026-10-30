"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardSidebarFooter } from "@/components/dashboard/dashboard-sidebar-footer";
import { parentDashboardNavItems } from "@/lib/nav/parent-dashboard-nav";

export function ParentDashboardSidebar() {
  return (
    <AppSidebar
      items={[...parentDashboardNavItems]}
      parentBrand={{
        href: "/dashboard",
        title: "Risu Team",
        subtitle: "Panel Rodzica",
      }}
      footer={<DashboardSidebarFooter />}
    />
  );
}
