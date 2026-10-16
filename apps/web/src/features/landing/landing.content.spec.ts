import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REPOSITORY_URL } from '../../shared/constants/paths';
import { LANDING_LINKS, SECTION_IDS } from './landing.const';
import { landingEn } from './landing.content.en';
import { landingFr } from './landing.content.fr';
import type { LandingContent } from './landing.types';

const DOCS_DIR = join(import.meta.dirname, '../../../../../docs');
const docExists = (path: string) => {
  const slug = path.replace(/^\/docs\/?/, '');
  return (
    slug === '' ||
    existsSync(join(DOCS_DIR, `${slug}.md`)) ||
    existsSync(join(DOCS_DIR, slug, 'index.md')) ||
    existsSync(join(DOCS_DIR, slug, 'README.md'))
  );
};

const links = (content: LandingContent) => [
  ...content.community.links,
  ...content.footer.columns.flatMap((c) => c.links),
];

describe('contenu de la landing page', () => {
  it('garde la même structure en français et en anglais', () => {
    expect(landingEn.features.items.map((f) => f.status)).toEqual(
      landingFr.features.items.map((f) => f.status),
    );
    expect(landingEn.mcp.steps).toHaveLength(landingFr.mcp.steps.length);
    expect(landingEn.faq.items).toHaveLength(landingFr.faq.items.length);
    expect(links(landingEn).map((l) => l.href)).toEqual(links(landingFr).map((l) => l.href));
  });

  it('ne pointe que vers des pages existantes, des sections de la page ou le dépôt', () => {
    const anchors = Object.values(SECTION_IDS).map((id) => `#${id}`);
    for (const href of [...links(landingFr).map((l) => l.href), ...Object.values(LANDING_LINKS)]) {
      if (href.startsWith('#')) expect(anchors).toContain(href);
      else if (href.startsWith('/docs')) expect(docExists(href), href).toBe(true);
      else expect(href.startsWith(REPOSITORY_URL), href).toBe(true);
    }
  });

  it('distingue ce qui est disponible de ce qui est prévu', () => {
    const planned = landingFr.features.items
      .filter((f) => f.status === 'planned')
      .map((f) => f.title);
    expect(planned).toEqual(
      expect.arrayContaining(['Notifications', 'Export des données', 'Webhooks']),
    );
    expect(landingFr.mcp.clients.find((c) => c.name === 'ChatGPT')?.status).toBe('in-progress');
    expect(JSON.stringify(landingFr)).not.toMatch(/TODO|lorem|example\.com/i);
  });
});
