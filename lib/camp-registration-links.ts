/**
 * When registration is closed, CTAs must not use `href="#"` — that drops the camp
 * segment from the URL in some cases. Use the camp detail path instead.
 */
export function campRegistrationCtaHref(
  registrationHref: string,
  isRegistrationClosed: boolean
): string {
  if (!isRegistrationClosed) return registrationHref;
  const base = registrationHref.replace(/\/rejestracja\/?$/i, "").trim();
  return base.length > 0 ? base : registrationHref;
}

/** Closed > enrolled > open signup. */
export function eventSignupCta(opts: {
  isRegistrationClosed?: boolean;
  isEnrolled?: boolean;
  openLabel?: string;
  enrolledLabel?: string;
  closedLabel?: string;
}): { label: string; disabled: boolean; isEnrolled: boolean } {
  const {
    isRegistrationClosed = false,
    isEnrolled = false,
    openLabel = "Zapisz się",
    enrolledLabel = "Zapisany",
    closedLabel = "Rejestracja zakończona",
  } = opts;
  if (isRegistrationClosed) {
    return { label: closedLabel, disabled: true, isEnrolled: false };
  }
  if (isEnrolled) {
    return { label: enrolledLabel, disabled: true, isEnrolled: true };
  }
  return { label: openLabel, disabled: false, isEnrolled: false };
}
