import { z } from "zod";

function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export const contactSchema = z.object({
  firstname: z
    .string()
    .trim()
    .min(1, "Podaj imię.")
    .max(80, "Imię jest zbyt długie."),
  lastname: z
    .string()
    .trim()
    .min(1, "Podaj nazwisko.")
    .max(80, "Nazwisko jest zbyt długie."),
  email: z
    .string()
    .trim()
    .min(1, "Podaj adres e-mail.")
    .email("Podaj prawidłowy adres e-mail.")
    .max(254, "Adres e-mail jest zbyt długi."),
  phone_number: z
    .string()
    .trim()
    .max(32, "Numer telefonu jest zbyt długi.")
    .refine((value) => {
      if (!value) return true;
      const digits = phoneDigits(value);
      return digits.length >= 9 && digits.length <= 15;
    }, "Podaj prawidłowy numer telefonu."),
  message: z
    .string()
    .trim()
    .min(1, "Napisz wiadomość.")
    .min(10, "Wiadomość jest zbyt krótka (min. 10 znaków).")
    .max(5000, "Wiadomość jest zbyt długa."),
  subject: z.string().trim().max(200, "Temat jest zbyt długi.").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactFieldName =
  | "firstname"
  | "lastname"
  | "email"
  | "phone_number"
  | "message"
  | "subject";

export function contactFieldErrors(
  error: z.ZodError,
): Partial<Record<ContactFieldName, string>> {
  const out: Partial<Record<ContactFieldName, string>> = {};
  for (const issue of error.errors) {
    const key = issue.path[0];
    if (
      key === "firstname" ||
      key === "lastname" ||
      key === "email" ||
      key === "phone_number" ||
      key === "message" ||
      key === "subject"
    ) {
      if (!out[key]) out[key] = issue.message;
    }
  }
  return out;
}

export function validateContactField(
  name: ContactFieldName,
  value: string,
): string | undefined {
  const result = contactSchema.shape[name].safeParse(value);
  if (result.success) return undefined;
  return result.error.errors[0]?.message;
}
