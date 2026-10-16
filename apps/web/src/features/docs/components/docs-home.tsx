import { ArrowRight, BookOpen, Bot, Code2, Server } from 'lucide-react';
import { Link } from 'react-router';
import { docPath } from '../mappers/doc-path.mapper';

const SECTIONS = [
  {
    icon: BookOpen,
    title: 'Guide utilisateur',
    body: 'Workspaces, rôles, projets, tâches, vues Liste et Kanban, discussion, jetons d’API.',
    slug: 'user/getting-started',
  },
  {
    icon: Bot,
    title: 'MCP et assistants IA',
    body: 'Connecter Claude Code à OpenTask, outils disponibles, sécurité et dépannage.',
    slug: 'mcp',
  },
  {
    icon: Server,
    title: 'Installation et administration',
    body: 'Docker Compose, configuration, HTTPS, sauvegardes, mises à jour.',
    slug: 'deployment/installation',
  },
  {
    icon: Code2,
    title: 'Développeurs',
    body: 'API REST, jetons, OpenAPI, architecture, décisions et contribution.',
    slug: 'developers/api',
  },
];

const MCP_STEPS = [
  {
    title: 'Créez un jeton d’API',
    body: 'Profil → Jetons d’API, permission lecture ou écriture.',
    slug: 'user/api-tokens',
  },
  {
    title: 'Ajoutez le serveur à Claude Code',
    body: 'En local (stdio) ou à distance (HTTP avec le jeton).',
    slug: 'mcp/claude',
  },
  {
    title: 'Demandez à l’assistant',
    body: '« Liste mes tâches en retard », « Crée une tâche… ».',
    slug: 'mcp/tools',
  },
];

export function DocsHome() {
  return (
    <div className="space-y-14">
      <section>
        <p className="text-sm font-semibold text-accent">Documentation</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Tout pour utiliser, installer et connecter OpenTask
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Commencez par l’introduction, installez votre instance, ou connectez votre assistant IA à
          vos projets avec le serveur MCP.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={docPath('guide/introduction')}
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] bg-accent px-4 font-semibold text-accent-ink hover:bg-accent-hover"
          >
            Commencer
            <ArrowRight aria-hidden className="size-4" />
          </Link>
          <Link
            to={docPath('mcp')}
            className="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-line bg-surface px-4 font-semibold hover:bg-sunken"
          >
            Guide MCP
          </Link>
        </div>
      </section>
      <section aria-labelledby="sections-title">
        <h2 id="sections-title" className="sr-only">
          Rubriques
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {SECTIONS.map(({ icon: Icon, title, body, slug }) => (
            <li key={slug}>
              <Link
                to={docPath(slug)}
                className="block h-full rounded-[var(--radius-panel)] border border-line bg-surface p-5 transition-colors hover:border-accent"
              >
                <Icon aria-hidden className="size-6 text-accent" />
                <span className="mt-3 block font-semibold">{title}</span>
                <span className="mt-1 block text-sm text-muted">{body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section
        aria-labelledby="mcp-steps-title"
        className="rounded-[var(--radius-panel)] border border-line bg-surface p-6"
      >
        <h2 id="mcp-steps-title" className="text-xl font-bold">
          Utiliser OpenTask avec un assistant IA en 3 étapes
        </h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {MCP_STEPS.map((step, index) => (
            <li key={step.slug}>
              <Link to={docPath(step.slug)} className="group block">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent-soft font-bold text-accent">
                  {index + 1}
                </span>
                <span className="mt-3 block font-semibold group-hover:text-accent">
                  {step.title}
                </span>
                <span className="mt-1 block text-sm text-muted">{step.body}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
