const INDEX_FILES = /(^|\/)(index|README)$/;

export function slugFromFile(file: string): string {
  return file.replace(/\.md$/, '').replace(INDEX_FILES, '').replace(/\/$/, '');
}

export function docPath(slug: string, anchor = ''): string {
  return `/docs${slug ? `/${slug}` : ''}${anchor ? `#${anchor}` : ''}`;
}

function normalize(segments: string[]): string[] {
  const out: string[] = [];
  for (const segment of segments) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') out.pop();
    else out.push(segment);
  }
  return out;
}

export function resolveRelative(fromFile: string, target: string): string {
  const base = fromFile.split('/').slice(0, -1);
  return normalize([...base, ...target.split('/')]).join('/');
}

export const isExternalHref = (href: string) => /^[a-z][a-z0-9+.-]*:/i.test(href);

export function headingId(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
