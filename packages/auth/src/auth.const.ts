export const AUTH_BASE_PATH = '/api/v1/auth';

export const CLIENT_IP_HEADER = 'x-opentask-client-ip';

export const COOKIE_PREFIX = 'opentask';

export const MAX_PASSWORD_LENGTH = 128;

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;

export const ARGON2_OPTIONS = {
  algorithm: 2,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export const RATE_LIMIT_RULES = {
  '/sign-in/email': { window: 60, max: 10 },
  '/sign-up/email': { window: 60, max: 5 },
  '/request-password-reset': { window: 300, max: 5 },
  '/send-verification-email': { window: 300, max: 5 },
};
