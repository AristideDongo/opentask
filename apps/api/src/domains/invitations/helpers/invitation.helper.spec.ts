import { describe, expect, it } from 'vitest';
import { invitationExpiry, invitationStatus, inviteUrl, normalizeEmail } from './invitation.helper';

const now = new Date('2026-01-01T00:00:00Z');

describe('invitations', () => {
  it('expire après 7 jours', () => {
    expect(invitationExpiry(now).toISOString()).toBe('2026-01-08T00:00:00.000Z');
  });

  it('calcule le statut', () => {
    const base = { expiresAt: invitationExpiry(now), acceptedAt: null, revokedAt: null };
    expect(invitationStatus(base, now)).toBe('pending');
    expect(invitationStatus(base, new Date('2026-01-08T00:00:00Z'))).toBe('expired');
    expect(invitationStatus({ ...base, revokedAt: now }, now)).toBe('revoked');
    expect(invitationStatus({ ...base, acceptedAt: now, revokedAt: now }, now)).toBe('accepted');
  });

  it('normalise les adresses et construit le lien', () => {
    expect(normalizeEmail('  Alice@Example.COM ')).toBe('alice@example.com');
    expect(inviteUrl('https://x.org/', 'tok')).toBe('https://x.org/invite/tok');
  });
});
