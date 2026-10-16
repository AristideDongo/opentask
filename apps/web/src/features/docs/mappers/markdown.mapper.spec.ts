import { describe, expect, it } from 'vitest';
import { docPath, headingId, resolveRelative, slugFromFile } from './doc-path.mapper';
import { rewriteHref, toDocPageVM } from './markdown.mapper';
import { searchDocs } from './search.mapper';

describe('chemins de documentation', () => {
  it('transforme un fichier en slug', () => {
    expect(slugFromFile('mcp/index.md')).toBe('mcp');
    expect(slugFromFile('decisions/README.md')).toBe('decisions');
    expect(slugFromFile('user/api-tokens.md')).toBe('user/api-tokens');
    expect(docPath('mcp/claude', 'verifier')).toBe('/docs/mcp/claude#verifier');
  });

  it('résout les chemins relatifs', () => {
    expect(resolveRelative('mcp/index.md', '../user/api-tokens.md')).toBe('user/api-tokens.md');
    expect(resolveRelative('mcp/index.md', './claude.md')).toBe('mcp/claude.md');
  });

  it('produit des identifiants de titre sans accents', () => {
    expect(headingId('Sécurité et confidentialité')).toBe('securite-et-confidentialite');
    expect(headingId('Qu’est-ce qu’OpenTask ?')).toBe('qu-est-ce-qu-opentask');
  });
});

describe('réécriture des liens', () => {
  it('convertit les liens Markdown en routes de l’application', () => {
    expect(rewriteHref('mcp/index.md', '../user/api-tokens.md')).toEqual({
      href: '/docs/user/api-tokens',
      external: false,
    });
    expect(rewriteHref('developers/api.md', '../architecture/overview.md#erreurs')).toEqual({
      href: '/docs/architecture/overview#erreurs',
      external: false,
    });
    expect(rewriteHref('api/README.md', 'openapi.json')).toEqual({
      href: '/api/v1/openapi.json',
      external: false,
    });
  });

  it('garde les liens externes et renvoie les autres fichiers vers GitHub', () => {
    expect(rewriteHref('guide/introduction.md', 'https://example.org')).toEqual({
      href: 'https://example.org',
      external: true,
    });
    expect(rewriteHref('admin/operations.md', '../../infra/scripts/backup.sh').external).toBe(true);
  });
});

describe('rendu Markdown', () => {
  const page = toDocPageVM(
    'mcp/index.md',
    [
      '# MCP et assistants IA',
      '',
      'Introduction avec un [jeton](../user/api-tokens.md) et un [lien](https://modelcontextprotocol.io/).',
      '',
      '## Déploiement {#deploiement}',
      '',
      '| A | B |',
      '| - | - |',
      '| 1 | 2 |',
      '',
      '::: warning Pas encore pris en charge',
      'Texte **important**.',
      ':::',
    ].join('\n'),
  );

  it('extrait le titre, la description et les ancres personnalisées', () => {
    expect(page.title).toBe('MCP et assistants IA');
    expect(page.description).toContain('Introduction avec un jeton');
    expect(page.headings).toEqual([{ id: 'deploiement', text: 'Déploiement', level: 2 }]);
    expect(page.html).toContain('<h2 id="deploiement">');
    expect(page.html).not.toContain('{#deploiement}');
  });

  it('réécrit les liens, ouvre les liens externes dans un nouvel onglet et rend tableaux et encadrés', () => {
    expect(page.html).toContain('href="/docs/user/api-tokens"');
    expect(page.html).toContain(
      'href="https://modelcontextprotocol.io/" target="_blank" rel="noopener noreferrer"',
    );
    expect(page.html).toContain('<div class="doc-table"><table>');
    expect(page.html).toContain('<div class="doc-callout doc-callout-warning" role="note">');
    expect(page.html).toContain('<p class="doc-callout-title">Pas encore pris en charge</p>');
    expect(page.html).toContain('<strong>important</strong>');
  });
});

describe('recherche', () => {
  const entries = [
    {
      slug: 'user/api-tokens',
      title: 'Jetons d’API',
      text: 'Un jeton d’API permet à un outil d’agir en votre nom.',
    },
    { slug: 'mcp', title: 'MCP et assistants IA', text: 'Le serveur MCP utilise votre jeton.' },
    { slug: 'user/views', title: 'Vues Liste et Kanban', text: 'Glissez les cartes.' },
  ];

  it('classe les pages dont le titre correspond en premier, sans tenir compte des accents', () => {
    expect(searchDocs(entries, 'jeton').map((r) => r.slug)).toEqual(['user/api-tokens', 'mcp']);
    expect(searchDocs(entries, 'KANBAN').map((r) => r.slug)).toEqual(['user/views']);
    expect(searchDocs(entries, 'e')).toEqual([]);
  });
});
