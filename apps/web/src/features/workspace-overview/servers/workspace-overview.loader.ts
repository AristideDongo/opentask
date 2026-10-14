import { toMyTaskVM } from '../../../shared/mappers/task.mapper';
import { toAuditEntryVM } from '../../../shared/mappers/workspace.mapper';
import { fetchMyTasks, fetchRecentActivity } from './workspace-overview.service';

export async function workspaceOverviewLoader({ params }: { params: { workspaceId?: string } }) {
  const workspaceId = params.workspaceId ?? '';
  const [myTasks, activity] = await Promise.all([
    fetchMyTasks(workspaceId),
    fetchRecentActivity(workspaceId),
  ]);
  return {
    myTasks: myTasks.items.map(toMyTaskVM),
    activity: activity ? activity.items.map(toAuditEntryVM) : null,
  };
}
