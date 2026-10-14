import { CheckSquare, Plus, UsersRound } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../../../shared/components/button';
import { useI18n } from '../../../shared/hooks/useI18n';
import type { ProjectVM } from '../../../shared/types/project.types';
import type { WorkspaceVM } from '../../../shared/types/workspace.types';
import { useProjectFilters } from '../hooks/useProjectFilters';
import { CreateTaskDialog } from './create-task-dialog';
import { LabelManager } from './label-manager';
import { ProjectMenu } from './project-menu';
import { ViewTabs } from './view-tabs';

export function ProjectHeader({
  workspace,
  project,
}: {
  workspace: WorkspaceVM;
  project: ProjectVM;
}) {
  const { t } = useI18n();
  const { board, setView } = useProjectFilters();
  const { canWriteTasks, canUpdateProject } = workspace.permissions;
  return (
    <header className="border-b border-line bg-surface px-4 pt-6 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.625rem] leading-tight font-bold">{project.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {project.team && (
              <Link
                to={`/w/${workspace.id}/teams/${project.team.id}`}
                className="inline-flex items-center gap-1.5 hover:text-ink"
              >
                <UsersRound aria-hidden className="size-4" />
                {project.team.name}
              </Link>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CheckSquare aria-hidden className="size-4" />
              {t('project.progress', {
                done: project.progress.done,
                total: project.progress.total,
              })}
            </span>
          </p>
          {project.description && (
            <p className="mt-2 max-w-[70ch] text-[0.9375rem]">{project.description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canWriteTasks && (
            <>
              <LabelManager projectId={project.id} labels={project.labels} />
              <CreateTaskDialog
                project={project}
                trigger={
                  <Button>
                    <Plus aria-hidden className="size-4" />
                    {t('task.createTitle')}
                  </Button>
                }
              />
            </>
          )}
          {canUpdateProject && <ProjectMenu project={project} />}
        </div>
      </div>
      <ViewTabs label={project.name} board={board} onChange={setView} />
    </header>
  );
}
