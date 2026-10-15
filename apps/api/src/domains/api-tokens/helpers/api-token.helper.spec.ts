import { describe, expect, it } from 'vitest';
import { ApiTokenScopeError } from '../errors/api-token.errors';
import {
  assertTokenScope,
  identityFromToken,
  isApiToken,
  shouldRefreshLastUsed,
  tokenExpiry,
  tokenHint,
} from './api-token.helper';

const now = new Date('2026-10-14T10:00:00Z');

describe('api tokens', () => {
  it('recognises the token prefix and builds a short hint', () => {
    expect(isApiToken('otk_abc')).toBe(true);
    expect(isApiToken('session')).toBe(false);
    expect(tokenHint('otk_ABCDEFGHIJKLMNOP')).toBe('otk_ABCDEFGH…');
  });

  it('computes the expiry date', () => {
    expect(tokenExpiry(now, 30).toISOString()).toBe('2026-11-13T10:00:00.000Z');
  });

  it('refuses expired tokens and drops unknown scopes', () => {
    const facts = {
      userId: 'u1',
      scopes: ['read', 'admin'],
      expiresAt: new Date('2026-10-15T00:00:00Z'),
    };
    expect(identityFromToken(facts, now)).toEqual({ userId: 'u1', scopes: ['read'] });
    expect(identityFromToken({ ...facts, expiresAt: now }, now)).toBeNull();
  });

  it('requires the write scope for modifications', () => {
    expect(() => assertTokenScope({ userId: 'u1', scopes: ['read'] }, 'write')).toThrow(
      ApiTokenScopeError,
    );
    expect(() =>
      assertTokenScope({ userId: 'u1', scopes: ['read', 'write'] }, 'write'),
    ).not.toThrow();
  });

  it('refreshes the last use at most once a minute', () => {
    expect(shouldRefreshLastUsed(null, now)).toBe(true);
    expect(shouldRefreshLastUsed(new Date(now.getTime() - 30_000), now)).toBe(false);
    expect(shouldRefreshLastUsed(new Date(now.getTime() - 61_000), now)).toBe(true);
  });
});
