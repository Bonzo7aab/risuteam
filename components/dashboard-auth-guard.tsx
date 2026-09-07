"use client";

import { useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useQuery(api.auth.isAuthenticated);
  const currentUser = useQuery(api.authHelpers.getCurrentUser);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated === false && pathname) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/sign-in?redirect=${redirect}`);
    }
  }, [isAuthenticated, router, pathname]);

  useEffect(() => {
    if (
      isAuthenticated === true &&
      currentUser?.role === "admin" &&
      pathname?.startsWith("/dashboard")
    ) {
      router.replace("/admin");
    }
  }, [isAuthenticated, currentUser, pathname, router]);

  if (
    isAuthenticated === undefined ||
    (isAuthenticated === true && currentUser === undefined)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-text-main dark:text-stone-300">Ładowanie...</div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  if (currentUser?.role === "admin") {
    return null;
  }

  return <>{children}</>;
}
