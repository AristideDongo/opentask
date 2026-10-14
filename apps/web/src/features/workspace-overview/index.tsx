import { useLoaderData } from 'react-router';
import { ActivityList } from '../../shared/components/activity-list';
import { PageHeader } from '../../shared/components/page-header';
import { RoleBadge } from '../../shared/components/role-badge';
import { Section } from '../../shared/components/section';
import { useI18n } from '../../shared/hooks/useI18n';
import { useWorkspaceData } from '../../shared/hooks/useWorkspaceData';
import { DiscussionsSection } from './components/discussions-section';
import { MyTasksSection } from './components/my-tasks-section';
import { ProjectsSection } from './components/projects-section';
import { workspaceOverviewLoader } from './servers/workspace-overview.loader';

export const clientLoader = workspaceOverviewLoader;

export default function WorkspaceOverviewPage() {
  const { myTasks, activity } = useLoaderData<typeof workspaceOverviewLoader>();
  const { workspace, projects, channels } = useWorkspaceData();
  const { t } = useI18n();

  return (
    <>
      <PageHeader title={workspace.name}>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <RoleBadge role={workspace.role} />
          <span>{t(`role.${workspace.role}.help`)}</span>
        </span>
      </PageHeader>
      <div className="space-y-6">
        <ProjectsSection workspace={workspace} projects={projects} />
        <div className="grid gap-6 md:grid-cols-2">
          <MyTasksSection workspaceId={workspace.id} tasks={myTasks} />
          <DiscussionsSection workspaceId={workspace.id} channels={channels} />
        </div>
        {activity && (
          <Section title={t('home.activity')}>
            {activity.length === 0 ? (
              <p className="text-muted">{t('home.noActivity')}</p>
            ) : (
              <ActivityList entries={activity} />
            )}
          </Section>
        )}
      </div>
    </>
  );
}
