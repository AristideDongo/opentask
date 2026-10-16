import { REPOSITORY_URL } from '../../shared/constants/paths';

export const SECTION_IDS = {
  features: 'features',
  selfHost: 'self-hosting',
  mcp: 'mcp',
  install: 'install',
  community: 'community',
  faq: 'faq',
} as const;

export const LANDING_LINKS = {
  repository: REPOSITORY_URL,
  issues: `${REPOSITORY_URL}/issues`,
  newIssue: `${REPOSITORY_URL}/issues/new`,
  license: `${REPOSITORY_URL}/blob/main/LICENSE`,
  changelog: `${REPOSITORY_URL}/blob/main/CHANGELOG.md`,
  docs: '/docs',
  install: '/docs/deployment/installation',
  backup: '/docs/deployment/backup-restore',
  security: '/docs/security/model',
  roadmap: '/docs/product/roadmap',
  limitations: '/docs/product/known-limitations',
  contributing: '/docs/developers/contributing',
  mcp: '/docs/mcp',
  mcpClaude: '/docs/mcp/claude',
} as const;

export const INSTALL_COMMANDS = [
  `git clone ${REPOSITORY_URL}.git`,
  'cd opentask',
  'cp infra/docker/.env.prod.example infra/docker/.env.prod',
  'docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up -d --build',
] as const;
