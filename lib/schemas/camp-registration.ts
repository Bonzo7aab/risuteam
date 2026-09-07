import { z } from "zod";

const optionalString = z
  .optional(z.string())
  .transform((s) => (s == null || s === "" ? undefined : s.trim()));

const checkboxChecked = (v: string | undefined) =>
  v === "on" || v === "1" || v === "true";

export const campRegistrationSchema = z
  .object({
    campSlug: z.string().optional(),
    childName: z.string().trim().min(1, "Podaj imię dziecka."),
    childSurname: z.string().trim().min(1, "Podaj nazwisko dziecka."),
    childDob: z.string().trim().min(1, "Podaj datę urodzenia dziecka."),
    childPesel: optionalString,
    dietary: optionalString,
    allergies: optionalString,
    medicalNotes: optionalString,
    parentName: z.string().trim().min(1, "Podaj imię i nazwisko opiekuna."),
    parentPhone: optionalString,
    parentEmail: z
      .string()
      .trim()
      .min(1, "Podaj adres e-mail.")
      .email("Podaj prawidłowy adres e-mail."),
    medicalConsent: z.string().optional(),
    terms: z.string().optional(),
  })
  .refine(
    (data) => checkboxChecked(data.medicalConsent) && checkboxChecked(data.terms),
    { message: "Zaakceptuj wymagane zgody." }
  );

/** Step 1 only: child name and DOB */
export const campRegistrationStep1Schema = z.object({
  childName: z.string().trim().min(1, "Podaj imię dziecka."),
  childSurname: z.string().trim().min(1, "Podaj nazwisko dziecka."),
  childDob: z.string().trim().min(1, "Podaj datę urodzenia dziecka."),
});

/** API body: same shape but consent not required (optional for backward compatibility) */
export const campRegistrationApiSchema = z.object({
  campSlug: z.string().optional(),
  childName: z.string().trim().min(1, "Wypełnij wymagane pola"),
  childSurname: z.string().trim().min(1, "Wypełnij wymagane pola"),
  childDob: optionalString,
  childPesel: optionalString,
  dietary: optionalString,
  allergies: optionalString,
  medicalNotes: optionalString,
  parentName: z.string().trim().min(1, "Wypełnij wymagane pola"),
  parentPhone: optionalString,
  parentEmail: z
    .string()
    .trim()
    .min(1, "Wypełnij wymagane pola")
    .email("Podaj prawidłowy adres e-mail."),
});

export type CampRegistrationInput = z.infer<typeof campRegistrationSchema>;
export type CampRegistrationApiInput = z.infer<typeof campRegistrationApiSchema>;
export type CampRegistrationStep1Input = z.infer<typeof campRegistrationStep1Schema>;
