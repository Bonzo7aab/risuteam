"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const STEPS = [
  {
    title: "Strona główna",
    description:
      "Podsumowanie: dzieci, nadchodzące zajęcia, płatności i szybkie akcje. Zapisy na zajęcia i obozy znajdziesz w sekcji Szybkie akcje lub bezpośrednio pod adresem Zapisy.",
    driverStepId: "nav-home",
  },
  {
    title: "Moje dzieci",
    description:
      "Dodawaj i edytuj profile dzieci (imię, nazwisko, data urodzenia, PESEL). Dane są wykorzystywane przy zapisach na zajęcia i obozy.",
    driverStepId: "nav-dzieci",
  },
  {
    title: "Zajęcia",
    description:
      "Zapisy na zajęcia i obozy: wybierz aktywność, uzupełnij dane i potwierdź zgłoszenie. Tutaj znajdziesz także listę swoich zapisów.",
    driverStepId: "nav-zajecia",
  },
  {
    title: "Płatności",
    description:
      "Status zapisów: nadchodzące, do zapłaty i przeszłe. Płatności realizujemy przelewem — szczegóły na stronie Cennik.",
    driverStepId: "nav-platnosci",
  },
  {
    title: "Ustawienia",
    description:
      "Ustawienia konta i hasła. Możesz się wylogować z panelu bocznego.",
    driverStepId: "nav-ustawienia",
  },
] as const;

export function DashboardOnboarding() {
  const currentUser = useQuery(api.authHelpers.getCurrentUser);
  const setOnboardingCompleted = useMutation(api.users.setOnboardingCompleted);
  const tourStartedRef = useRef(false);

  useEffect(() => {
    if (
      currentUser === undefined ||
      currentUser?.role === "admin" ||
      currentUser?.onboardingCompletedAt != null
    ) {
      return;
    }
    if (tourStartedRef.current) {
      return;
    }
    tourStartedRef.current = true;

    const driverObj = driver({
      showProgress: true,
      progressText: "{{current}} z {{total}}",
      nextBtnText: "Dalej",
      prevBtnText: "Wstecz",
      doneBtnText: "Zakończ",
      popoverClass: "risu-driver-popover",
      steps: STEPS.map((step) => ({
        element: `[data-onboarding="${step.driverStepId}"]`,
        popover: {
          title: step.title,
          description: step.description,
        },
      })),
      onDestroyed: () => {
        setOnboardingCompleted();
      },
    });

    driverObj.drive();
  }, [currentUser?.onboardingCompletedAt, setOnboardingCompleted]);

  return null;
}
