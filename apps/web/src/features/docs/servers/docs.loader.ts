import { data } from 'react-router';
import { slugFromFile } from '../mappers/doc-path.mapper';
import { toDocPageVM } from '../mappers/markdown.mapper';
import { docSources } from './docs.source';

export function docsLoader({ params }: { params: Record<string, string | undefined> }) {
  const slug = (params['*'] ?? '').replace(/\/$/, '');
  if (!slug) return { page: null };
  const source = docSources().find((doc) => slugFromFile(doc.file) === slug);
  if (!source) throw data(null, { status: 404 });
  return { page: toDocPageVM(source.file, source.raw) };
}
