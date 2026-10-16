const ROOT = '../../../../../../docs/';

const SOURCES = import.meta.glob('../../../../../../docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface DocSource {
  file: string;
  raw: string;
}

export const docSources = (): DocSource[] =>
  Object.entries(SOURCES).map(([key, raw]) => ({ file: key.slice(ROOT.length), raw }));
