import { TaskPrioritySchema, TaskStatusSchema } from '@opentask/contracts/tasks/status';
import { TASK_SORTS, type TaskList } from '@opentask/contracts/tasks/task';
import { z } from 'zod';
import { pageNote, paginate, taskLine, toTaskSummary } from '../../helpers/format.helper';
import { UNTRUSTED_CONTENT_NOTE } from '../../helpers/limits.const';
import { defineTool } from '../tool.types';
import { idInput, limitInput, offsetInput, projectIdInput, workspaceIdInput } from '../tool.inputs';

export const listTasksTool = defineTool({
  name: 'opentask_list_tasks',
  title: 'Tâches d’un projet',
  description: `Liste les tâches d’un projet accessible, avec filtres (statut, colonne, priorité, personne assignée, tag, texte), tri et pagination. ${UNTRUSTED_CONTENT_NOTE}`,
  access: 'read',
  inputSchema: {
    workspaceId: workspaceIdInput,
    projectId: projectIdInput,
    status: TaskStatusSchema.optional().describe(
      'Type de colonne : todo, in_progress, in_review ou done.',
    ),
    columnId: idInput('Colonne précise du Kanban.').optional(),
    priority: TaskPrioritySchema.optional(),
    assigneeId: z
      .union([idInput('Personne assignée.'), z.literal('none')])
      .optional()
      .describe('Identifiant d’un membre, ou « none » pour les tâches non assignées.'),
    labelId: idInput('Tag du projet.').optional(),
    query: z.string().trim().max(200).optional().describe('Recherche dans le titre.'),
    sort: z.enum(TASK_SORTS).default('position'),
    offset: offsetInput,
    limit: limitInput,
  },
  async run(client, input) {
    const { items } = await client.get<TaskList>(
      `/workspaces/${input.workspaceId}/projects/${input.projectId}/tasks`,
      {
        status: input.status,
        columnId: input.columnId,
        priority: input.priority,
        assigneeId: input.assigneeId,
        labelId: input.labelId,
        q: input.query,
        sort: input.sort,
      },
    );
    const page = paginate(items.map(toTaskSummary), input.offset, input.limit);
    return {
      summary: [pageNote(page, 'tâches'), ...page.items.map(taskLine)].join('\n'),
      data: {
        tasks: page.items,
        total: page.total,
        offset: page.offset,
        nextOffset: page.nextOffset,
      },
    };
  },
});
