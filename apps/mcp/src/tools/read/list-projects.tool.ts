import type { ProjectList } from '@opentask/contracts/projects/project';
import { defineTool } from '../tool.types';
import { workspaceIdInput } from '../tool.inputs';

export const listProjectsTool = defineTool({
  name: 'opentask_list_projects',
  title: 'Projets d’un workspace',
  description:
    'Liste les projets d’un workspace accessible, avec leurs colonnes de Kanban, tags et compteurs de tâches.',
  access: 'read',
  inputSchema: { workspaceId: workspaceIdInput },
  async run(client, { workspaceId }) {
    const { items } = await client.get<ProjectList>(`/workspaces/${workspaceId}/projects`);
    const projects = items.map((p) => ({
      id: p.id,
      name: p.name,
      team: p.team?.name ?? null,
      columns: p.columns.map((c) => ({ id: c.id, name: c.name, category: c.category })),
      labels: p.labels.map((l) => ({ id: l.id, name: l.name })),
      taskCounts: p.taskCounts,
    }));
    return {
      summary: projects.length
        ? projects.map((p) => `- ${p.name} (id ${p.id})`).join('\n')
        : 'Aucun projet dans ce workspace.',
      data: { projects },
    };
  },
});
