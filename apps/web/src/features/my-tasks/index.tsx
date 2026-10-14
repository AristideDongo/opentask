import { useLoaderData } from 'react-router';
import { PageHeader } from '../../shared/components/page-header';
import { useI18n } from '../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../shared/hooks/useWorkspaceData';
import { TaskGroupSection } from './components/task-group-section';
import { myTasksLoader } from './servers/my-tasks.loader';

export const clientLoader = myTasksLoader;

export default function MyTasksPage() {
  const { count, groups } = useLoaderData<typeof myTasksLoader>();
  const { workspace } = useWorkspaceData();
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t('myTasks.title')}>{t('myTasks.intro')}</PageHeader>
      {count === 0 ? (
        <p className="text-muted">{t('myTasks.empty')}</p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <TaskGroupSection key={group.key} workspaceId={workspace.id} group={group} />
          ))}
        </div>
      )}
    </>
  );
}
