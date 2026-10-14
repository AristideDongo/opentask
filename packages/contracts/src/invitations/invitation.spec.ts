import { describe, expect, it } from 'vitest';
import { CreateInvitationInputSchema } from './invitation';

describe('invitations', () => {
  it('normalise l’e-mail et applique le rôle par défaut', () => {
    expect(CreateInvitationInputSchema.parse({ email: ' Bob@Example.org ' })).toEqual({
      email: 'bob@example.org',
      role: 'member',
    });
  });

  it('refuse l’invitation d’un propriétaire', () => {
    expect(CreateInvitationInputSchema.safeParse({ email: 'a@b.co', role: 'owner' }).success).toBe(
      false,
    );
  });
});
