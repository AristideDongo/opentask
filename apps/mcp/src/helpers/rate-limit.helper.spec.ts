import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rate-limit.helper';

describe('createRateLimiter', () => {
  it('allows up to the limit per key and window', () => {
    const limiter = createRateLimiter(2);
    expect(limiter.allow('a', 0)).toBe(true);
    expect(limiter.allow('a', 1)).toBe(true);
    expect(limiter.allow('a', 2)).toBe(false);
    expect(limiter.allow('b', 2)).toBe(true);
    expect(limiter.allow('a', 60_001)).toBe(true);
  });
});
