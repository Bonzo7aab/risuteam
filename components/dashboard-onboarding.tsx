"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

export const DASHBOARD_TOUR_EVENT = "risu:start-dashboard-tour";

const STEPS = [
  {
    title: "Moje dzieci",
    description:
      "Dodawaj i edytuj profile dzieci — imię, data urodzenia i PESEL. Te dane są używane przy zapisach na zajęcia i obozy.",
    driverStepId: "nav-dzieci",
  },
  {
    title: "Zajęcia",
    description:
      "Zapisuj dzieci na zajęcia i obozy oraz sprawdzaj listę aktywnych zgłoszeń.",
    driverStepId: "nav-zajecia",
  },
  {
    title: "Płatności",
    description:
      "Podgląd statusów: nadchodzące, do zapłaty i zakończone. Płatności realizujemy przelewem — szczegóły znajdziesz w Cenniku.",
    driverStepId: "nav-platnosci",
  },
  {
    title: "Ustawienia",
    description:
      "Zarządzaj danymi konta i hasłem. Przewodnik po panelu możesz uruchomić ponownie właśnie tutaj.",
    driverStepId: "nav-ustawienia",
  },
] as const;

export function requestDashboardTour() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DASHBOARD_TOUR_EVENT));
}

function findTourTarget(driverStepId: string): Element | null {
  const nodes = Array.from(
    document.querySelectorAll(`[data-onboarding="${driverStepId}"]`)
  );
  return (
    nodes.find((node) => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }) ?? null
  );
}

function buildSteps(): DriveStep[] {
  return STEPS.map((step) => {
    const el = findTourTarget(step.driverStepId);
    return {
      ...(el ? { element: el } : {}),
      popover: {
        title: step.title,
        description: step.description,
        side: el ? "right" : "over",
        align: "start",
      },
    };
  });
}

type StartTourOptions = {
  onComplete?: () => void;
};

let activeDriver: ReturnType<typeof driver> | null = null;

export function startDashboardTour(options?: StartTourOptions) {
  if (typeof window === "undefined") return;

  if (activeDriver?.isActive()) {
    activeDriver.destroy();
  }

  const driverObj = driver({
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayColor: "#1c160d",
    overlayOpacity: 0.55,
    stagePadding: 8,
    stageRadius: 14,
    popoverOffset: 14,
    disableActiveInteraction: true,
    showProgress: true,
    progressText: "{{current}} / {{total}}",
    nextBtnText: "Dalej",
    prevBtnText: "Wstecz",
    doneBtnText: "Zakończ",
    popoverClass: "risu-driver-popover",
    steps: buildSteps(),
    onHighlighted: (element) => {
      element?.setAttribute("data-tour-focused", "true");
    },
    onDeselected: (element) => {
      element?.removeAttribute("data-tour-focused");
    },
    onDestroyed: () => {
      document
        .querySelectorAll("[data-tour-focused]")
        .forEach((node) => node.removeAttribute("data-tour-focused"));
      activeDriver = null;
      options?.onComplete?.();
    },
  });

  activeDriver = driverObj;
  driverObj.drive();
}

export function DashboardOnboarding() {
  const currentUser = useQuery(api.authHelpers.getCurrentUser);
  const setOnboardingCompleted = useMutation(api.users.setOnboardingCompleted);
  const autoStartedRef = useRef(false);

  useEffect(() => {
    const markDone = () => {
      void setOnboardingCompleted();
    };

    const onRequestTour = () => {
      startDashboardTour({ onComplete: markDone });
    };

    window.addEventListener(DASHBOARD_TOUR_EVENT, onRequestTour);
    return () => {
      window.removeEventListener(DASHBOARD_TOUR_EVENT, onRequestTour);
    };
  }, [setOnboardingCompleted]);

  useEffect(() => {
    if (
      currentUser === undefined ||
      currentUser?.role === "admin" ||
      currentUser?.onboardingCompletedAt != null ||
      autoStartedRef.current
    ) {
      return;
    }

    autoStartedRef.current = true;
    const timer = window.setTimeout(() => {
      startDashboardTour({
        onComplete: () => {
          void setOnboardingCompleted();
        },
      });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [currentUser, setOnboardingCompleted]);

  return null;
}
