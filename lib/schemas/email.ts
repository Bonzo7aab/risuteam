import { z } from "zod";

const newsletterClassSchema = z.object({
  title: z.string(),
  ageRange: z.string(),
  description: z.string(),
  enrollUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
});

const newsletterCampSchema = z.object({
  dateLabel: z.string(),
  title: z.string(),
  description: z.string(),
  detailsUrl: z.string().url().optional(),
});

const newsletterStorySchema = z.object({
  title: z.string(),
  quote: z.string(),
  author: z.string(),
  authorMeta: z.string().optional(),
  readMoreUrl: z.string().url().optional(),
});

export const sendNewsletterSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  monthLabel: z.string().optional(),
  tagline: z.string().optional(),
  classes: z.array(newsletterClassSchema).optional(),
  camps: z.array(newsletterCampSchema).optional(),
  story: newsletterStorySchema.optional(),
  unsubscribeUrl: z.string().url().optional(),
  baseUrl: z.string().url().optional(),
});

/** Body for internal newsletter HTML render (no recipient / subject). */
export const newsletterTemplateSchema = sendNewsletterSchema.omit({
  to: true,
  subject: true,
});

export type NewsletterTemplateInput = z.infer<typeof newsletterTemplateSchema>;

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

export type SendNewsletterInput = z.infer<typeof sendNewsletterSchema>;
export type SendCampReminderInput = z.infer<typeof sendCampReminderSchema>;
