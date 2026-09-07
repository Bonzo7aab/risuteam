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
