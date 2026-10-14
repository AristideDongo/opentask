import { describe, expect, it } from 'vitest';
import { RegisterInputSchema } from './credentials';

describe('identifiants', () => {
  it('exige un mot de passe d’au moins 10 caractères', () => {
    expect(
      RegisterInputSchema.safeParse({ name: 'A', email: 'a@b.co', password: 'court' }).success,
    ).toBe(false);
  });
});
