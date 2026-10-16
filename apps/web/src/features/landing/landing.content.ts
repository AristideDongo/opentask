import { landingEn } from './landing.content.en';
import { landingFr } from './landing.content.fr';
import type { LandingContent } from './landing.types';

export const getLandingContent = (locale: string): LandingContent =>
  locale === 'en' ? landingEn : landingFr;
