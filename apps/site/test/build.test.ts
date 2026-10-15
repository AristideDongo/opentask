import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SITE } from '../src/shared/config/site.config';

const file = (path: string) => fileURLToPath(new URL(`../build/client/${path}`, import.meta.url));
const read = (path: string) => readFileSync(file(path), 'utf8');

const hrefs = (html: string) =>
  [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>/g)].map((m) => ({
    tag: m[0],
    href: m[1] ?? '',
  }));
const ids = (html: string) => new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1] ?? ''));

describe.skipIf(!existsSync(file('index.html')))('pages prérendues', () => {
  it.each([
    ['index.html', 'fr'],
    ['en/index.html', 'en'],
  ])('%s est complète et accessible', (path, lang) => {
    const html = read(path);
    expect(html).toContain(`<html lang="${lang}"`);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toMatch(/<meta name="description" content="[^"]{50,}"/);
    expect(html).toMatch(/<meta property="og:title"/);
    expect(html).toContain('href="#main"');
    if (!SITE.siteUrl) expect(html).not.toContain('rel="canonical"');
  });

  it('a des ancres internes et des liens externes valides', () => {
    const html = read('index.html');
    const present = ids(html);
    for (const { tag, href } of hrefs(html)) {
      if (href.startsWith('#')) expect(present, href).toContain(href.slice(1));
      else if (href.startsWith('http')) {
        expect(href.startsWith('https://')).toBe(true);
        expect(tag).toContain('rel="noopener noreferrer"');
      } else expect(['/', '/en']).toContain(href);
    }
  });

  it('propose les appels à l’action principaux', () => {
    const html = read('index.html');
    expect(html).toContain('href="#install"');
    expect(html).toContain(`href="${SITE.repositoryUrl}"`);
    expect(html).toContain(`href="${SITE.installGuideUrl}"`);
    expect(html).toContain(`href="${SITE.mcpGuideUrl}"`);
  });

  it('publie une page 404 non indexée, un sitemap et un robots.txt', () => {
    expect(read('404/index.html')).toContain('content="noindex"');
    expect(read('sitemap.xml')).toMatch(/^<\?xml[^>]+\?>\s*<urlset/);
    expect(read('robots.txt')).toMatch(/^User-agent: \*/);
  });
});
