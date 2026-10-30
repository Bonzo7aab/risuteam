"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Parent enrollment state for camps / nocowanki (active = non-cancelled).
 */
export function useMyEventEnrollment() {
  const currentUser = useQuery(api.authHelpers.getCurrentUser);
  const isLoggedIn = currentUser !== undefined && currentUser !== null;
  const authReady = currentUser !== undefined;

  const campRegs = useQuery(
    api.registrations.listMyCampRegistrations,
    isLoggedIn ? {} : "skip"
  );
  const nocowankaRegs = useQuery(
    api.registrations.listMyNocowankaRegistrations,
    isLoggedIn ? {} : "skip"
  );

  const campIds = useMemo(() => {
    const set = new Set<string>();
    for (const r of campRegs ?? []) set.add(String(r.campId));
    return set;
  }, [campRegs]);

  const campSlugs = useMemo(() => {
    const set = new Set<string>();
    for (const r of campRegs ?? []) {
      const slug = r.camp?.slug?.trim();
      if (slug) set.add(slug);
    }
    return set;
  }, [campRegs]);

  const nocowankaSlugs = useMemo(() => {
    const set = new Set<string>();
    for (const r of nocowankaRegs ?? []) {
      const slug = r.slug?.trim();
      if (slug) set.add(slug);
    }
    return set;
  }, [nocowankaRegs]);

  const ready =
    authReady &&
    (!isLoggedIn || (campRegs !== undefined && nocowankaRegs !== undefined));

  return {
    ready,
    isLoggedIn,
    isEnrolledInCampId: (campId: Id<"camps"> | string | undefined | null) => {
      if (!campId) return false;
      return campIds.has(String(campId));
    },
    isEnrolledInCampSlug: (slug: string | undefined | null) => {
      const s = slug?.trim();
      if (!s) return false;
      return campSlugs.has(s);
    },
    isEnrolledInNocowanka: (slug: string | undefined | null) => {
      const s = slug?.trim();
      if (!s) return false;
      return nocowankaSlugs.has(s);
    },
  };
}
