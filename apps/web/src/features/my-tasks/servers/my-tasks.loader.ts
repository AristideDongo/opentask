import { toMyTaskVM } from '../../../shared/mappers/task.mapper';
import { toTaskGroups } from '../mappers/task-group.mapper';
import { fetchMyTasks } from './my-tasks.service';

export async function myTasksLoader({ params }: { params: { workspaceId?: string } }) {
  const { items } = await fetchMyTasks(params.workspaceId ?? '');
  const tasks = items.map(toMyTaskVM);
  return { count: tasks.length, groups: toTaskGroups(tasks) };
}
