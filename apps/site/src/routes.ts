import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('features/landing/index.tsx'),
  route('en', 'features/landing/index.tsx', { id: 'landing-en' }),
  route('404', 'features/not-found/index.tsx'),
  route('sitemap.xml', 'features/seo/sitemap.ts'),
  route('robots.txt', 'features/seo/robots.ts'),
  route('*', 'features/not-found/index.tsx', { id: 'not-found-splat' }),
] satisfies RouteConfig;
