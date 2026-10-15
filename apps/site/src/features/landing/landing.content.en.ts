import type { LandingContent } from './landing.types';

export const landingEn: LandingContent = {
  locale: 'en',
  meta: {
    title: 'OpenTask — open source, self-hosted project management',
    description:
      'Organize projects, tasks and teams on your own server. OpenTask is free, open source (AGPL-3.0) and connects to AI assistants through MCP.',
  },
  skipLink: 'Skip to content',
  nav: {
    features: 'Features',
    selfHost: 'Self-hosting',
    mcp: 'MCP',
    docs: 'Documentation',
    github: 'GitHub',
    menu: 'Menu',
    language: 'Français',
  },
  status: { available: 'Available', 'in-progress': 'In development', planned: 'Planned' },
  hero: {
    eyebrow: 'Open source · AGPL-3.0',
    title: 'Teamwork, without a mandatory subscription.',
    subtitle:
      'OpenTask is an open source platform to organize projects, tasks and teams. Host it yourself, keep control of your data and connect your tools.',
    primary: 'See how to install',
    secondary: 'View on GitHub',
    facts: [
      'Open source code',
      'Self-hosted with Docker',
      'Documented API (OpenAPI)',
      'MCP server for AI assistants',
    ],
    illustrationLabel: 'Illustration of an OpenTask Kanban board (a diagram, not a screenshot)',
  },
  values: {
    title: 'Why OpenTask',
    items: [
      {
        title: 'Your data stays with you',
        body: 'Everything lives in your PostgreSQL database, on your infrastructure.',
      },
      {
        title: 'One coherent space',
        body: 'Projects, tasks, teams and discussions in a single workspace.',
      },
      {
        title: 'On your server',
        body: 'A Docker Compose install, with no mandatory proprietary service.',
      },
      {
        title: 'Connected to your tools',
        body: 'A documented REST API, API tokens and an MCP server.',
      },
      { title: 'Transparent', body: 'The code is public: audit it, adapt it and contribute.' },
    ],
  },
  features: {
    title: 'Features',
    intro:
      'What is available today, and what is coming. Nothing is presented as available unless it is.',
    items: [
      {
        title: 'Projects, tasks and subtasks',
        body: 'Break work down into projects and tasks, with subtasks, priorities, due dates and an assignee.',
        status: 'available',
      },
      {
        title: 'List and Kanban views',
        body: 'Filter and sort in a list, or drag cards across columns each project defines, with colored tags.',
        status: 'available',
      },
      {
        title: 'Comments and audit log',
        body: 'Discuss a task in comments; administrative actions are recorded in the workspace log.',
        status: 'available',
      },
      {
        title: 'Teams, roles and invitations',
        body: 'Owner, admin, member or guest: permissions are enforced by the server, not just the interface.',
        status: 'available',
      },
      {
        title: 'Real-time chat',
        body: 'Public or private channels to talk with your team, updated instantly.',
        status: 'available',
      },
      {
        title: 'API and API tokens',
        body: 'A REST API described with OpenAPI and revocable personal tokens, read-only or read-write.',
        status: 'available',
      },
      {
        title: 'AI assistants through MCP',
        body: 'Ask a compatible assistant to look up or update the tasks you have access to.',
        status: 'available',
      },
      {
        title: 'Notifications',
        body: 'In-app and email alerts for assignments and due dates.',
        status: 'planned',
      },
      {
        title: 'Data export',
        body: 'A full export in a documented format. Today, the PostgreSQL backup is the way to extract data.',
        status: 'planned',
      },
      {
        title: 'Global search',
        body: 'Search across the workspace; today, search covers task titles.',
        status: 'planned',
      },
      {
        title: 'Webhooks',
        body: 'Notify your tools whenever something important changes.',
        status: 'planned',
      },
    ],
  },
  selfHost: {
    title: 'Your data, your infrastructure',
    intro:
      'OpenTask installs on your server with Docker Compose: the application, the API and PostgreSQL stay with you.',
    points: [
      'PostgreSQL backup and restore with provided, tested scripts.',
      'Automatic HTTPS with Caddy, or behind your own reverse proxy.',
      'No mandatory third-party service; emails go through the SMTP server of your choice.',
    ],
    responsibilities:
      'Self-hosting also means owning the instance: updates, HTTPS certificates, secrets, backups and restore tests. Self-hosting does not make an installation secure on its own.',
    cta: 'Read the installation guide',
    backup: 'Backup and restore',
  },
  mcp: {
    title: 'OpenTask + AI assistants',
    intro:
      'The OpenTask MCP server lets a compatible assistant work with your OpenTask data, with your permissions and nothing more.',
    examples: [
      '“List my overdue tasks.”',
      '“Summarize this project’s progress.”',
      '“Create a task in this project.”',
      '“Move this task to the Done column.”',
      '“Add a comment to this task.”',
    ],
    guarantees: [
      'The assistant uses a personal API token you can revoke at any time.',
      'It only sees the workspaces you belong to; the API checks every call.',
      'Writes require a token with the write permission and can be disabled by the administrator.',
      'No delete tool is exposed.',
    ],
    clients: [
      {
        name: 'Claude Code',
        status: 'available',
        detail:
          'Locally (stdio) or remotely (HTTP with a token). Tested with the official MCP client.',
      },
      {
        name: 'ChatGPT',
        status: 'in-progress',
        detail: 'ChatGPT developer mode requires OAuth, which the MCP server does not offer yet.',
      },
    ],
    cta: 'Read the MCP guide',
  },
  install: {
    title: 'Installation',
    intro: 'On a Linux server with Docker and Docker Compose v2:',
    prerequisites: [
      'Set at least PUBLIC_URL, POSTGRES_PASSWORD and AUTH_SECRET in infra/docker/.env.prod.',
      'A domain name and an SMTP account are recommended for HTTPS and emails.',
    ],
    copy: 'Copy commands',
    copied: 'Commands copied',
    cta: 'Full installation guide',
  },
  community: {
    title: 'Community',
    intro:
      'OpenTask is built in the open. Every contribution is welcome, from bug reports to code.',
    links: [
      { label: 'GitHub repository', href: 'repositoryUrl' },
      { label: 'Contribution guide', href: 'contributingUrl' },
      { label: 'Report a bug or suggest an idea', href: 'newIssueUrl' },
      { label: 'Roadmap', href: 'roadmapUrl' },
      { label: 'Known limitations', href: 'limitationsUrl' },
    ],
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      {
        question: 'Is OpenTask free?',
        answer:
          'Yes. The software is released under the AGPL-3.0 license, with no paid edition and no limit on projects, tasks or members. You only pay for the hosting you choose.',
      },
      {
        question: 'Can I host it myself?',
        answer:
          'Yes, that is how it is meant to run: a Docker Compose install on your server, with optional automatic HTTPS. The installation guide lists the requirements.',
      },
      {
        question: 'Where is my data stored?',
        answer:
          'In your instance’s PostgreSQL database, on infrastructure you control. OpenTask sends no data to any third-party service.',
      },
      {
        question: 'Can I export my data?',
        answer:
          'Not from the interface yet: an export in a documented format is planned. Today, the provided PostgreSQL backup and restore scripts let you retrieve all of your data.',
      },
      {
        question: 'What is the license?',
        answer:
          'AGPL-3.0-only. If you offer a modified version of OpenTask as an online service, you must make its source code available to its users.',
      },
      {
        question: 'How can I contribute?',
        answer:
          'Read the contribution guide on GitHub, open an issue to discuss an idea or a bug, then send a pull request. Tests and CI check every change.',
      },
      {
        question: 'How do I connect Claude?',
        answer:
          'Create an API token in your OpenTask profile, then add the MCP server to Claude Code: locally with the stdio transport, or remotely over HTTP with an Authorization header. The MCP guide gives the commands.',
      },
      {
        question: 'How do I connect ChatGPT?',
        answer:
          'Not yet: ChatGPT developer mode only accepts remote MCP servers with OAuth (or without authentication), and OpenTask does not provide an OAuth authorization server yet. It is in development.',
      },
      {
        question: 'What data can an assistant read?',
        answer:
          'Only what the account behind the token can see, and only when the assistant calls a tool: a workspace, a project, a task or a paginated list. That data is then processed by the assistant’s provider, under its terms.',
      },
      {
        question: 'Can it change my tasks?',
        answer:
          'Yes if the token has the write permission and the administrator has not disabled writes: create, edit, move, assign and comment. Nothing can be deleted through MCP.',
      },
      {
        question: 'My instance is not publicly reachable: is that a problem?',
        answer:
          'Not for Claude Code locally: the stdio MCP server runs on your machine and calls your instance on the network you can reach. A cloud-hosted assistant, however, needs a public HTTPS URL.',
      },
    ],
  },
  footer: {
    tagline: 'Open source, self-hosted project management.',
    privacy: 'This site uses no cookies and no analytics.',
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '#features' },
          { label: 'Self-hosting', href: '#self-hosting' },
          { label: 'MCP', href: '#mcp' },
          { label: 'Changelog', href: 'changelogUrl' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'Documentation', href: 'docsUrl' },
          { label: 'Installation', href: 'installGuideUrl' },
          { label: 'Security model', href: 'securityModelUrl' },
          { label: 'Roadmap', href: 'roadmapUrl' },
        ],
      },
      {
        title: 'Project',
        links: [
          { label: 'GitHub', href: 'repositoryUrl' },
          { label: 'Contribute', href: 'contributingUrl' },
          { label: 'AGPL-3.0 license', href: 'licenseUrl' },
          { label: 'Report an issue', href: 'issuesUrl' },
        ],
      },
    ],
  },
};
