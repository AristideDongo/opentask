import { TaskStatusSchema } from '@opentask/contracts/tasks/status';
import type { Task } from '@opentask/contracts/tasks/task';
import { toTaskSummary } from '../../helpers/format.helper';
import { defineTool } from '../tool.types';
import { idInput, taskIdInput, workspaceIdInput } from '../tool.inputs';

export const changeTaskStatusTool = defineTool({
  name: 'opentask_change_task_status',
  title: 'Changer le statut d’une tâche',
  description:
    'Effet de bord : déplace une tâche vers une colonne du Kanban de son projet (columnId), ou vers la première colonne d’un type (status : todo, in_progress, in_review, done). Fournir l’un des deux. Une colonne de type done marque la tâche comme terminée.',
  access: 'write',
  idempotent: true,
  inputSchema: {
    workspaceId: workspaceIdInput,
    taskId: taskIdInput,
    columnId: idInput('Colonne cible (voir opentask_list_projects).').optional(),
    status: TaskStatusSchema.optional(),
  },
  async run(client, { workspaceId, taskId, columnId, status }) {
    if (!columnId && !status) {
      return {
        summary: 'Indiquez columnId ou status : la tâche est inchangée.',
        data: { changed: [] },
      };
    }
    const task = await client.patch<Task>(
      `/workspaces/${workspaceId}/tasks/${taskId}`,
      columnId ? { columnId } : { status },
    );
    return {
      summary: `Tâche « ${task.title} » déplacée dans la colonne ${task.column.name} (${task.status}).`,
      data: { task: toTaskSummary(task) },
    };
  },
});
