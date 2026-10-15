const REPOSITORY_URL = 'https://github.com/AristideDongo/opentask';

const blob = (path: string) => `${REPOSITORY_URL}/blob/main/${path}`;

const optionalUrl = (value: string | undefined) => (value ? value.replace(/\/$/, '') : null);

export const SITE = {
  name: 'OpenTask',
  siteUrl: optionalUrl(import.meta.env.VITE_SITE_URL),
  docsUrl: optionalUrl(import.meta.env.VITE_DOCS_URL) ?? `${REPOSITORY_URL}/tree/main/docs`,
  demoUrl: optionalUrl(import.meta.env.VITE_DEMO_URL),
  repositoryUrl: REPOSITORY_URL,
  cloneUrl: `${REPOSITORY_URL}.git`,
  issuesUrl: `${REPOSITORY_URL}/issues`,
  newIssueUrl: `${REPOSITORY_URL}/issues/new`,
  licenseUrl: blob('LICENSE'),
  contributingUrl: blob('CONTRIBUTING.md'),
  changelogUrl: blob('CHANGELOG.md'),
  roadmapUrl: blob('docs/product/roadmap.md'),
  limitationsUrl: blob('docs/product/known-limitations.md'),
  installGuideUrl: blob('docs/deployment/installation.md'),
  backupGuideUrl: blob('docs/deployment/backup-restore.md'),
  securityModelUrl: blob('docs/security/model.md'),
  mcpGuideUrl: blob('docs/decisions/0011-serveur-mcp-et-jetons-api.md'),
} as const;

export type SiteLinkKey = Exclude<keyof typeof SITE, 'name' | 'siteUrl' | 'demoUrl'>;
