import type { LandingContent } from './landing.types';

export const landingFr: LandingContent = {
  locale: 'fr',
  meta: {
    title: 'OpenTask — gestion de projets open source et auto-hébergeable',
    description:
      'Organisez projets, tâches et équipes sur votre propre serveur. OpenTask est gratuit, open source (AGPL-3.0) et se connecte aux assistants IA via MCP.',
  },
  skipLink: 'Aller au contenu',
  nav: {
    features: 'Fonctionnalités',
    selfHost: 'Auto-hébergement',
    mcp: 'MCP',
    docs: 'Documentation',
    github: 'GitHub',
    menu: 'Menu',
    language: 'English',
  },
  status: { available: 'Disponible', 'in-progress': 'En développement', planned: 'Prévu' },
  hero: {
    eyebrow: 'Open source · AGPL-3.0',
    title: 'Le travail d’équipe, sans abonnement imposé.',
    subtitle:
      'OpenTask est une plateforme open source pour organiser projets, tâches et équipes. Auto-hébergez-la, gardez le contrôle de vos données et connectez vos outils.',
    primary: 'Découvrir l’installation',
    secondary: 'Voir sur GitHub',
    facts: [
      'Code source ouvert',
      'Auto-hébergeable avec Docker',
      'API documentée (OpenAPI)',
      'Serveur MCP pour assistants IA',
    ],
    illustrationLabel:
      'Illustration d’un tableau Kanban OpenTask (schéma, pas une capture d’écran)',
  },
  values: {
    title: 'Pourquoi OpenTask',
    items: [
      {
        title: 'Vos données chez vous',
        body: 'Tout est stocké dans votre base PostgreSQL, sur votre infrastructure.',
      },
      {
        title: 'Un espace cohérent',
        body: 'Projets, tâches, équipes et discussions réunis dans un même workspace.',
      },
      {
        title: 'Sur votre serveur',
        body: 'Une installation Docker Compose, sans service propriétaire obligatoire.',
      },
      {
        title: 'Connecté à vos outils',
        body: 'Une API REST documentée, des jetons d’API et un serveur MCP.',
      },
      {
        title: 'Transparent',
        body: 'Le code est public : vous pouvez l’auditer, l’adapter et contribuer.',
      },
    ],
  },
  features: {
    title: 'Fonctionnalités',
    intro:
      'Ce qui est disponible aujourd’hui, et ce qui arrive. Rien n’est présenté comme disponible s’il ne l’est pas.',
    items: [
      {
        title: 'Projets, tâches et sous-tâches',
        body: 'Découpez le travail en projets et tâches, avec sous-tâches, priorités, échéances et personne assignée.',
        status: 'available',
      },
      {
        title: 'Vues Liste et Kanban',
        body: 'Filtrez et triez en liste, ou glissez les cartes entre des colonnes que chaque projet définit, avec des tags colorés.',
        status: 'available',
      },
      {
        title: 'Commentaires et journal d’audit',
        body: 'Discutez d’une tâche par commentaires ; les opérations d’administration sont tracées dans le journal du workspace.',
        status: 'available',
      },
      {
        title: 'Équipes, rôles et invitations',
        body: 'Propriétaire, administrateur, membre ou invité : les permissions sont vérifiées par le serveur, pas seulement par l’interface.',
        status: 'available',
      },
      {
        title: 'Discussion en temps réel',
        body: 'Canaux publics ou privés pour échanger avec l’équipe, mis à jour instantanément.',
        status: 'available',
      },
      {
        title: 'API et jetons d’API',
        body: 'Une API REST décrite en OpenAPI et des jetons personnels révocables, en lecture seule ou en écriture.',
        status: 'available',
      },
      {
        title: 'Assistants IA via MCP',
        body: 'Demandez à un assistant compatible de consulter ou de mettre à jour les tâches auxquelles vous avez accès.',
        status: 'available',
      },
      {
        title: 'Notifications',
        body: 'Alertes dans l’application et par e-mail pour les assignations et les échéances.',
        status: 'planned',
      },
      {
        title: 'Export des données',
        body: 'Export complet dans un format documenté. Aujourd’hui, la sauvegarde PostgreSQL est la méthode d’extraction.',
        status: 'planned',
      },
      {
        title: 'Recherche globale',
        body: 'Recherche dans tout le workspace ; aujourd’hui, la recherche porte sur les titres de tâches.',
        status: 'planned',
      },
      {
        title: 'Webhooks',
        body: 'Notifier vos outils à chaque changement important.',
        status: 'planned',
      },
    ],
  },
  selfHost: {
    title: 'Vos données, votre infrastructure',
    intro:
      'OpenTask s’installe sur votre serveur avec Docker Compose : l’application, l’API et PostgreSQL restent chez vous.',
    points: [
      'Sauvegarde et restauration de PostgreSQL avec des scripts fournis et testés.',
      'HTTPS automatique avec Caddy, ou derrière votre propre reverse proxy.',
      'Aucun service tiers obligatoire ; l’envoi d’e-mails passe par le SMTP de votre choix.',
    ],
    responsibilities:
      'Auto-héberger, c’est aussi être responsable de l’instance : mises à jour, certificats HTTPS, secrets, sauvegardes et tests de restauration. L’auto-hébergement ne rend pas une installation sûre à lui seul.',
    cta: 'Lire le guide d’installation',
    backup: 'Sauvegarde et restauration',
  },
  mcp: {
    title: 'OpenTask + assistants IA',
    intro:
      'Le serveur MCP d’OpenTask permet à un assistant compatible d’utiliser vos données OpenTask, avec vos permissions et rien de plus.',
    examples: [
      '« Liste mes tâches en retard. »',
      '« Résume l’avancement de ce projet. »',
      '« Crée une tâche dans ce projet. »',
      '« Déplace cette tâche dans la colonne Terminé. »',
      '« Ajoute un commentaire à cette tâche. »',
    ],
    guarantees: [
      'L’assistant agit avec un jeton d’API personnel, révocable à tout moment.',
      'Il ne voit que les workspaces dont vous êtes membre ; l’API vérifie chaque appel.',
      'Les écritures exigent un jeton avec la permission « écriture » et peuvent être désactivées par l’administrateur.',
      'Aucun outil de suppression n’est exposé.',
    ],
    clients: [
      {
        name: 'Claude Code',
        status: 'available',
        detail:
          'En local (stdio) ou à distance (HTTP avec jeton). Testé avec le client MCP officiel.',
      },
      {
        name: 'ChatGPT',
        status: 'in-progress',
        detail:
          'Le mode développeur de ChatGPT exige OAuth, que le serveur MCP ne propose pas encore.',
      },
    ],
    cta: 'Voir le guide MCP',
  },
  install: {
    title: 'Installation',
    intro: 'Sur un serveur Linux avec Docker et Docker Compose v2 :',
    prerequisites: [
      'Renseignez au minimum PUBLIC_URL, POSTGRES_PASSWORD et AUTH_SECRET dans infra/docker/.env.prod.',
      'Un nom de domaine et un compte SMTP sont recommandés pour HTTPS et les e-mails.',
    ],
    copy: 'Copier les commandes',
    copied: 'Commandes copiées',
    cta: 'Guide d’installation complet',
  },
  community: {
    title: 'Communauté',
    intro:
      'OpenTask est développé en public. Toutes les contributions sont bienvenues, du signalement de bug au code.',
    links: [
      { label: 'Dépôt GitHub', href: 'repositoryUrl' },
      { label: 'Guide de contribution', href: 'contributingUrl' },
      { label: 'Signaler un bug ou proposer une idée', href: 'newIssueUrl' },
      { label: 'Feuille de route', href: 'roadmapUrl' },
      { label: 'Limites connues', href: 'limitationsUrl' },
    ],
  },
  faq: {
    title: 'Questions fréquentes',
    items: [
      {
        question: 'OpenTask est-il gratuit ?',
        answer:
          'Oui. Le logiciel est publié sous licence AGPL-3.0, sans version payante ni limite de projets, de tâches ou de membres. Vous payez seulement l’hébergement que vous choisissez.',
      },
      {
        question: 'Puis-je l’auto-héberger ?',
        answer:
          'Oui, c’est le mode de fonctionnement prévu : une installation Docker Compose sur votre serveur, avec HTTPS automatique optionnel. Le guide d’installation détaille les prérequis.',
      },
      {
        question: 'Où sont stockées les données ?',
        answer:
          'Dans la base PostgreSQL de votre instance, sur l’infrastructure que vous contrôlez. OpenTask n’envoie aucune donnée à un service tiers.',
      },
      {
        question: 'Puis-je exporter mes données ?',
        answer:
          'Pas encore depuis l’interface : un export dans un format documenté est prévu. Aujourd’hui, la sauvegarde PostgreSQL fournie (scripts de sauvegarde et de restauration) permet de récupérer l’intégralité des données.',
      },
      {
        question: 'Quelle est la licence ?',
        answer:
          'AGPL-3.0-only. Si vous proposez une version modifiée d’OpenTask comme service en ligne, vous devez en rendre le code source disponible à ses utilisateurs.',
      },
      {
        question: 'Comment contribuer ?',
        answer:
          'Lisez le guide de contribution sur GitHub, ouvrez une issue pour discuter d’une idée ou d’un bug, puis proposez une pull request. Les tests et la CI vérifient chaque changement.',
      },
      {
        question: 'Comment connecter Claude ?',
        answer:
          'Créez un jeton d’API dans votre profil OpenTask, puis ajoutez le serveur MCP à Claude Code : en local avec le transport stdio, ou à distance en HTTP avec l’en-tête Authorization. Le guide MCP donne les commandes.',
      },
      {
        question: 'Comment connecter ChatGPT ?',
        answer:
          'Pas encore : le mode développeur de ChatGPT n’accepte que des serveurs MCP distants avec OAuth (ou sans authentification), et OpenTask ne fournit pas encore de serveur d’autorisation OAuth. C’est en développement.',
      },
      {
        question: 'Quelles données un assistant peut-il lire ?',
        answer:
          'Uniquement ce que le compte associé au jeton peut voir, et seulement quand l’assistant appelle un outil : un workspace, un projet, une tâche ou une liste paginée. Ces données sont alors traitées par le fournisseur de l’assistant, selon ses conditions.',
      },
      {
        question: 'Peut-il modifier mes tâches ?',
        answer:
          'Oui si le jeton a la permission « écriture » et si l’administrateur n’a pas désactivé les écritures : créer, modifier, déplacer, assigner et commenter. Aucune suppression n’est possible via MCP.',
      },
      {
        question: 'Mon instance n’est pas accessible publiquement : est-ce un problème ?',
        answer:
          'Pas pour Claude Code en local : le serveur MCP en stdio tourne sur votre poste et appelle votre instance sur le réseau auquel vous avez accès. Un assistant hébergé dans le cloud, lui, a besoin d’une URL HTTPS publique.',
      },
    ],
  },
  footer: {
    tagline: 'Gestion de projets open source et auto-hébergeable.',
    privacy: 'Ce site n’utilise ni cookie ni outil de mesure d’audience.',
    columns: [
      {
        title: 'Produit',
        links: [
          { label: 'Fonctionnalités', href: '#features' },
          { label: 'Auto-hébergement', href: '#self-hosting' },
          { label: 'MCP', href: '#mcp' },
          { label: 'Journal des modifications', href: 'changelogUrl' },
        ],
      },
      {
        title: 'Ressources',
        links: [
          { label: 'Documentation', href: 'docsUrl' },
          { label: 'Installation', href: 'installGuideUrl' },
          { label: 'Modèle de sécurité', href: 'securityModelUrl' },
          { label: 'Feuille de route', href: 'roadmapUrl' },
        ],
      },
      {
        title: 'Projet',
        links: [
          { label: 'GitHub', href: 'repositoryUrl' },
          { label: 'Contribuer', href: 'contributingUrl' },
          { label: 'Licence AGPL-3.0', href: 'licenseUrl' },
          { label: 'Signaler un problème', href: 'issuesUrl' },
        ],
      },
    ],
  },
};
