import { type Task, UpdateTaskInputSchema } from '@opentask/contracts/tasks/task';
import { toTaskSummary } from '../../helpers/format.helper';
import { defineTool } from '../tool.types';
import { taskIdInput, workspaceIdInput } from '../tool.inputs';

const fields = UpdateTaskInputSchema.shape;

export const updateTaskTool = defineTool({
  name: 'opentask_update_task',
  title: 'Modifier une tâche',
  description:
    'Effet de bord : modifie le titre, la description, la priorité ou l’échéance d’une tâche accessible. Seuls les champs fournis changent. Pour le statut, utilisez opentask_change_task_status ; pour l’assignation, opentask_assign_task.',
  access: 'write',
  idempotent: true,
  inputSchema: {
    workspaceId: workspaceIdInput,
    taskId: taskIdInput,
    title: fields.title,
    description: fields.description,
    priority: fields.priority,
    dueDate: fields.dueDate.describe('AAAA-MM-JJ, ou null pour retirer l’échéance.'),
  },
  async run(client, { workspaceId, taskId, ...patch }) {
    const changes = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(changes).length === 0) {
      return {
        summary: 'Aucune modification demandée : la tâche est inchangée.',
        data: { changed: [] },
      };
    }
    const task = await client.patch<Task>(`/workspaces/${workspaceId}/tasks/${taskId}`, changes);
    return {
      summary: `Tâche « ${task.title} » modifiée : ${Object.keys(changes).join(', ')}.`,
      data: { changed: Object.keys(changes), task: toTaskSummary(task) },
    };
  },
});
