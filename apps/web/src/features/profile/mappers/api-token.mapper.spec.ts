import { describe, expect, it } from 'vitest';
import { toApiTokenVM } from './api-token.mapper';

const token = {
  id: 't1',
  name: 'Claude',
  hint: 'otk_ABCDEFGH…',
  scopes: ['read' as const],
  lastUsedAt: null,
  expiresAt: '2026-10-20T00:00:00.000Z',
  createdAt: '2026-10-01T00:00:00.000Z',
};

describe('toApiTokenVM', () => {
  it('flags expired tokens', () => {
    expect(toApiTokenVM(token, new Date('2026-10-14T00:00:00Z')).isExpired).toBe(false);
    expect(toApiTokenVM(token, new Date('2026-10-21T00:00:00Z')).isExpired).toBe(true);
  });
});
