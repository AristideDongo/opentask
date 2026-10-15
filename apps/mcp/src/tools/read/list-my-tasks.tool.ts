import type { MyTaskList } from '@opentask/contracts/tasks/task';
import { z } from 'zod';
import {
  isOverdue,
  pageNote,
  paginate,
  taskLine,
  todayIso,
  toTaskSummary,
} from '../../helpers/format.helper';
import { UNTRUSTED_CONTENT_NOTE } from '../../helpers/limits.const';
import { defineTool } from '../tool.types';
import { limitInput, offsetInput, workspaceIdInput } from '../tool.inputs';

export const listMyTasksTool = defineTool({
  name: 'opentask_list_my_tasks',
  title: 'Mes tâches',
  description: `Liste les tâches ouvertes assignées à l’utilisateur dans un workspace, triées par échéance. Option overdueOnly pour ne garder que les tâches en retard. ${UNTRUSTED_CONTENT_NOTE}`,
  access: 'read',
  inputSchema: {
    workspaceId: workspaceIdInput,
    overdueOnly: z
      .boolean()
      .default(false)
      .describe('Ne retourner que les tâches dont l’échéance est dépassée.'),
    offset: offsetInput,
    limit: limitInput,
  },
  async run(client, { workspaceId, overdueOnly, offset, limit }) {
    const { items } = await client.get<MyTaskList>(`/workspaces/${workspaceId}/my-tasks`);
    const today = todayIso();
    const tasks = items
      .filter((task) => !overdueOnly || isOverdue(task, today))
      .map((task) => ({
        ...toTaskSummary(task),
        projectName: task.projectName,
        overdue: isOverdue(task, today),
      }));
    const page = paginate(tasks, offset, limit);
    return {
      summary: [
        pageNote(page, overdueOnly ? 'tâches en retard' : 'tâches'),
        ...page.items.map(taskLine),
      ].join('\n'),
      data: {
        tasks: page.items,
        total: page.total,
        offset: page.offset,
        nextOffset: page.nextOffset,
        today,
      },
    };
  },
});
