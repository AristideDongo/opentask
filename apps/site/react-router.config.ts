import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: ['/', '/en', '/404', '/sitemap.xml', '/robots.txt'],
} satisfies Config;
