import { Outlet, useLoaderData } from 'react-router';
import { useI18n } from '../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../shared/hooks/useWorkspaceData';
import { KanbanBoard } from './components/kanban-board';
import { ListView } from './components/list-view';
import { ProjectHeader } from './components/project-header';
import { ProjectToolbar } from './components/project-toolbar';
import { QuickAdd } from './components/quick-add';
import { useOptimisticTasks } from './hooks/useOptimisticTasks';
import { useProjectFilters } from './hooks/useProjectFilters';
import { projectLoader, projectShouldRevalidate } from './servers/project.loader';

export const handle = { fullWidth: true };
export const clientLoader = projectLoader;
export const shouldRevalidate = projectShouldRevalidate;

export default function ProjectPage() {
  const { project, tasks: loaded } = useLoaderData<typeof projectLoader>();
  const { workspace } = useWorkspaceData();
  const { t } = useI18n();
  const { board } = useProjectFilters();
  const [tasks, setTasks] = useOptimisticTasks(loaded);
  const { canWriteTasks, canUpdateProject } = workspace.permissions;

  return (
    <div className="flex h-full min-h-dvh flex-col lg:min-h-0">
      <ProjectHeader workspace={workspace} project={project} />
      <ProjectToolbar key={project.id} project={project} />
      <div className="flex-1 overflow-auto px-4 py-5 sm:px-8">
        {canWriteTasks ? (
          <QuickAdd projectId={project.id} />
        ) : (
          <p className="mb-4 text-sm text-muted">{t('task.readOnly')}</p>
        )}
        {board ? (
          <KanbanBoard
            project={project}
            tasks={tasks}
            setTasks={setTasks}
            canWrite={canWriteTasks}
            canManageColumns={canUpdateProject}
          />
        ) : (
          <ListView project={project} tasks={tasks} setTasks={setTasks} canWrite={canWriteTasks} />
        )}
      </div>
      <Outlet />
    </div>
  );
}
