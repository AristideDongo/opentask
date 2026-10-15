import { SITE, type SiteLinkKey } from '../config/site.config';

export const resolveHref = (href: SiteLinkKey | `#${string}`) =>
  href.startsWith('#') ? href : SITE[href as SiteLinkKey];

export const isExternal = (href: string) => /^https?:\/\//.test(href);
