import { REPOSITORY_URL } from '../../shared/constants/paths';
import type { DocNavSection } from './docs.types';

export const DOCS_SOURCE_URL = `${REPOSITORY_URL}/blob/main/docs`;

export const DOCS_EDIT_URL = `${REPOSITORY_URL}/edit/main/docs`;

export const SEARCH_INDEX_PATH = '/docs/search.json';

export const SEARCH_RESULT_LIMIT = 8;

export const DOCS_NAV: DocNavSection[] = [
  {
    title: 'Introduction',
    items: [
      { text: 'Qu’est-ce qu’OpenTask ?', slug: 'guide/introduction' },
      { text: 'Démarrage rapide', slug: 'guide/quick-start' },
      { text: 'État du MVP', slug: 'product/mvp-status' },
      { text: 'Limites connues', slug: 'product/known-limitations' },
      { text: 'Feuille de route', slug: 'product/roadmap' },
    ],
  },
  {
    title: 'Guide utilisateur',
    items: [
      { text: 'Compte et workspace', slug: 'user/getting-started' },
      { text: 'Membres et rôles', slug: 'user/members-and-roles' },
      { text: 'Projets et tâches', slug: 'user/projects-and-tasks' },
      { text: 'Vues Liste et Kanban', slug: 'user/views' },
      { text: 'Commentaires, équipes, discussion', slug: 'user/collaboration' },
      { text: 'Jetons d’API', slug: 'user/api-tokens' },
      { text: 'Dépannage', slug: 'user/troubleshooting' },
    ],
  },
  {
    title: 'MCP et assistants IA',
    items: [
      { text: 'Vue d’ensemble', slug: 'mcp' },
      { text: 'Connecter Claude Code', slug: 'mcp/claude' },
      { text: 'ChatGPT', slug: 'mcp/chatgpt' },
      { text: 'Outils disponibles', slug: 'mcp/tools' },
      { text: 'Sécurité et confidentialité', slug: 'mcp/security' },
      { text: 'Dépannage', slug: 'mcp/troubleshooting' },
    ],
  },
  {
    title: 'Installation et administration',
    items: [
      { text: 'Installation', slug: 'deployment/installation' },
      { text: 'Configuration', slug: 'admin/configuration' },
      { text: 'Exploitation', slug: 'admin/operations' },
      { text: 'Sauvegarde et restauration', slug: 'deployment/backup-restore' },
      { text: 'Modèle de sécurité', slug: 'security/model' },
    ],
  },
  {
    title: 'Développeurs',
    items: [
      { text: 'API REST', slug: 'developers/api' },
      { text: 'Référence OpenAPI', slug: 'api' },
      { text: 'Architecture', slug: 'architecture/overview' },
      { text: 'Décisions (ADR)', slug: 'decisions' },
      { text: 'Contribuer', slug: 'developers/contributing' },
      { text: 'Dépannage', slug: 'troubleshooting' },
    ],
  },
];
