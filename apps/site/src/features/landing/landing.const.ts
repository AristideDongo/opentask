export const SECTION_IDS = {
  features: 'features',
  selfHost: 'self-hosting',
  mcp: 'mcp',
  install: 'install',
  community: 'community',
  faq: 'faq',
} as const;

export const INSTALL_COMMANDS = [
  'git clone https://github.com/AristideDongo/opentask.git',
  'cd opentask',
  'cp infra/docker/.env.prod.example infra/docker/.env.prod',
  'docker compose -f infra/docker/docker-compose.prod.yml --env-file infra/docker/.env.prod up -d --build',
] as const;
