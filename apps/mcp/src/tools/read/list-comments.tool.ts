import type { TaskDetail } from '@opentask/contracts/tasks/task';
import { pageNote, paginate, toCommentView } from '../../helpers/format.helper';
import { UNTRUSTED_CONTENT_NOTE } from '../../helpers/limits.const';
import { defineTool } from '../tool.types';
import { limitInput, offsetInput, taskIdInput, workspaceIdInput } from '../tool.inputs';

export const listCommentsTool = defineTool({
  name: 'opentask_list_comments',
  title: 'Commentaires d’une tâche',
  description: `Liste les commentaires d’une tâche accessible, du plus ancien au plus récent (chaque commentaire est tronqué à 1 000 caractères). ${UNTRUSTED_CONTENT_NOTE}`,
  access: 'read',
  inputSchema: {
    workspaceId: workspaceIdInput,
    taskId: taskIdInput,
    offset: offsetInput,
    limit: limitInput,
  },
  async run(client, { workspaceId, taskId, offset, limit }) {
    const task = await client.get<TaskDetail>(`/workspaces/${workspaceId}/tasks/${taskId}`);
    const page = paginate(task.comments.map(toCommentView), offset, limit);
    return {
      summary: pageNote(page, 'commentaires'),
      data: {
        taskId,
        comments: page.items,
        total: page.total,
        offset: page.offset,
        nextOffset: page.nextOffset,
      },
    };
  },
});
