import { z } from "zod";

export const arrivalDetailsSchema = z.object({
  date: z.string(),
  checkIn: z.string(),
  locationName: z.string(),
  locationAddress: z.string().optional(),
});

export const packingItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

export const sendCampReminderSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  title: z.string().optional(),
  introText: z.string().optional(),
  arrivalDetails: arrivalDetailsSchema.optional(),
  packingItems: z.array(packingItemSchema).optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().url().optional(),
  heroImageUrl: z.string().url().optional(),
  heroOverlayText: z.string().optional(),
  tagline: z.string().optional(),
  footerGreeting: z.string().optional(),
  footerTeamName: z.string().optional(),
  baseUrl: z.string().url().optional(),
});

export type SendCampReminderInput = z.infer<typeof sendCampReminderSchema>;
