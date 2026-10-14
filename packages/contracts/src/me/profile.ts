import { z } from 'zod';
import { PersonNameSchema } from '../auth/credentials';
import { IdSchema, nonEmptyPatch } from '../common/primitives';

export const LOCALES = ['fr', 'en'] as const;
export const LocaleSchema = z.enum(LOCALES);
export type Locale = z.infer<typeof LocaleSchema>;

const isValidTimeZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export const TimeZoneSchema = z
  .string()
  .max(64)
  .refine(isValidTimeZone, { error: 'Fuseau horaire inconnu.' });

export const MeSchema = z.object({
  id: IdSchema,
  email: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  emailVerified: z.boolean(),
  locale: LocaleSchema,
  timezone: z.string(),
});
export type Me = z.infer<typeof MeSchema>;

export const UpdateProfileInputSchema = nonEmptyPatch({
  name: PersonNameSchema,
  locale: LocaleSchema,
  timezone: TimeZoneSchema,
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
