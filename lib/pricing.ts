/** Default monthly class fee in grosze (240 zł). Single source for marketing fallbacks. */
export const DEFAULT_MONTHLY_FEE_GROSZE = 24_000;

export function formatPlnFromGrosze(grosze: number): string {
  const zl = grosze / 100;
  return Number.isInteger(zl) ? `${zl} zł` : `${zl.toFixed(2)} zł`;
}

export function formatPlnAmount(pln: number): string {
  return Number.isInteger(pln) ? `${pln} zł` : `${pln.toFixed(2)} zł`;
}

/** Grosze → whole złoty string for display (e.g. "240"). */
export function groszeToZlString(grosze: number): string {
  const zl = grosze / 100;
  return Number.isInteger(zl) ? String(zl) : zl.toFixed(2);
}
