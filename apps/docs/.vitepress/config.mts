import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { defineConfig } from 'vitepress';

const fromVitepress = createRequire(createRequire(import.meta.url).resolve('vitepress'));
const vueDir = dirname(fromVitepress.resolve('vue/package.json'));

export default defineConfig({
  srcDir: '../../docs',
  outDir: './dist',
  cacheDir: './.vitepress/cache',
  lang: 'fr-FR',
  title: 'OpenTask',
  description: 'Documentation d’OpenTask',
  cleanUrls: true,
  rewrites: { 'decisions/README.md': 'decisions/index.md', 'api/README.md': 'api/index.md' },
  vite: {
    resolve: {
      alias: [
        { find: /^vue$/, replacement: `${vueDir}/index.mjs` },
        { find: /^vue\/server-renderer$/, replacement: `${vueDir}/server-renderer/index.mjs` },
      ],
    },
  },
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Rechercher', buttonAriaLabel: 'Rechercher' },
          modal: {
            displayDetails: 'Afficher la liste détaillée',
            resetButtonTitle: 'Effacer la recherche',
            backButtonTitle: 'Fermer la recherche',
            noResultsText: 'Aucun résultat pour',
            footer: {
              selectText: 'pour choisir',
              navigateText: 'pour naviguer',
              closeText: 'pour fermer',
            },
          },
        },
      },
    },
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Installation', link: '/deployment/installation' },
      { text: 'MCP', link: '/mcp/' },
      { text: 'API', link: '/developers/api' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Qu’est-ce qu’OpenTask ?', link: '/guide/introduction' },
          { text: 'Démarrage rapide', link: '/guide/quick-start' },
          { text: 'État du MVP', link: '/product/mvp-status' },
          { text: 'Limites connues', link: '/product/known-limitations' },
          { text: 'Feuille de route', link: '/product/roadmap' },
        ],
      },
      {
        text: 'Guide utilisateur',
        items: [
          { text: 'Compte et workspace', link: '/user/getting-started' },
          { text: 'Membres et rôles', link: '/user/members-and-roles' },
          { text: 'Projets et tâches', link: '/user/projects-and-tasks' },
          { text: 'Vues Liste et Kanban', link: '/user/views' },
          { text: 'Commentaires, équipes, discussion', link: '/user/collaboration' },
          { text: 'Jetons d’API', link: '/user/api-tokens' },
          { text: 'Dépannage', link: '/user/troubleshooting' },
        ],
      },
      {
        text: 'Installation et administration',
        items: [
          { text: 'Installation', link: '/deployment/installation' },
          { text: 'Configuration', link: '/admin/configuration' },
          { text: 'Exploitation', link: '/admin/operations' },
          { text: 'Sauvegarde et restauration', link: '/deployment/backup-restore' },
          { text: 'Modèle de sécurité', link: '/security/model' },
        ],
      },
      {
        text: 'MCP et assistants IA',
        items: [
          { text: 'Vue d’ensemble', link: '/mcp/' },
          { text: 'Claude Code', link: '/mcp/claude' },
          { text: 'ChatGPT', link: '/mcp/chatgpt' },
          { text: 'Outils', link: '/mcp/tools' },
          { text: 'Sécurité et confidentialité', link: '/mcp/security' },
          { text: 'Dépannage', link: '/mcp/troubleshooting' },
        ],
      },
      {
        text: 'Développeurs',
        items: [
          { text: 'API REST', link: '/developers/api' },
          { text: 'Architecture', link: '/architecture/overview' },
          { text: 'Décisions (ADR)', link: '/decisions/' },
          { text: 'Contribuer', link: '/developers/contributing' },
        ],
      },
      { text: 'Dépannage', link: '/troubleshooting' },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/AristideDongo/opentask' }],
    editLink: {
      pattern: 'https://github.com/AristideDongo/opentask/edit/main/docs/:path',
      text: 'Proposer une modification',
    },
    docFooter: { prev: 'Page précédente', next: 'Page suivante' },
    outline: { label: 'Sur cette page' },
    returnToTopLabel: 'Retour en haut',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Thème',
    lightModeSwitchTitle: 'Passer au thème clair',
    darkModeSwitchTitle: 'Passer au thème sombre',
    notFound: {
      title: 'Page introuvable',
      quote: 'Cette page n’existe pas ou a été déplacée.',
      linkText: 'Retour à l’accueil',
    },
  },
});
