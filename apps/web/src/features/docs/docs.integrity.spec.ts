import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DOCS_NAV } from './docs.const';
import { slugFromFile } from './mappers/doc-path.mapper';
import { toDocPageVM } from './mappers/markdown.mapper';

const DOCS_DIR = join(import.meta.dirname, '../../../../../docs');

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path);
    return entry.name.endsWith('.md') ? [relative(DOCS_DIR, path)] : [];
  });

const pages = files(DOCS_DIR).map((file) =>
  toDocPageVM(file, readFileSync(join(DOCS_DIR, file), 'utf8')),
);
const bySlug = new Map(pages.map((page) => [page.slug, page]));
const ids = (html: string) => new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

describe('intégrité de la documentation', () => {
  it('a un titre pour chaque page', () => {
    for (const page of pages) expect(page.title, page.sourcePath).not.toBe(page.slug);
  });

  it('ne contient aucun lien interne ni ancre cassés', () => {
    const broken: string[] = [];
    for (const page of pages) {
      for (const [, href] of page.html.matchAll(/<a href="([^"]+)"/g)) {
        if (!href || href.startsWith('http') || href.startsWith('/api/')) continue;
        const [path, anchor] = href.split('#');
        const target = path ? bySlug.get(path.replace(/^\/docs\/?/, '')) : page;
        if (!target) broken.push(`${page.sourcePath} → ${href}`);
        else if (anchor && !ids(target.html).has(anchor))
          broken.push(`${page.sourcePath} → ${href} (ancre)`);
      }
    }
    expect(broken).toEqual([]);
  });

  it('ne référence dans la barre latérale que des pages existantes', () => {
    const missing = DOCS_NAV.flatMap((section) => section.items).filter(
      (item) => !bySlug.has(item.slug),
    );
    expect(missing).toEqual([]);
  });

  it('donne accès au guide MCP et à la connexion de Claude', () => {
    expect(bySlug.get('mcp')?.title).toBe('MCP et assistants IA');
    expect(bySlug.get('mcp/claude')?.html).toContain('claude mcp add');
    expect(slugFromFile('mcp/claude.md')).toBe('mcp/claude');
  });
});
