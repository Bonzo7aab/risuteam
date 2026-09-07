import { z } from "zod";

export const contactSchema = z.object({
  firstname: z.string().trim().optional(),
  lastname: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .min(1, "Email jest wymagany.")
    .email("Podaj prawidłowy adres e-mail."),
  phone_number: z.string().trim().optional(),
  message: z.string().trim().optional(),
  subject: z.string().trim().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
