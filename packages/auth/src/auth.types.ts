import type { PrismaClient } from '@opentask/database/client';

export type AuthLocale = 'fr' | 'en';

export interface AuthMailer {
  sendPasswordReset(email: string, name: string, url: string, locale: AuthLocale): void;
  sendVerification(email: string, name: string, url: string, locale: AuthLocale): void;
}

export interface AuthSettings {
  publicUrl: string;
  secret: string;
  requireEmailVerification: boolean;
  rateLimitEnabled: boolean;
}

export interface AuthDependencies {
  prisma: PrismaClient;
  mailer: AuthMailer;
}

export interface SessionUser {
  id: string;
  email: string;
}
