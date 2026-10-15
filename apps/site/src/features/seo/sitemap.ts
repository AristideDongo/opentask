import { LOCALE_PATHS, absoluteUrl } from '../../shared/utils/seo';

export function loader() {
  const urls = Object.values(LOCALE_PATHS)
    .map((path) => absoluteUrl(path))
    .filter((url): url is string => url !== null)
    .map((url) => `  <url><loc>${url}</loc></url>`);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}${urls.length ? '\n' : ''}</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
