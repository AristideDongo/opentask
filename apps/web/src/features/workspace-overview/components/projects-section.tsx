import { FolderKanban, Plus, UserPlus } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../../../shared/components/button';
import { CreateProjectDialog } from '../../../shared/components/create-project-dialog';
import { Section } from '../../../shared/components/section';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ProjectVM } from '../../../shared/types/project.types';
import type { WorkspaceVM } from '../../../shared/types/workspace.types';

export function ProjectsSection({
  workspace,
  projects,
}: {
  workspace: WorkspaceVM;
  projects: ProjectVM[];
}) {
  const { t } = useI18n();
  const base = `/w/${workspace.id}`;
  return (
    <Section title={t('home.projects')}>
      {projects.length === 0 ? (
        <p className="text-muted">{t('home.noProjects')}</p>
      ) : (
        <ul className="divide-y divide-line">
          {projects.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <Link
                to={`${base}/p/${p.id}`}
                className="inline-flex min-w-0 flex-1 items-center gap-2 font-semibold hover:underline"
              >
                <FolderKanban aria-hidden className="size-4 shrink-0 text-muted" />
                <span className="truncate">{p.name}</span>
              </Link>
              {p.team && <span className="text-sm text-muted">{p.team.name}</span>}
              <span className="flex w-48 items-center gap-2">
                <span
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={p.progress.total}
                  aria-valuenow={p.progress.done}
                  aria-label={t('project.progress', {
                    done: p.progress.done,
                    total: p.progress.total,
                  })}
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken"
                >
                  <span
                    className="block h-full bg-accent"
                    style={{
                      width: p.progress.total
                        ? `${(p.progress.done / p.progress.total) * 100}%`
                        : 0,
                    }}
                  />
                </span>
                <span className="text-xs text-muted tabular-nums">
                  {p.progress.done}/{p.progress.total}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        {workspace.permissions.canCreateProject && (
          <CreateProjectDialog
            trigger={
              <Button variant="secondary">
                <Plus aria-hidden className="size-4" />
                {t('nav.newProject')}
              </Button>
            }
          />
        )}
        {workspace.permissions.canInvite && workspace.memberCount < 2 && (
          <Link
            to={`${base}/members`}
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] px-4 font-semibold text-accent hover:bg-sunken"
          >
            <UserPlus aria-hidden className="size-4" />
            {t('home.inviteCta')}
          </Link>
        )}
      </div>
    </Section>
  );
}
