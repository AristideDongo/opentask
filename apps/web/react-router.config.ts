import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Config } from '@react-router/dev/config';
import { docPath, slugFromFile } from './src/features/docs/mappers/doc-path.mapper';

const DOCS_DIR = join(import.meta.dirname, '../../docs');

const markdownFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.name.endsWith('.md') ? [relative(DOCS_DIR, path)] : [];
  });

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: () => [
    '/',
    '/docs',
    '/docs/search.json',
    ...markdownFiles(DOCS_DIR).map((file) => docPath(slugFromFile(file))),
  ],
} satisfies Config;
