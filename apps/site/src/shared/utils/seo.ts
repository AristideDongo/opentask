import { SITE } from '../config/site.config';
import type { Locale } from '../types/locale.types';

export const LOCALE_PATHS: Record<Locale, string> = { fr: '/', en: '/en' };

export const localeFromPath = (pathname: string): Locale =>
  pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'fr';

export const absoluteUrl = (path: string) =>
  SITE.siteUrl ? `${SITE.siteUrl}${path === '/' ? '/' : path}` : null;

export function pageMeta({
  title,
  description,
  locale,
  path,
}: {
  title: string;
  description: string;
  locale: Locale;
  path: string;
}) {
  const url = absoluteUrl(path);
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE.name },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:locale', content: locale === 'fr' ? 'fr_FR' : 'en_US' },
    { name: 'twitter:card', content: 'summary' },
    ...(url
      ? [
          { property: 'og:url', content: url },
          { tagName: 'link', rel: 'canonical', href: url },
          ...(Object.entries(LOCALE_PATHS) as [Locale, string][]).map(([lang, localePath]) => ({
            tagName: 'link',
            rel: 'alternate',
            hrefLang: lang,
            href: absoluteUrl(localePath) ?? localePath,
          })),
        ]
      : []),
  ];
}
