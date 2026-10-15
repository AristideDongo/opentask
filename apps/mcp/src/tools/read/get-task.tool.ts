import type { TaskDetail } from '@opentask/contracts/tasks/task';
import { toTaskDetailView } from '../../helpers/format.helper';
import { UNTRUSTED_CONTENT_NOTE } from '../../helpers/limits.const';
import { defineTool } from '../tool.types';
import { taskIdInput, workspaceIdInput } from '../tool.inputs';

export const getTaskTool = defineTool({
  name: 'opentask_get_task',
  title: 'Détail d’une tâche',
  description: `Retourne le détail d’une tâche accessible : description (tronquée à 2 000 caractères), colonne, priorité, échéance, personne assignée, tags et sous-tâches. ${UNTRUSTED_CONTENT_NOTE}`,
  access: 'read',
  inputSchema: { workspaceId: workspaceIdInput, taskId: taskIdInput },
  async run(client, { workspaceId, taskId }) {
    const task = await client.get<TaskDetail>(`/workspaces/${workspaceId}/tasks/${taskId}`);
    return {
      summary: `« ${task.title} » dans ${task.projectName}, colonne ${task.column.name}, priorité ${task.priority}${task.dueDate ? `, échéance ${task.dueDate}` : ''}.`,
      data: { task: toTaskDetailView(task) },
    };
  },
});
