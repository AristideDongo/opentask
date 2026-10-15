import type { Locale } from '../../shared/types/locale.types';
import { landingEn } from './landing.content.en';
import { landingFr } from './landing.content.fr';
import type { LandingContent } from './landing.types';

const CONTENT: Record<Locale, LandingContent> = { fr: landingFr, en: landingEn };

export const getLandingContent = (locale: Locale) => CONTENT[locale];

export const localePath = (locale: Locale) => (locale === 'fr' ? '/' : '/en');
