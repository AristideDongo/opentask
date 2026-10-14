import { describe, expect, it } from 'vitest';
import { positionBetween } from './position.helper';

describe('positionBetween', () => {
  it('calcule les positions d’insertion', () => {
    expect(positionBetween(null, null)).toBe(1024);
    expect(positionBetween(2048, null)).toBe(3072);
    expect(positionBetween(null, 1024)).toBe(0);
    expect(positionBetween(1024, 2048)).toBe(1536);
  });
});
