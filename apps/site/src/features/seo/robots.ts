import { absoluteUrl } from '../../shared/utils/seo';

export function loader() {
  const sitemap = absoluteUrl('/sitemap.xml');
  const body = ['User-agent: *', 'Allow: /', ...(sitemap ? [`Sitemap: ${sitemap}`] : [])].join(
    '\n',
  );
  return new Response(`${body}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
