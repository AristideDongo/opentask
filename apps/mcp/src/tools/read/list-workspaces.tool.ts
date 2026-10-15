import type { WorkspaceList } from '@opentask/contracts/workspaces/workspace';
import { defineTool } from '../tool.types';

export const listWorkspacesTool = defineTool({
  name: 'opentask_list_workspaces',
  title: 'Workspaces accessibles',
  description: 'Liste les workspaces dont l’utilisateur est membre, avec son rôle dans chacun.',
  access: 'read',
  inputSchema: {},
  async run(client) {
    const { items } = await client.get<WorkspaceList>('/workspaces');
    const workspaces = items.map((w) => ({
      id: w.id,
      name: w.name,
      role: w.myRole,
      memberCount: w.memberCount,
    }));
    return {
      summary: workspaces.length
        ? workspaces.map((w) => `- ${w.name} (id ${w.id}, rôle ${w.role})`).join('\n')
        : 'Aucun workspace accessible.',
      data: { workspaces },
    };
  },
});
