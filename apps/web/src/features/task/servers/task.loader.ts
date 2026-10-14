import { toTaskDetailVM } from '../../../shared/mappers/task.mapper';
import { fetchMe } from '../../../shared/servers/session.service';
import { fetchTaskDetail, fetchWorkspace } from './task.service';

export async function taskLoader({
  params,
}: {
  params: { workspaceId?: string; taskId?: string };
}) {
  const workspaceId = params.workspaceId ?? '';
  const [task, workspace, me] = await Promise.all([
    fetchTaskDetail(workspaceId, params.taskId ?? ''),
    fetchWorkspace(workspaceId),
    fetchMe(),
  ]);
  return { task: toTaskDetailVM(task, { userId: me?.id ?? '', role: workspace.myRole }) };
}
