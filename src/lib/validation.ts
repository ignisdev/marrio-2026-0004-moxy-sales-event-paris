import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1),
  eventSlug: z.string().min(1),
  preferredLocale: z.enum(["en", "fr"]).default("en"),
  termsAccepted: z.literal(true),
});

export const loginSchema = z.object({
  email: z.email(),
});

export const scanSchema = z.object({
  qrPayload: z.string().min(1),
  locale: z.enum(["en", "fr"]).default("en"),
  uid: z.string().min(1),
});
