import type { Task } from '@opentask/contracts/tasks/task';
import { toTaskSummary } from '../../helpers/format.helper';
import { defineTool } from '../tool.types';
import { idInput, taskIdInput, workspaceIdInput } from '../tool.inputs';

export const assignTaskTool = defineTool({
  name: 'opentask_assign_task',
  title: 'Assigner une tâche',
  description:
    'Effet de bord : assigne une tâche à un membre du workspace, ou retire l’assignation avec assigneeId null. Le serveur refuse une personne qui n’est pas membre du workspace.',
  access: 'write',
  idempotent: true,
  inputSchema: {
    workspaceId: workspaceIdInput,
    taskId: taskIdInput,
    assigneeId: idInput('Identifiant du membre à assigner.').nullable(),
  },
  async run(client, { workspaceId, taskId, assigneeId }) {
    const task = await client.patch<Task>(`/workspaces/${workspaceId}/tasks/${taskId}`, {
      assigneeId,
    });
    return {
      summary: task.assignee
        ? `Tâche « ${task.title} » assignée à ${task.assignee.name}.`
        : `Tâche « ${task.title} » désormais non assignée.`,
      data: { task: toTaskSummary(task) },
    };
  },
});
