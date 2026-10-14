import { describe, expect, it } from 'vitest';
import { UpdateProfileInputSchema } from './profile';

describe('profil', () => {
  it('valide les fuseaux horaires IANA et refuse un patch vide', () => {
    expect(UpdateProfileInputSchema.safeParse({ timezone: 'Africa/Abidjan' }).success).toBe(true);
    expect(UpdateProfileInputSchema.safeParse({ timezone: 'Mars/Olympus' }).success).toBe(false);
    expect(UpdateProfileInputSchema.safeParse({}).success).toBe(false);
  });
});
