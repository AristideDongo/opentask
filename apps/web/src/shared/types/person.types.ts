import type { Locale } from '@opentask/contracts/me/profile';

export interface PersonVM {
  id: string;
  name: string;
  initials: string;
}

export interface MeVM extends PersonVM {
  email: string;
  emailVerified: boolean;
  locale: Locale;
  timezone: string;
}
