import { describe, expect, it } from 'vitest';
import { CreateApiTokenInputSchema, scopeForMethod } from './api-token';

describe('scopeForMethod', () => {
  it('maps safe methods to read', () => {
    expect(scopeForMethod('GET')).toBe('read');
    expect(scopeForMethod('head')).toBe('read');
  });

  it('maps every other method to write', () => {
    for (const method of ['POST', 'PATCH', 'PUT', 'DELETE'])
      expect(scopeForMethod(method)).toBe('write');
  });
});

describe('CreateApiTokenInputSchema', () => {
  it('defaults to 90 days and deduplicates scopes', () => {
    expect(CreateApiTokenInputSchema.parse({ name: 'Claude', scopes: ['read', 'read'] })).toEqual({
      name: 'Claude',
      scopes: ['read'],
      expiresInDays: 90,
    });
  });

  it('rejects tokens without scope or with an unsupported lifetime', () => {
    expect(CreateApiTokenInputSchema.safeParse({ name: 'x', scopes: [] }).success).toBe(false);
    expect(
      CreateApiTokenInputSchema.safeParse({ name: 'x', scopes: ['read'], expiresInDays: 7 })
        .success,
    ).toBe(false);
  });
});
