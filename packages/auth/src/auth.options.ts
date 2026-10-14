import { PASSWORD_MIN_LENGTH } from '@opentask/contracts/auth/credentials';
import type { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import {
  AUTH_BASE_PATH,
  CLIENT_IP_HEADER,
  COOKIE_PREFIX,
  MAX_PASSWORD_LENGTH,
  RATE_LIMIT_RULES,
  SESSION_MAX_AGE_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
} from './auth.const';
import type { AuthDependencies, AuthLocale, AuthSettings } from './auth.types';
import { hashPassword, verifyPassword } from './password';

const localeOf = (user: object): AuthLocale =>
  'locale' in user && user.locale === 'en' ? 'en' : 'fr';

export const authOptions = (settings: AuthSettings, { prisma, mailer }: AuthDependencies) =>
  ({
    appName: 'OpenTask',
    baseURL: settings.publicUrl,
    basePath: AUTH_BASE_PATH,
    secret: settings.secret,
    trustedOrigins: [settings.publicUrl],
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: MAX_PASSWORD_LENGTH,
      requireEmailVerification: settings.requireEmailVerification,
      revokeSessionsOnPasswordReset: true,
      password: { hash: hashPassword, verify: verifyPassword },
      sendResetPassword: async ({ user, url }) => {
        mailer.sendPasswordReset(user.email, user.name, url, localeOf(user));
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        mailer.sendVerification(user.email, user.name, url, localeOf(user));
      },
    },
    user: {
      additionalFields: {
        locale: { type: 'string', required: false, defaultValue: 'fr', input: false },
        timezone: { type: 'string', required: false, defaultValue: 'UTC', input: false },
      },
    },
    session: { expiresIn: SESSION_MAX_AGE_SECONDS, updateAge: SESSION_UPDATE_AGE_SECONDS },
    rateLimit: {
      enabled: settings.rateLimitEnabled,
      storage: 'memory',
      window: 60,
      max: 100,
      customRules: RATE_LIMIT_RULES,
    },
    advanced: {
      ipAddress: { ipAddressHeaders: [CLIENT_IP_HEADER] },
      cookiePrefix: COOKIE_PREFIX,
      useSecureCookies: settings.publicUrl.startsWith('https://'),
    },
    telemetry: { enabled: false },
  }) satisfies BetterAuthOptions;
