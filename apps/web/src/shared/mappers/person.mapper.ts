import type { Me } from '@opentask/contracts/me/profile';
import type { MeVM, PersonVM } from '../types/person.types';
import { initialsOf } from '../utils/initials';

export const toPersonVM = (ref: { id: string; name: string }): PersonVM => ({
  id: ref.id,
  name: ref.name,
  initials: initialsOf(ref.name),
});

export const toMeVM = (me: Me): MeVM => ({
  ...toPersonVM(me),
  email: me.email,
  emailVerified: me.emailVerified,
  locale: me.locale,
  timezone: me.timezone,
});
