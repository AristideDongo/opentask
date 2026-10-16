import { SEARCH_RESULT_LIMIT } from '../docs.const';
import type { DocSearchEntry } from '../docs.types';

export interface DocSearchResult {
  slug: string;
  title: string;
  excerpt: string;
}

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function excerptAround(text: string, folded: string, term: string) {
  const at = folded.indexOf(term);
  if (at < 0) return text.slice(0, 140);
  const start = Math.max(0, at - 60);
  return `${start > 0 ? '…' : ''}${text.slice(start, start + 160).trim()}…`;
}

export function searchDocs(entries: DocSearchEntry[], query: string): DocSearchResult[] {
  const terms = fold(query)
    .split(/\s+/)
    .filter((t) => t.length >= 2);
  if (terms.length === 0) return [];
  return entries
    .map((entry) => {
      const title = fold(entry.title);
      const text = fold(entry.text);
      let score = 0;
      for (const term of terms) {
        if (title.includes(term)) score += 10;
        const hits = text.split(term).length - 1;
        if (hits === 0 && !title.includes(term)) return null;
        score += Math.min(hits, 5);
      }
      return { entry, score, excerpt: excerptAround(entry.text, text, terms[0] ?? '') };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, SEARCH_RESULT_LIMIT)
    .map(({ entry, excerpt }) => ({ slug: entry.slug, title: entry.title, excerpt }));
}
