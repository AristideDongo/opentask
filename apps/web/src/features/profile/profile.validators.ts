import { PersonNameSchema } from '@opentask/contracts/auth/credentials';
import { LocaleSchema, TimeZoneSchema } from '@opentask/contracts/me/profile';
import { z } from 'zod';

export const ProfileFormSchema = z.object({
  name: PersonNameSchema,
  locale: LocaleSchema,
  timezone: TimeZoneSchema,
});
export type ProfileForm = z.infer<typeof ProfileFormSchema>;
