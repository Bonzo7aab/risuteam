import { render } from "@react-email/render";
import type { ReactElement } from "react";

/**
 * Renders a React Email component to an HTML string for sending via Brevo or other providers.
 */
export async function renderEmailToHtml(element: ReactElement): Promise<string> {
  return render(element);
}
