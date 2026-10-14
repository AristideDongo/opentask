import { describe, expect, it } from 'vitest';
import { DomainError } from '../../../shared/errors/domain.error';
import { assertAllMembers, assertAllowed, assertCan, assertIsMember } from './access.helper';

describe('accès au workspace', () => {
  it('un non-membre reçoit NOT_FOUND', () => {
    expect(() => assertIsMember(null)).toThrow(expect.objectContaining({ code: 'NOT_FOUND' }));
    const m = { workspaceId: 'w', userId: 'u', role: 'guest' as const };
    expect(assertIsMember(m)).toBe(m);
  });

  it('traduit les refus en erreurs explicites', () => {
    expect(() => assertCan('member', 'workspace.update')).toThrow(DomainError);
    expect(() => assertAllowed({ allowed: false, reason: 'own_role' })).toThrow(
      'Vous ne pouvez pas modifier votre propre rôle.',
    );
    expect(() => assertAllowed({ allowed: true })).not.toThrow();
  });

  it('vérifie que les personnes citées sont membres', () => {
    expect(() => assertAllMembers(['a', 'b'], ['a', 'b', 'c'])).not.toThrow();
    expect(() => assertAllMembers(['z'], ['a'])).toThrow(
      expect.objectContaining({ code: 'VALIDATION_FAILED' }),
    );
  });
});
