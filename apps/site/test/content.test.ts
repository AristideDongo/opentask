import { describe, expect, it } from 'vitest';
import { landingEn } from '../src/features/landing/landing.content.en';
import { landingFr } from '../src/features/landing/landing.content.fr';
import { INSTALL_COMMANDS, SECTION_IDS } from '../src/features/landing/landing.const';
import type { LandingContent, LinkContent } from '../src/features/landing/landing.types';
import { SITE } from '../src/shared/config/site.config';
import { resolveHref } from '../src/shared/utils/href';

const allLinks = (content: LandingContent): LinkContent[] => [
  ...content.community.links,
  ...content.footer.columns.flatMap((column) => column.links),
];

describe('contenu de la landing page', () => {
  it('garde la même structure en français et en anglais', () => {
    expect(landingEn.features.items.map((f) => f.status)).toEqual(
      landingFr.features.items.map((f) => f.status),
    );
    expect(landingEn.mcp.clients.map((c) => c.status)).toEqual(
      landingFr.mcp.clients.map((c) => c.status),
    );
    expect(landingEn.faq.items).toHaveLength(landingFr.faq.items.length);
    expect(allLinks(landingEn).map((l) => l.href)).toEqual(allLinks(landingFr).map((l) => l.href));
  });

  it.each([landingFr, landingEn])('ne contient que des liens réels ($locale)', (content) => {
    const anchors = Object.values(SECTION_IDS).map((id) => `#${id}`);
    for (const link of allLinks(content)) {
      const href = resolveHref(link.href);
      if (href.startsWith('#')) expect(anchors).toContain(href);
      else expect(href.startsWith(SITE.repositoryUrl) || href === SITE.docsUrl).toBe(true);
    }
  });

  it.each([landingFr, landingEn])(
    'ne publie ni texte provisoire ni démo inexistante ($locale)',
    (content) => {
      const text = JSON.stringify(content);
      expect(text).not.toMatch(/TODO|lorem|<URL|URL_DU|example\.com/i);
      if (!SITE.demoUrl) expect(text).not.toMatch(/démo en ligne|live demo/i);
    },
  );

  it('distingue ce qui est disponible de ce qui est prévu', () => {
    const planned = landingFr.features.items
      .filter((f) => f.status === 'planned')
      .map((f) => f.title);
    expect(planned).toEqual(
      expect.arrayContaining(['Notifications', 'Export des données', 'Webhooks']),
    );
    expect(landingFr.mcp.clients.find((c) => c.name === 'ChatGPT')?.status).toBe('in-progress');
  });

  it('montre les commandes d’installation du dépôt', () => {
    expect(INSTALL_COMMANDS[0]).toBe(`git clone ${SITE.cloneUrl}`);
    expect(INSTALL_COMMANDS.join('\n')).toContain('infra/docker/docker-compose.prod.yml');
  });
});
