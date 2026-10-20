import { CreateCommentInputSchema, type TaskComment } from '@opentask/contracts/tasks/comment';
import { toCommentView } from '../../helpers/format.helper';
import { defineTool } from '../tool.types';
import { taskIdInput, workspaceIdInput } from '../tool.inputs';

export const addCommentTool = defineTool({
  name: 'opentask_add_comment',
  title: 'Commenter une tâche',
  description:
    'Effet de bord : ajoute un commentaire, signé par l’utilisateur connecté, à une tâche accessible. Le commentaire est visible par les membres du workspace. Pour mentionner (et prévenir) un membre, écrivez <@id> avec son identifiant, par exemple celui de la personne assignée.',
  access: 'write',
  inputSchema: {
    workspaceId: workspaceIdInput,
    taskId: taskIdInput,
    body: CreateCommentInputSchema.shape.body,
  },
  async run(client, { workspaceId, taskId, body }) {
    const comment = await client.post<TaskComment>(
      `/workspaces/${workspaceId}/tasks/${taskId}/comments`,
      { body },
    );
    return {
      summary: `Commentaire ajouté (id ${comment.id}).`,
      data: { taskId, comment: toCommentView(comment) },
    };
  },
});
