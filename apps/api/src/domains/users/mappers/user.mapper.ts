import { type Me, MeSchema } from '@opentask/contracts/me/profile';
import type { User } from '@opentask/database/client';

export const toMeDto = (user: User): Me =>
  MeSchema.parse({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    emailVerified: user.emailVerified,
    locale: user.locale === 'en' ? 'en' : 'fr',
    timezone: user.timezone,
  });
