import { describe, expect, it } from 'vitest';
import { redactUrl } from './redact-url';

describe('redactUrl', () => {
  it('masque les jetons dans les URL journalisées', () => {
    expect(redactUrl('/api/v1/invitations/abc123/accept')).toBe(
      '/api/v1/invitations/[redacted]/accept',
    );
    expect(redactUrl('/api/v1/auth/verify-email?token=xyz&callbackURL=/')).toBe(
      '/api/v1/auth/verify-email?token=[redacted]&callbackURL=/',
    );
    expect(redactUrl('/api/v1/auth/reset-password/tok?callbackURL=x')).toBe(
      '/api/v1/auth/reset-password/[redacted]?callbackURL=x',
    );
  });
});
