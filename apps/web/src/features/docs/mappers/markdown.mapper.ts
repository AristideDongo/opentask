import { Marked, type Tokens } from 'marked';
import { DOCS_SOURCE_URL } from '../docs.const';
import type { DocHeadingVM, DocPageVM } from '../docs.types';
import {
  docPath,
  headingId,
  isExternalHref,
  resolveRelative,
  slugFromFile,
} from './doc-path.mapper';

const CUSTOM_ID = /\s*\{#([a-z0-9-]+)\}\s*$/i;

const CALLOUT = /^:::\s*(tip|info|warning|danger)\s*(.*?)\n([\s\S]*?)^:::\s*$/gm;

const CALLOUT_TITLES: Record<string, string> = {
  tip: 'Conseil',
  info: 'Information',
  warning: 'Attention',
  danger: 'Danger',
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function stripFrontmatter(raw: string) {
  return raw.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function expandCallouts(markdown: string) {
  return markdown.replace(CALLOUT, (_all, type: string, title: string, body: string) => {
    const label = escapeHtml(title.trim() || CALLOUT_TITLES[type] || type);
    return `<div class="doc-callout doc-callout-${type}" role="note">\n<p class="doc-callout-title">${label}</p>\n\n${body.trim()}\n\n</div>\n`;
  });
}

export function rewriteHref(sourceFile: string, href: string): { href: string; external: boolean } {
  if (isExternalHref(href)) return { href, external: true };
  if (href.startsWith('#')) return { href, external: false };
  const [path = '', anchor = ''] = href.split('#');
  const target = resolveRelative(sourceFile, path);
  if (target.endsWith('.md'))
    return { href: docPath(slugFromFile(target), anchor), external: false };
  if (target === 'api/openapi.json') return { href: '/api/v1/openapi.json', external: false };
  return { href: `${DOCS_SOURCE_URL}/${target}${anchor ? `#${anchor}` : ''}`, external: true };
}

function plainText(tokens: Tokens.Generic[] | undefined): string {
  return (tokens ?? [])
    .map((token) =>
      'tokens' in token && token.tokens
        ? plainText(token.tokens as Tokens.Generic[])
        : (token.text ?? ''),
    )
    .join('');
}

export function toDocPageVM(sourceFile: string, raw: string): DocPageVM {
  const headings: DocHeadingVM[] = [];
  const used = new Map<string, number>();
  let title = '';
  let description = '';
  const marked = new Marked({ gfm: true });

  marked.use({
    walkTokens(token) {
      if (token.type === 'heading' && token.depth === 1 && !title)
        title = plainText(token.tokens).replace(CUSTOM_ID, '');
      if (token.type === 'paragraph' && !description && title)
        description = plainText(token.tokens).slice(0, 180);
    },
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        const text = plainText(tokens);
        const custom = CUSTOM_ID.exec(text)?.[1];
        const clean = text.replace(CUSTOM_ID, '');
        const base = custom ?? (headingId(clean) || 'section');
        const count = used.get(base) ?? 0;
        used.set(base, count + 1);
        const id = count ? `${base}-${count}` : base;
        if (depth === 2 || depth === 3) headings.push({ id, text: clean, level: depth });
        const content = html.replace(CUSTOM_ID, '');
        if (depth === 1) return `<h1 id="${id}">${content}</h1>\n`;
        return `<h${depth} id="${id}"><a class="doc-anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${content}</h${depth}>\n`;
      },
      link({ href, title: linkTitle, tokens }) {
        const text = this.parser.parseInline(tokens);
        const target = rewriteHref(sourceFile, href);
        const titleAttr = linkTitle ? ` title="${escapeHtml(linkTitle)}"` : '';
        const external = target.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${escapeHtml(target.href)}"${titleAttr}${external}>${text}</a>`;
      },
      table(token) {
        const header = token.header
          .map((cell) => `<th>${this.parser.parseInline(cell.tokens)}</th>`)
          .join('');
        const rows = token.rows
          .map(
            (row) =>
              `<tr>${row.map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join('')}</tr>`,
          )
          .join('');
        return `<div class="doc-table"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      },
    },
  });

  const html = marked.parse(expandCallouts(stripFrontmatter(raw)), { async: false });
  return {
    slug: slugFromFile(sourceFile),
    title: title || slugFromFile(sourceFile),
    description,
    html,
    headings,
    sourcePath: sourceFile,
  };
}

export function toSearchText(raw: string): string {
  return stripFrontmatter(raw)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`|[\]()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
