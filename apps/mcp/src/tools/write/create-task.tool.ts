import { CreateTaskInputSchema, type Task } from '@opentask/contracts/tasks/task';
import { toTaskSummary } from '../../helpers/format.helper';
import { defineTool } from '../tool.types';
import { idInput, projectIdInput, workspaceIdInput } from '../tool.inputs';

const fields = CreateTaskInputSchema.shape;

export const createTaskTool = defineTool({
  name: 'opentask_create_task',
  title: 'Créer une tâche',
  description:
    'Effet de bord : crée une tâche dans un projet accessible (permission d’écriture requise dans le workspace). Sans colonne précisée, la tâche va dans la première colonne du projet. Retourne la tâche créée.',
  access: 'write',
  inputSchema: {
    workspaceId: workspaceIdInput,
    projectId: projectIdInput,
    title: fields.title,
    description: fields.description.optional(),
    columnId: idInput('Colonne du Kanban (voir opentask_list_projects).').optional(),
    status: fields.status,
    priority: fields.priority.optional(),
    dueDate: fields.dueDate.optional().describe('Échéance au format AAAA-MM-JJ.'),
    assigneeId: fields.assigneeId.optional().describe('Membre du workspace à assigner.'),
    parentId: fields.parentId.optional().describe('Tâche parente pour créer une sous-tâche.'),
  },
  async run(client, { workspaceId, projectId, ...input }) {
    const task = await client.post<Task>(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
      input,
    );
    return {
      summary: `Tâche créée : « ${task.title} » (id ${task.id}) dans la colonne ${task.column.name}.`,
      data: { task: toTaskSummary(task) },
    };
  },
});
